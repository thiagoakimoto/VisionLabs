import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import os from 'os'; // Importante para Vercel
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração de limites para uploads grandes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY
});

// --- FUNÇÕES UTILITÁRIAS ---

function convertGoogleDriveUrl(url) {
  const patterns = [
    /drive\.google\.com\/file\/d\/([^\/]+)/,
    /drive\.google\.com\/open\?id=([^&]+)/,
    /drive\.google\.com\/uc\?id=([^&]+)/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return `https://drive.google.com/uc?export=download&id=${match[1]}`;
  }
  return url;
}

async function downloadImage(imageUrl) {
  return new Promise((resolve, reject) => {
    const url = convertGoogleDriveUrl(imageUrl);
    const client = url.startsWith('https') ? https : http;
    client.get(url, { headers: { 'User-Agent': 'Node.js' } }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadImage(response.headers.location).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Erro HTTP ${response.statusCode}`));
        return;
      }
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function processImageInput(inputImage) {
  if (inputImage.startsWith('http://') || inputImage.startsWith('https://')) {
    console.log('📥 Baixando imagem...');
    return await downloadImage(inputImage);
  }
  return Buffer.from(inputImage.replace(/^data:image\/\w+;base64,/, ''), 'base64');
}

// Correção para Vercel: Usar /tmp do sistema
function getTempFilePath(extension) {
  return path.join(os.tmpdir(), `file_${Date.now()}.${extension}`);
}

function cleanupFile(filePath) {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (e) { console.error('Erro cleanup:', e.message); }
}

// --- ROTAS ---

app.post('/edit-image', async (req, res) => {
  try {
    const { inputImage, prompt, returnFormat = 'base64' } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt obrigatório' });

    console.log('[IMG] Iniciando:', prompt);

    let parts = [{ text: prompt }];

    if (inputImage) {
      const imageBuffer = await processImageInput(inputImage);
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: imageBuffer.toString('base64')
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ role: 'user', parts: parts }]
    });

    const candidate = response.candidates?.[0]?.content?.parts;
    if (!candidate) throw new Error('Sem resposta da IA');

    for (const part of candidate) {
      if (part.inlineData) {
        const imageData = part.inlineData.data;
        if (returnFormat === 'file') {
          const buffer = Buffer.from(imageData, 'base64');
          res.setHeader('Content-Type', 'image/png');
          res.setHeader('Content-Disposition', 'attachment; filename="edited.png"');
          return res.send(buffer);
        } else {
          return res.json({ success: true, image: `data:image/png;base64,${imageData}` });
        }
      }
    }
    
    // Fallback de erro
    const textPart = candidate.find(p => p.text);
    throw new Error(textPart ? `IA Recusou: ${textPart.text}` : 'Erro desconhecido');

  } catch (error) {
    console.error('[IMG] Erro:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/generate-video', async (req, res) => {
  // Define caminho seguro no /tmp
  const tempVideoPath = getTempFilePath('mp4');

  try {
    const { inputImage, prompt } = req.body;
    if (!inputImage || !prompt) return res.status(400).json({ error: 'Dados incompletos' });

    console.log('[VIDEO] Prompt:', prompt);
    const imageBuffer = await processImageInput(inputImage);

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-generate-preview',
      prompt: prompt,
      image: {
        imageBytes: imageBuffer.toString('base64'),
        mimeType: 'image/png'
      }
    });

    console.log('[VIDEO] Renderizando...');

    // Loop de espera
    // ATENÇÃO: Na Vercel Grátis isso vai falhar se passar de 10s
    let attempts = 0;
    const maxAttempts = 12; // 60s max (Limite Vercel Pro)
    
    while (!operation.done) {
      if (attempts >= maxAttempts) throw new Error('Timeout da Vercel atingido (60s)');
      attempts++;
      await new Promise((resolve) => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation });
    }

    console.log('[VIDEO] Download...');
    await ai.files.download({
      file: operation.response.generatedVideos[0].video,
      downloadPath: tempVideoPath
    });

    // Stream de resposta
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');
    
    const stream = fs.createReadStream(tempVideoPath);
    stream.pipe(res);
    stream.on('end', () => cleanupFile(tempVideoPath));
    stream.on('error', () => cleanupFile(tempVideoPath));

  } catch (error) {
    console.error('[VIDEO] Erro:', error.message);
    cleanupFile(tempVideoPath);
    if (!res.headersSent) res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => res.json({ status: 'Online', service: 'Gemini Middleware' }));

// Inicialização local vs Exportação Vercel
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => console.log(`Rodando em http://localhost:${PORT}`));
}

export default app;
import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Aumentei um pouco o limite por segurança para vídeos/imagens 4k
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY
});

function convertGoogleDriveUrl(url) {
  const patterns = [
    /drive\.google\.com\/file\/d\/([^\/]+)/,
    /drive\.google\.com\/open\?id=([^&]+)/,
    /drive\.google\.com\/uc\?id=([^&]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return `https://drive.google.com/uc?export=download&id=${match[1]}`;
    }
  }
  return url;
}

async function downloadImage(imageUrl) {
  return new Promise((resolve, reject) => {
    const url = convertGoogleDriveUrl(imageUrl);
    const client = url.startsWith('https') ? https : http;

    client.get(url, { headers: { 'User-Agent': 'Node.js' } }, (response) => {
      // Seguir redirects (Google Drive faz muito isso)
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadImage(response.headers.location).then(resolve).catch(reject);
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Erro ao baixar imagem: HTTP ${response.statusCode}`));
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
    console.log('📥 Baixando imagem da URL:', inputImage);
    const imageBuffer = await downloadImage(inputImage);
    console.log('✓ Imagem baixada');
    return imageBuffer;
  }
  
  console.log('📝 Processando imagem Base64');
  // Remove prefixo se existir (ex: data:image/png;base64,...)
  const base64Data = inputImage.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

function ensureTempDir() {
  const tempDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  return tempDir;
}

function cleanupFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Arquivo removido: ${filePath}`);
    }
  } catch (error) {
    console.error(`Erro ao remover: ${error.message}`);
  }
}

// ==========================================
// ROTA 1: EDIÇÃO DE IMAGEM
// ==========================================
app.post('/edit-image', async (req, res) => {
  try {
    const { inputImage, prompt, returnFormat = 'base64' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Campo "prompt" é obrigatório' });
    }

    console.log('=== Editando Imagem (Gemini 2.5 Flash Image) ===');
    console.log('Prompt:', prompt);

    // Estrutura de Parts para Multimodal
    let parts = [
      { text: prompt }
    ];

    if (inputImage) {
      console.log('📥 Processando imagem para input...');
      const imageBuffer = await processImageInput(inputImage);
      
      // ADICIONANDO A IMAGEM CORRETAMENTE AO ARRAY DE PARTS
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: imageBuffer.toString('base64') // Importante: Converter Buffer para String Base64
        }
      });
    }

    // Chamada corrigida para structure Multimodal
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [
        {
            role: 'user',
            parts: parts
        }
      ]
    });

    // Parse da resposta
    const candidate = response.candidates?.[0]?.content?.parts;
    
    if (!candidate) throw new Error('Sem candidatos na resposta da IA');

    for (const part of candidate) {
      if (part.inlineData) {
        console.log('✓ Imagem gerada!');
        const imageData = part.inlineData.data; // Isso vem como base64 string da API

        if (returnFormat === 'file') {
          const buffer = Buffer.from(imageData, 'base64');
          res.setHeader('Content-Type', 'image/png');
          res.setHeader('Content-Disposition', 'attachment; filename="generated_image.png"');
          return res.send(buffer);
        } else {
          return res.json({
            success: true,
            image: `data:image/png;base64,${imageData}`,
            format: 'base64'
          });
        }
      }
    }

    // Se chegou aqui, provavelmente retornou só texto (erro ou recusa)
    const textPart = candidate.find(p => p.text);
    if (textPart) {
        throw new Error(`Modelo retornou apenas texto (possível recusa): ${textPart.text}`);
    }

    throw new Error('Nenhuma imagem foi gerada');

  } catch (error) {
    console.error('❌ ERRO:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Erro ao processar requisição',
        message: error.message
      });
    }
  }
});

// ==========================================
// ROTA 2: GERAÇÃO DE VÍDEO
// ==========================================
app.post('/generate-video', async (req, res) => {
  const tempVideoPath = path.join(ensureTempDir(), `video_${Date.now()}.mp4`);

  try {
    const { inputImage, prompt } = req.body;

    if (!inputImage) return res.status(400).json({ error: 'Campo "inputImage" é obrigatório' });
    if (!prompt) return res.status(400).json({ error: 'Campo "prompt" é obrigatório' });

    console.log('=== Gerando Vídeo (Veo 3.1) ===');
    console.log('Prompt:', prompt);

    const imageBuffer = await processImageInput(inputImage);

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-generate-preview',
      prompt: prompt,
      image: {
        imageBytes: imageBuffer.toString('base64'), // Convertendo Buffer para Base64 string
        mimeType: 'image/png'
      }
    });

    console.log('✓ Operação iniciada');
    console.log('⏳ Aguardando vídeo...');

    let attempts = 0;
    const maxAttempts = 10; // REDUZIDO: 10 * 5s = 50 segundos (limite Vercel)

    while (!operation.done && attempts < maxAttempts) {
      attempts++;
      process.stdout.write("."); // Feedback visual de que não travou
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Polling a cada 5s
      operation = await ai.operations.getVideosOperation({ operation });
    }
    console.log(''); // Quebra linha

    if (!operation.done) throw new Error('Timeout: Vídeo não gerado a tempo');
    if (!operation.response?.generatedVideos?.[0]?.video) throw new Error('Vídeo não retornado na resposta');

    console.log('✓ Vídeo gerado! Baixando...');

    await ai.files.download({
      file: operation.response.generatedVideos[0].video,
      downloadPath: tempVideoPath
    });

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'attachment; filename="generated_video.mp4"');

    const videoStream = fs.createReadStream(tempVideoPath);
    videoStream.pipe(res);

    videoStream.on('end', () => cleanupFile(tempVideoPath));
    videoStream.on('error', (error) => {
      console.error('Erro no stream:', error);
      cleanupFile(tempVideoPath);
    });

  } catch (error) {
    console.error('❌ ERRO:', error.message);
    cleanupFile(tempVideoPath); // Garante limpeza em caso de erro

    if (!res.headersSent) {
      res.status(500).json({
        error: 'Erro ao processar requisição',
        message: error.message
      });
    }
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'GenAI Image & Video API'
  });
});

// Documentação da API
app.get('/', (req, res) => {
  res.json({
    service: 'GenAI Image & Video API',
    version: '2.0.0',
    endpoints: {
      health: 'GET /health',
      editImage: 'POST /edit-image',
      generateVideo: 'POST /generate-video'
    },
    documentation: {
      editImage: {
        method: 'POST',
        path: '/edit-image',
        description: 'Gera ou edita uma imagem usando Gemini 2.5 Flash Image',
        body: {
          inputImage: '(Opcional) URL ou Base64 da imagem',
          prompt: '(Obrigatório) Descrição da edição ou geração',
          returnFormat: '(Opcional) "base64" ou "file" (padrão: base64)'
        },
        example: {
          inputImage: 'https://drive.google.com/file/d/...',
          prompt: 'Transforme em estilo aquarela',
          returnFormat: 'base64'
        }
      },
      generateVideo: {
        method: 'POST',
        path: '/generate-video',
        description: 'Gera vídeo a partir de uma imagem usando Veo 3.1',
        body: {
          inputImage: '(Obrigatório) URL ou Base64 da imagem',
          prompt: '(Obrigatório) Descrição da animação do vídeo'
        },
        example: {
          inputImage: 'https://drive.google.com/file/d/...',
          prompt: 'Panning shot from left to right'
        }
      }
    }
  });
});

// Iniciar servidor apenas em ambiente local
if (process.env.VERCEL !== '1') {
  const server = app.listen(PORT, () => {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║         GenAI Image & Video API v2.0                   ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log(`\n🚀 Servidor: http://localhost:${PORT}`);
    console.log(`\n📋 Endpoints:`);
    console.log(`   GET  /               - Documentação`);
    console.log(`   GET  /health         - Health check`);
    console.log(`   POST /edit-image     - Editar imagem (Gemini 2.5)`);
    console.log(`   POST /generate-video - Gerar vídeo (Veo 3.1)`);
    console.log('\n');
  });
}

// Exportar para Vercel (serverless)
export default app;

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

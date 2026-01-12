import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import https from 'https';
import http from 'http';

dotenv.config();

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
    const imageBuffer = await downloadImage(inputImage);
    return imageBuffer;
  }
  const base64Data = inputImage.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb'
    }
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { inputImage, prompt, returnFormat = 'base64' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Campo "prompt" é obrigatório' });
    }

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
    if (!candidate) throw new Error('Sem candidatos na resposta');

    for (const part of candidate) {
      if (part.inlineData) {
        const imageData = part.inlineData.data;
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

    const textPart = candidate.find(p => p.text);
    if (textPart) {
      throw new Error(`Modelo retornou apenas texto: ${textPart.text}`);
    }

    throw new Error('Nenhuma imagem foi gerada');

  } catch (error) {
    console.error('ERRO:', error);
    return res.status(500).json({
      error: 'Erro ao processar requisição',
      message: error.message
    });
  }
}

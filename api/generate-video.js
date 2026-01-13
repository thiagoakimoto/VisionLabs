const dotenv = require('dotenv');
const { GoogleGenAI } = require('@google/genai');
const https = require('https');
const http = require('http');

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

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { inputImage, image_urls, prompt } = req.body;

    // Aceita tanto inputImage (string) quanto image_urls (array)
    const imageUrl = inputImage || (image_urls && image_urls[0]);
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'Campo "inputImage" ou "image_urls" é obrigatório' });
    }
    if (!prompt) {
      return res.status(400).json({ error: 'Campo "prompt" é obrigatório' });
    }

    const imageBuffer = await processImageInput(imageUrl);

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-generate-preview',
      prompt: prompt,
      image: {
        imageBytes: imageBuffer.toString('base64'),
        mimeType: 'image/png'
      }
    });

    // Polling reduzido para Vercel (máximo 50 segundos)
    let attempts = 0;
    const maxAttempts = 10;

    while (!operation.done && attempts < maxAttempts) {
      attempts++;
      await new Promise((resolve) => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation });
    }

    if (!operation.done) {
      return res.status(408).json({ 
        error: 'Timeout',
        message: 'Vídeo ainda está sendo gerado. Na Vercel há limite de 60s. Use VPS para vídeos.'
      });
    }

    if (!operation.response?.generatedVideos?.[0]?.video) {
      throw new Error('Vídeo não retornado');
    }

    // Na Vercel não podemos baixar arquivo e fazer stream
    // Então vamos retornar a URL do vídeo
    const videoFile = operation.response.generatedVideos[0].video;
    
    return res.json({
      success: true,
      message: 'Vídeo gerado com sucesso',
      videoUrl: videoFile.uri || videoFile.name,
      note: 'Use esta URL para baixar o vídeo ou faça download via SDK'
    });

  } catch (error) {
    console.error('ERRO:', error);
    return res.status(500).json({
      error: 'Erro ao processar requisição',
      message: error.message
    });
  }
}

module.exports.config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb'
    }
  }
};

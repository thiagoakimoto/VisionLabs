const { GoogleGenAI } = require('@google/genai');
const { processImageInput } = require('../lib/imageProcessor');
const applyCors = require('../lib/cors');
const fs = require('fs');
const path = require('path');
const os = require('os');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

const handler = async (req, res) => {
  applyCors(req, res);
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const tempFilePath = path.join(os.tmpdir(), `video_${Date.now()}.mp4`);

  try {
    const { prompt, returnFormat = 'file' } = req.body;
    const imageBuffer = await processImageInput(req.body);

    if (!imageBuffer) return res.status(400).json({ error: 'Imagem obrigatória' });
    if (!prompt) return res.status(400).json({ error: 'Prompt obrigatório' });

    // Inicia geração
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-generate-preview',
      prompt: prompt,
      image: {
        imageBytes: imageBuffer.toString('base64'),
        mimeType: 'image/png'
      }
    });

    console.log('[VIDEO] Gerando... isso pode levar ~90 segundos.');

    // Polling SEM limite de tentativas
    while (!operation.done) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation });
    }

    console.log('[VIDEO] Operação completa. Verificando resposta...');
    console.log('Response:', JSON.stringify(operation.response, null, 2));

    // Verificar se há vídeos gerados
    if (!operation.response || !operation.response.generatedVideos || operation.response.generatedVideos.length === 0) {
      throw new Error('Nenhum vídeo foi gerado. Response: ' + JSON.stringify(operation.response));
    }

    // DOWNLOAD: Fundamental para o n8n conseguir ler o arquivo
    await ai.files.download({
        file: operation.response.generatedVideos[0].video,
        downloadPath: tempFilePath,
    });

    // Captura videoId para permitir extensões futuras
    const videoId = operation.response.generatedVideos[0].video.uri;
    console.log('[VIDEO] VideoId gerado:', videoId);

    // Se returnFormat for base64, retorna JSON com videoId
    if (returnFormat === 'base64') {
      const videoBase64 = fs.readFileSync(tempFilePath, { encoding: 'base64' });
      try { fs.unlinkSync(tempFilePath); } catch(e){}
      
      return res.status(200).json({
        success: true,
        video: `data:video/mp4;base64,${videoBase64}`,
        videoId: videoId,
        format: 'base64'
      });
    }

    // Envia o arquivo como stream (padrão)
    const videoStream = fs.createReadStream(tempFilePath);
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'attachment; filename="video_gerado.mp4"');
    res.setHeader('X-Video-Id', videoId);  // Header com videoId para extensões
    videoStream.pipe(res);

    // Limpeza após envio
    videoStream.on('end', () => {
        try { fs.unlinkSync(tempFilePath); } catch(e){}
    });

  } catch (error) {
    console.error('ERRO:', error);
    try { fs.unlinkSync(tempFilePath); } catch(e){}
    res.status(500).json({ error: error.message });
  }
};

module.exports = handler;
module.exports.config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb'
    }
  }
};
const { GoogleGenAI } = require('@google/genai');
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

  const tempFilePath = path.join(os.tmpdir(), `extended_video_${Date.now()}.mp4`);

  try {
    const { videoId, prompt, aspectRatio = '16:9' } = req.body;

    if (!videoId) return res.status(400).json({ error: 'videoId obrigatório (ex: files/abc123...)' });
    if (!prompt) return res.status(400).json({ error: 'Prompt obrigatório' });

    console.log('[EXTEND] Estendendo vídeo:', videoId);

    // Constrói URL completa se receber apenas files/FILE_ID
    const videoUri = videoId.startsWith('http') 
      ? videoId 
      : `https://generativelanguage.googleapis.com/v1beta/${videoId}:download?alt=media`;
    
    console.log('[EXTEND] URI completa:', videoUri);

    // Inicia extensão usando o vídeo anterior
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-generate-preview',
      prompt: prompt,
      video: { uri: videoUri },  // Referência ao vídeo gerado anteriormente
      config: {
        aspectRatio: aspectRatio,  // '9:16' para retrato ou '16:9' para paisagem
        resolution: '720p'
      }
    });

    console.log('[EXTEND] Gerando extensão... isso pode levar ~90 segundos.');

    // Polling SEM limite de tentativas
    while (!operation.done) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation });
    }

    console.log('[EXTEND] Operação completa. Verificando resposta...');
    console.log('Response:', JSON.stringify(operation.response, null, 2));

    // Verificar se há vídeos gerados
    if (!operation.response || !operation.response.generatedVideos || operation.response.generatedVideos.length === 0) {
      throw new Error('Nenhum vídeo foi gerado. Response: ' + JSON.stringify(operation.response));
    }

    // DOWNLOAD: Baixa o vídeo estendido
    await ai.files.download({
        file: operation.response.generatedVideos[0].video,
        downloadPath: tempFilePath,
    });

    console.log('[EXTEND] Vídeo estendido salvo. Enviando...');

    // Retorna videoId completo para permitir extensões encadeadas
    const newVideoId = operation.response.generatedVideos[0].video.uri;

    // Envia o arquivo como stream
    const videoStream = fs.createReadStream(tempFilePath);
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'attachment; filename="video_estendido.mp4"');
    res.setHeader('X-Video-Id', newVideoId);  // Header com novo videoId
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

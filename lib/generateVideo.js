const { GoogleGenAI } = require('@google/genai');
const { processImageInput } = require('./imageProcessor');
const fs = require('fs');
const path = require('path');
const os = require('os');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

/**
 * Gera um vídeo usando Veo 3.1
 * @param {Object} params
 * @param {string} params.prompt - Descrição do vídeo
 * @param {string} params.inputImage - Imagem base64 ou URL de referência (obrigatório)
 * @param {string} [params.aspectRatio='16:9'] - '16:9' ou '9:16'
 * @returns {Promise<{video: string, videoId: string, usage: object}>}
 */
async function generateVideo(params) {
    const { prompt, aspectRatio = '16:9' } = params;

    const imageBuffer = await processImageInput(params);
    if (!imageBuffer) throw new Error('Imagem obrigatória para geração de vídeo');
    if (!prompt) throw new Error('Prompt obrigatório');

    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-generate-preview',
        prompt,
        image: {
            imageBytes: imageBuffer.toString('base64'),
            mimeType: imageBuffer.mimeType || 'image/png'
        },
        config: {
            aspectRatio,
            resolution: '720p'
        }
    });

    console.log('[VIDEO] Gerando... isso pode levar ~90 segundos.');

    while (!operation.done) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation });
    }

    if (!operation.response?.generatedVideos?.length) {
        throw new Error('Nenhum vídeo foi gerado. Response: ' + JSON.stringify(operation.response));
    }

    const tempFilePath = path.join(os.tmpdir(), `video_${Date.now()}.mp4`);
    await ai.files.download({
        file: operation.response.generatedVideos[0].video,
        downloadPath: tempFilePath,
    });

    const videoId = operation.response.generatedVideos[0].video.uri;
    const usage = operation.response.usageMetadata || {};

    const videoBase64 = fs.readFileSync(tempFilePath, { encoding: 'base64' });
    try { fs.unlinkSync(tempFilePath); } catch (e) {}

    return {
        video: `data:video/mp4;base64,${videoBase64}`,
        videoId,
        usage
    };
}

module.exports = { generateVideo };

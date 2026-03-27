const { GoogleGenAI } = require('@google/genai');
const { processImageInput } = require('./imageProcessor');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

/**
 * Gera ou edita uma imagem usando Gemini 2.5 Flash
 * @param {Object} params
 * @param {string} params.prompt - Descrição da imagem
 * @param {string} [params.inputImage] - Imagem base64 ou URL de referência
 * @param {string} [params.imageUrl] - URL da imagem (alternativo)
 * @param {string} [params.googleDriveUrl] - URL do Google Drive (alternativo)
 * @returns {Promise<{image: string, mimeType: string}>} base64 data URI
 */
async function generateImage(params) {
    const { prompt } = params;
    if (!prompt) throw new Error('Campo "prompt" é obrigatório');

    let parts = [{ text: prompt }];

    const imageBuffer = await processImageInput(params);
    if (imageBuffer) {
        parts.push({
            inlineData: {
                mimeType: 'image/png',
                data: imageBuffer.toString('base64')
            }
        });
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ role: 'user', parts }]
    });

    const candidate = response.candidates?.[0]?.content?.parts;
    if (!candidate) throw new Error('Sem resposta da IA');

    for (const part of candidate) {
        if (part.inlineData) {
            return {
                image: `data:image/png;base64,${part.inlineData.data}`,
                mimeType: 'image/png'
            };
        }
    }

    const textPart = candidate.find(p => p.text);
    throw new Error(textPart ? `IA Recusou: ${textPart.text}` : 'Erro desconhecido');
}

module.exports = { generateImage };

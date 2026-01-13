const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');
const { processImageInput } = require('./utils'); // Importa do utils
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

router.post('/edit-image', async (req, res) => {
  try {
    const { prompt, returnFormat = 'base64' } = req.body;

    if (!prompt) return res.status(400).json({ error: 'Campo "prompt" é obrigatório' });

    let parts = [{ text: prompt }];
    
    // Processa a imagem usando o utils
    const imageBuffer = await processImageInput(req.body);

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
          return res.json({
            success: true,
            image: `data:image/png;base64,${imageData}`,
            format: 'base64'
          });
        }
      }
    }
    
    const textPart = candidate.find(p => p.text);
    throw new Error(textPart ? `IA Recusou: ${textPart.text}` : 'Erro desconhecido');

  } catch (error) {
    console.error('ERRO:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
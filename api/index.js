module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  res.status(200).json({
    service: "GenAI Middleware",
    version: "2.0.0",
    status: "online",
    endpoints: {
      editImage: {
        method: "POST",
        path: "/api/edit-image",
        description: "Edita ou gera imagem usando Gemini 2.5 Flash Image",
        body: {
          prompt: "String - Descrição da edição/geração desejada (obrigatório)",
          inputImage: "String - URL ou Base64 da imagem original (opcional)",
          image_urls: "Array - URLs de imagens do Google Drive ou HTTP (opcional)",
          returnFormat: "String - 'base64' ou 'file' (default: 'base64')"
        }
      },
      generateVideo: {
        method: "POST",
        path: "/api/generate-video",
        description: "Gera vídeo a partir de imagem usando Veo 3.1",
        body: {
          prompt: "String - Descrição do movimento/animação desejada (obrigatório)",
          inputImage: "String - URL ou Base64 da imagem (obrigatório)",
          image_urls: "Array - URLs de imagens do Google Drive ou HTTP (alternativa)"
        },
        warning: "Pode exceder timeout de 60s no Vercel. Recomendado usar VPS."
      }
    },
    documentation: "https://github.com/thiagoakimoto/GENAI-"
  });
};

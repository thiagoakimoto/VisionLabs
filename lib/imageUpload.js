const axios = require('axios');

async function uploadToImgur(base64Image) {
  try {
    const response = await axios.post(
      'https://api.imgur.com/3/image',
      {
        image: base64Image,
        type: 'base64'
      },
      {
        headers: {
          'Authorization': 'Client-ID 546c25a59c58ad7'
        }
      }
    );
    
    return response.data.data.link;
  } catch (error) {
    console.error('Erro ao fazer upload no Imgur:', error.message);
    throw new Error('Falha ao fazer upload da imagem');
  }
}

module.exports = { uploadToImgur };

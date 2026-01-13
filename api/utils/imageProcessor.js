const https = require('https');
const http = require('http');
const { convertGoogleDriveUrl } = require('./googleDrive');

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

async function processImageInput(reqBody) {
  const { inputImage, image_urls } = reqBody;
  const imageUrl = inputImage || (image_urls && image_urls[0]);

  if (!imageUrl) return null;

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return await downloadImage(imageUrl);
  }
  
  const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

module.exports = { processImageInput };

const https = require('https');
const http = require('http');
const { convertGoogleDriveUrl } = require('./googleDrive');

async function downloadImage(imageUrl) {
  return new Promise((resolve, reject) => {
    const url = convertGoogleDriveUrl(imageUrl);
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, { headers: { 'User-Agent': 'Node.js' } }, (response) => {
      // Trata todos os tipos de redirect: 301, 302, 303, 307, 308
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
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
  
  // Extrai a string da imagem (suporta string ou array)
  let imageUrl = inputImage;
  
  // Se inputImage é array, pega o primeiro elemento
  if (Array.isArray(inputImage)) {
    imageUrl = inputImage[0];
  }
  
  // Se não tem inputImage, tenta image_urls
  if (!imageUrl && image_urls) {
    imageUrl = Array.isArray(image_urls) ? image_urls[0] : image_urls;
  }

  if (!imageUrl) return null;

  console.log('[IMAGE PROCESSOR] URL recebida:', imageUrl);

  if (typeof imageUrl === 'string' && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
    console.log('[IMAGE PROCESSOR] Fazendo download da URL...');
    const buffer = await downloadImage(imageUrl);
    console.log('[IMAGE PROCESSOR] Download completo. Tamanho:', buffer.length, 'bytes');
    return buffer;
  }
  
  console.log('[IMAGE PROCESSOR] Processando Base64...');
  const match = imageUrl.match(/^data:(image|video)\/([\w.-]+);base64,/);
  const mimeType = match ? match[0].replace(';base64,', '').replace('data:', '') : 'image/png';
  const base64Data = imageUrl.replace(/^data:(image|video)\/[\w.-]+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  buffer.mimeType = mimeType;
  console.log('[IMAGE PROCESSOR] Base64 convertido. Tamanho:', buffer.length, 'bytes. Tipo:', mimeType);
  return buffer;
}

module.exports = { processImageInput };

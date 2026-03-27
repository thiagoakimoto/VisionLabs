const { generateImage } = require('../lib/generateImage');
const { uploadToImgur } = require('../lib/imageUpload');
const applyCors = require('../lib/cors');

const handler = async (req, res) => {
  applyCors(req, res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { returnFormat = 'base64' } = req.body;

    const { image, mimeType } = await generateImage(req.body);
    const base64Data = image.split(',')[1];

    if (returnFormat === 'file') {
      const buffer = Buffer.from(base64Data, 'base64');
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', 'attachment; filename="edited.png"');
      return res.send(buffer);
    } else if (returnFormat === 'url') {
      const imageUrl = await uploadToImgur(base64Data);
      return res.json({ success: true, imageUrl, format: 'url' });
    } else {
      return res.json({ success: true, image, format: 'base64' });
    }
  } catch (error) {
    console.error('ERRO:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = handler;
module.exports.config = { api: { bodyParser: { sizeLimit: '100mb' } } };

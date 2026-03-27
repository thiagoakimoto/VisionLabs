const { generateVideo } = require('../lib/generateVideo');
const applyCors = require('../lib/cors');
const fs = require('fs');
const path = require('path');
const os = require('os');

const handler = async (req, res) => {
  applyCors(req, res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { returnFormat = 'file' } = req.body;
    const result = await generateVideo(req.body);

    if (returnFormat === 'base64') {
      return res.status(200).json({
        success: true,
        video: result.video,
        videoId: result.videoId,
        format: 'base64',
        usage: result.usage
      });
    }

    // Envia como stream
    const base64Data = result.video.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'attachment; filename="video_gerado.mp4"');
    res.setHeader('X-Video-Id', result.videoId);
    res.setHeader('X-Usage-Metadata', JSON.stringify(result.usage));
    return res.send(buffer);

  } catch (error) {
    console.error('ERRO:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = handler;
module.exports.config = { api: { bodyParser: { sizeLimit: '100mb' } } };

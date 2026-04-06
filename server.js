const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// CORS — permite que o frontend na Vercel acesse a API
app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowed = [
        'http://localhost:4321',
        'http://localhost:3000',
        process.env.FRONTEND_URL, // ex: https://meu-projeto.vercel.app
    ].filter(Boolean);
    
    if (!origin || allowed.includes(origin) || origin.endsWith('.vercel.app')) {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Range');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// Aumenta o limite para aceitar imagens grandes em base64
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static view files from public directory
app.use(express.static('public'));

// Função auxiliar para adaptar o handler do Vercel para o Express
const v2e = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (error) {
    console.error("Handler error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  }
};

const authMiddleware = require('./lib/authMiddleware');

// Rotas públicas (sem auth)
app.all('/api', v2e(require('./api/index.js')));
app.use('/api/auth', v2e(require('./api/auth.js')));

// Rotas legadas de geração direta (sem auth, para compatibilidade externa)
app.all('/api/edit-image', v2e(require('./api/edit-image.js')));
app.all('/api/generate-video', v2e(require('./api/generate-video.js')));
app.all('/api/extend-video', v2e(require('./api/extend-video.js')));

// Rotas protegidas (requerem JWT)
app.use('/api/generations', authMiddleware, require('./api/generations.js'));
app.use('/api/chat', authMiddleware, require('./api/chat.js'));
app.use('/api/settings', authMiddleware, require('./api/settings.js'));

// Error handler global
app.use((err, _req, res, _next) => {
    console.error('[Unhandled error]', err);
    if (!res.headersSent) {
        res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
});

// Roda localmente (dev); na Vercel o módulo é exportado abaixo
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Server is running at http://localhost:${PORT}`);
    });
}

// Exporta o app para a Vercel usar como Serverless Function
module.exports = app;

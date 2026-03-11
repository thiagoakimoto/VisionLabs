const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

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

// Rotas mapeadas a partir dos arquivos originais em /api
// app.all('/', v2e(require('./api/index.js'))); // Moved API index to a different route to free up static HTML
app.all('/api', v2e(require('./api/index.js')));
app.use('/api/auth', v2e(require('./api/auth.js'))); // Registro do roteador de autenticação
app.all('/api/edit-image', v2e(require('./api/edit-image.js')));
app.all('/api/generate-video', v2e(require('./api/generate-video.js')));
app.all('/api/extend-video', v2e(require('./api/extend-video.js')));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
  console.log(`🌐 API endpoints:`);
  console.log(`   - GET /`);
  console.log(`   - POST /api/edit-image`);
  console.log(`   - POST /api/generate-video`);
  console.log(`   - POST /api/extend-video`);
});

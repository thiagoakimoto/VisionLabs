import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para processar JSON com limite maior para imagens Base64
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Inicializar Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY
});

// Função auxiliar para converter Base64 para bytes
function base64ToBytes(base64String) {
  // Remove o prefixo data:image/...;base64, se existir
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

// Função para garantir que o diretório temp existe
function ensureTempDir() {
  const tempDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  return tempDir;
}

// Função para limpar arquivo temporário
function cleanupFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Arquivo temporário removido: ${filePath}`);
    }
  } catch (error) {
    console.error(`Erro ao remover arquivo ${filePath}:`, error.message);
  }
}

/**
 * POST /edit-and-animate
 * 
 * Body:
 * - inputImage: String Base64 da imagem original
 * - editPrompt: Prompt para editar a imagem (Passo 1)
 * - videoPrompt: Prompt para animar o vídeo (Passo 2)
 */
app.post('/edit-and-animate', async (req, res) => {
  const tempVideoPath = path.join(ensureTempDir(), `video_${Date.now()}.mp4`);

  try {
    const { inputImage, editPrompt, videoPrompt } = req.body;

    // Validação de entrada
    if (!inputImage) {
      return res.status(400).json({ 
        error: 'Campo "inputImage" (Base64) é obrigatório' 
      });
    }
    if (!editPrompt) {
      return res.status(400).json({ 
        error: 'Campo "editPrompt" é obrigatório' 
      });
    }
    if (!videoPrompt) {
      return res.status(400).json({ 
        error: 'Campo "videoPrompt" é obrigatório' 
      });
    }

    console.log('=== PASSO 1: Editando Imagem com Gemini 2.5 Flash Image ===');
    console.log('Prompt de Edição:', editPrompt);

    // Converter Base64 para bytes
    const inputImageBytes = base64ToBytes(inputImage);

    // Passo 1: Editar a imagem usando Gemini 2.5 Flash Image
    const imageResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      prompt: editPrompt,
      image: {
        imageBytes: inputImageBytes,
        mimeType: 'image/png'
      }
    });

    // Verificar se a imagem foi gerada
    if (!imageResponse.generatedImages || imageResponse.generatedImages.length === 0) {
      throw new Error('Nenhuma imagem foi gerada no Passo 1');
    }

    const editedImageBytes = imageResponse.generatedImages[0].image.imageBytes;
    console.log('✓ Imagem editada com sucesso');

    console.log('\n=== PASSO 2: Gerando Vídeo com Veo 3.1 ===');
    console.log('Prompt de Vídeo:', videoPrompt);

    // Passo 2: Gerar vídeo usando a imagem editada
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-generate-preview',
      prompt: videoPrompt,
      image: {
        imageBytes: editedImageBytes,
        mimeType: 'image/png'
      }
    });

    console.log('✓ Operação de geração de vídeo iniciada');

    // Passo 3: Polling até o vídeo estar pronto
    console.log('\n=== PASSO 3: Aguardando Geração do Vídeo ===');
    let attempts = 0;
    const maxAttempts = 60; // 10 minutos (60 * 10s)

    while (!operation.done && attempts < maxAttempts) {
      attempts++;
      console.log(`Tentativa ${attempts}/${maxAttempts} - Aguardando conclusão...`);
      
      await new Promise((resolve) => setTimeout(resolve, 10000)); // 10 segundos
      
      operation = await ai.operations.getVideosOperation({
        operation: operation
      });
    }

    if (!operation.done) {
      throw new Error('Timeout: Vídeo não foi gerado dentro do tempo esperado');
    }

    if (!operation.response?.generatedVideos?.[0]?.video) {
      throw new Error('Vídeo não foi gerado corretamente');
    }

    console.log('✓ Vídeo gerado com sucesso!');

    // Baixar o vídeo
    console.log('\n=== PASSO 4: Baixando Vídeo ===');
    await ai.files.download({
      file: operation.response.generatedVideos[0].video,
      downloadPath: tempVideoPath
    });

    console.log(`✓ Vídeo salvo temporariamente em: ${tempVideoPath}`);

    // Retornar o vídeo como stream
    console.log('\n=== PASSO 5: Retornando Vídeo ===');
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'attachment; filename="generated_video.mp4"');

    const videoStream = fs.createReadStream(tempVideoPath);
    
    videoStream.pipe(res);

    // Limpar arquivo após envio
    videoStream.on('end', () => {
      cleanupFile(tempVideoPath);
    });

    videoStream.on('error', (error) => {
      console.error('Erro ao enviar vídeo:', error);
      cleanupFile(tempVideoPath);
    });

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.error('Stack:', error.stack);

    // Limpar arquivo em caso de erro
    cleanupFile(tempVideoPath);

    if (!res.headersSent) {
      res.status(500).json({
        error: 'Erro ao processar requisição',
        message: error.message,
        details: error.stack
      });
    }
  }
});

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'GenAI Edit & Animate Middleware'
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    service: 'GenAI Edit & Animate Middleware',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      editAndAnimate: 'POST /edit-and-animate'
    },
    documentation: {
      editAndAnimate: {
        method: 'POST',
        path: '/edit-and-animate',
        body: {
          inputImage: 'String Base64 da imagem original',
          editPrompt: 'Prompt para editar a imagem',
          videoPrompt: 'Prompt para animar o vídeo'
        },
        returns: 'Arquivo de vídeo MP4 (binary stream)'
      }
    }
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   GenAI Edit & Animate Middleware                      ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`\n🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`\n📋 Endpoints disponíveis:`);
  console.log(`   GET  /          - Documentação da API`);
  console.log(`   GET  /health    - Health check`);
  console.log(`   POST /edit-and-animate - Editar imagem e gerar vídeo`);
  console.log(`\n⚙️  Modelos utilizados:`);
  console.log(`   1️⃣  gemini-2.5-flash-image (Edição de Imagem)`);
  console.log(`   2️⃣  veo-3.1-generate-preview (Geração de Vídeo)`);
  console.log('\n');
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

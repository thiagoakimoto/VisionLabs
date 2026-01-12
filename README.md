# GenAI Edit & Animate Middleware

Middleware Node.js/Express para edição de imagem e geração de vídeo usando Google GenAI SDK.

## 🎯 Funcionalidade

Este middleware implementa um fluxo em duas etapas:

1. **Edição de Imagem** - Usando Gemini 2.5 Flash Image
2. **Geração de Vídeo** - Usando Veo 3.1 a partir da imagem editada

## 📋 Pré-requisitos

- Node.js 18+ (recomendado)
- Chave de API do Google AI Studio

## 🚀 Instalação

1. Clone ou baixe este projeto

2. Instale as dependências:
```bash
npm install
```

3. Configure a API Key:
```bash
# Copie o arquivo de exemplo
copy .env.example .env

# Edite o arquivo .env e adicione sua API Key
GOOGLE_API_KEY=sua_api_key_aqui
```

## ▶️ Execução

### Modo Produção
```bash
npm start
```

### Modo Desenvolvimento (com auto-reload)
```bash
npm run dev
```

O servidor iniciará em `http://localhost:3000`

## 📡 API

### POST /edit-and-animate

Edita uma imagem e gera um vídeo animado.

**Request Body (JSON):**
```json
{
  "inputImage": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "editPrompt": "Altere o fundo para uma floresta tropical",
  "videoPrompt": "Câmera lenta panorâmica da esquerda para direita"
}
```

**Campos:**
- `inputImage` (string, obrigatório): Imagem em Base64 (com ou sem prefixo data:image)
- `editPrompt` (string, obrigatório): Prompt para editar a imagem no Passo 1
- `videoPrompt` (string, obrigatório): Prompt para guiar a animação do vídeo no Passo 2

**Response:**
- Content-Type: `video/mp4`
- Body: Arquivo de vídeo binário (.mp4)

**Exemplo com cURL:**
```bash
curl -X POST http://localhost:3000/edit-and-animate \
  -H "Content-Type: application/json" \
  -d '{
    "inputImage": "data:image/png;base64,iVBORw0KGgoAAAANS...",
    "editPrompt": "Transforme em estilo aquarela",
    "videoPrompt": "Zoom lento aproximando-se do centro"
  }' \
  --output video.mp4
```

### GET /health

Health check do serviço.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-12T10:30:00.000Z",
  "service": "GenAI Edit & Animate Middleware"
}
```

## 🔄 Fluxo de Processamento

```
┌─────────────────┐
│  n8n (Cliente)  │
└────────┬────────┘
         │ POST /edit-and-animate
         │ { inputImage, editPrompt, videoPrompt }
         ▼
┌─────────────────────────────────────────┐
│         Middleware Express              │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ PASSO 1: Edição de Imagem         │ │
│  │ Modelo: gemini-2.5-flash-image    │ │
│  │ Input: inputImage + editPrompt    │ │
│  │ Output: editedImageBytes          │ │
│  └───────────────┬───────────────────┘ │
│                  │                      │
│  ┌───────────────▼───────────────────┐ │
│  │ PASSO 2: Geração de Vídeo         │ │
│  │ Modelo: veo-3.1-generate-preview  │ │
│  │ Input: editedImageBytes +         │ │
│  │        videoPrompt                │ │
│  │ Output: operation (async)         │ │
│  └───────────────┬───────────────────┘ │
│                  │                      │
│  ┌───────────────▼───────────────────┐ │
│  │ PASSO 3: Polling                  │ │
│  │ Aguarda até operation.done = true │ │
│  │ Timeout: 10 minutos               │ │
│  └───────────────┬───────────────────┘ │
│                  │                      │
│  ┌───────────────▼───────────────────┐ │
│  │ PASSO 4: Download                 │ │
│  │ Salva vídeo em temp/              │ │
│  └───────────────┬───────────────────┘ │
│                  │                      │
│  ┌───────────────▼───────────────────┐ │
│  │ PASSO 5: Stream & Cleanup         │ │
│  │ Retorna MP4 e deleta temp         │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│  video.mp4      │
└─────────────────┘
```

## 🛠️ Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **@google/genai** - SDK do Google GenAI
- **dotenv** - Gerenciamento de variáveis de ambiente

## 📝 Notas Importantes

- O servidor aceita payloads JSON de até **50MB** para suportar imagens Base64 grandes
- O polling do vídeo aguarda até **10 minutos** (60 tentativas x 10s)
- Arquivos temporários são automaticamente deletados após o envio
- Os logs detalhados mostram o progresso de cada etapa

## 🔐 Segurança

- Nunca commite o arquivo `.env` com sua API Key
- Use variáveis de ambiente em produção
- Considere adicionar rate limiting para ambientes de produção

## 🐛 Troubleshooting

### Erro: "GOOGLE_API_KEY não encontrada"
Certifique-se de ter criado o arquivo `.env` e configurado a chave corretamente.

### Timeout na geração do vídeo
Vídeos complexos podem levar mais tempo. Ajuste o `maxAttempts` no código se necessário.

### Erro de memória com imagens grandes
Aumente o limite em `express.json({ limit: '100mb' })` se necessário.

## 📄 Licença

ISC

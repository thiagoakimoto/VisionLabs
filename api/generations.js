const express = require('express');
const pool = require('../lib/db');
const { generateImage } = require('../lib/generateImage');
const { generateVideo } = require('../lib/generateVideo');

const router = express.Router();

// POST /api/generations/image — geração síncrona
router.post('/image', async (req, res) => {
    try {
        const { userId } = req.user;
        const { prompt, inputImage, imageUrl, googleDriveUrl, aspectRatio = '16:9', sessionId } = req.body;

        if (!prompt) return res.status(400).json({ error: 'Prompt obrigatório' });

        const insertResult = await pool.query(
            `INSERT INTO generations (user_id, type, prompt, input_image, aspect_ratio, status)
             VALUES ($1, 'image', $2, $3, $4, 'processing') RETURNING id`,
            [userId, prompt, inputImage || imageUrl || googleDriveUrl || null, aspectRatio]
        );
        const generationId = insertResult.rows[0].id;

        try {
            const result = await generateImage({ prompt, inputImage, imageUrl, googleDriveUrl });
            const title = prompt.length > 60 ? prompt.substring(0, 60) + '...' : prompt;

            await pool.query(
                `UPDATE generations SET result_url=$1, status='complete', title=$2, updated_at=NOW() WHERE id=$3`,
                [result.image, title, generationId]
            );

            // Salva como mensagem de chat na sessão correta
            await pool.query(
                `INSERT INTO chat_messages (user_id, generation_id, role, content, media_url, media_type, session_id)
                 VALUES ($1, $2, 'assistant', $3, $4, 'image', $5)`,
                [userId, generationId, `Imagem gerada: ${title}`, `/api/generations/${generationId}/media`, sessionId || null]
            );

            return res.json({ success: true, generationId, image: `/api/generations/${generationId}/media`, title });

        } catch (genError) {
            await pool.query(
                `UPDATE generations SET status='error', error_message=$1, updated_at=NOW() WHERE id=$2`,
                [genError.message, generationId]
            );
            return res.status(500).json({ error: genError.message, generationId });
        }
    } catch (err) {
        console.error('[generations/image]', err);
        return res.status(500).json({ error: err.message });
    }
});

// POST /api/generations/video — geração assíncrona
router.post('/video', async (req, res) => {
    try {
        const { userId } = req.user;
        const { prompt, inputImage, imageUrl, googleDriveUrl, aspectRatio = '16:9', sessionId } = req.body;

        if (!prompt) return res.status(400).json({ error: 'Prompt obrigatório' });

        const insertResult = await pool.query(
            `INSERT INTO generations (user_id, type, prompt, input_image, aspect_ratio, status)
             VALUES ($1, 'video', $2, $3, $4, 'processing') RETURNING id`,
            [userId, prompt, inputImage || imageUrl || googleDriveUrl || null, aspectRatio]
        );
        const generationId = insertResult.rows[0].id;

        // Retorna imediatamente
        res.json({ success: true, generationId, status: 'processing' });

        // Processa em background
        generateVideo({ prompt, inputImage, imageUrl, googleDriveUrl, aspectRatio })
            .then(async (result) => {
                const title = prompt.length > 60 ? prompt.substring(0, 60) + '...' : prompt;
                await pool.query(
                    `UPDATE generations SET result_url=$1, video_id=$2, status='complete', title=$3, usage_metadata=$4, updated_at=NOW() WHERE id=$5`,
                    [result.video, result.videoId, title, JSON.stringify(result.usage), generationId]
                );
                // Salva como mensagem de chat na sessão correta
                await pool.query(
                    `INSERT INTO chat_messages (user_id, generation_id, role, content, media_url, media_type, session_id)
                     VALUES ($1, $2, 'assistant', $3, $4, 'video', $5)`,
                    [userId, generationId, `Vídeo gerado: ${title}`, `/api/generations/${generationId}/media`, sessionId || null]
                );
                console.log(`[VIDEO] Geração ${generationId} concluída para sessão ${sessionId}.`);
            })
            .catch(async (error) => {
                await pool.query(
                    `UPDATE generations SET status='error', error_message=$1, updated_at=NOW() WHERE id=$2`,
                    [error.message, generationId]
                ).catch(() => {});
                console.error(`[VIDEO] Erro na geração ${generationId}:`, error.message);
            });

    } catch (err) {
        console.error('[generations/video]', err);
        return res.status(500).json({ error: err.message });
    }
});

// GET /api/generations/:id/status
router.get('/:id/status', async (req, res) => {
    try {
        const { userId } = req.user;
        const { id } = req.params;

        const result = await pool.query(
            `SELECT id, status, result_url, video_id, error_message, title, type, updated_at
             FROM generations WHERE id=$1 AND user_id=$2`,
            [id, userId]
        );

        if (!result.rows.length) return res.status(404).json({ error: 'Geração não encontrada' });

        const gen = result.rows[0];
        return res.json({
            generationId: gen.id,
            status: gen.status,
            type: gen.type,
            title: gen.title,
            result: gen.status === 'complete' ? `/api/generations/${gen.id}/media` : null,
            videoId: gen.video_id,
            error: gen.error_message,
            updatedAt: gen.updated_at
        });
    } catch (err) {
        console.error('[generations/status]', err);
        return res.status(500).json({ error: err.message });
    }
});

// GET /api/generations
router.get('/', async (req, res) => {
    try {
        const { userId } = req.user;
        const sessionId = req.query.sessionId;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const offset = parseInt(req.query.offset) || 0;

        let query = `SELECT g.id, g.type, g.prompt, g.title, g.aspect_ratio, g.status, g.video_id, g.created_at, g.updated_at,
                     CASE WHEN g.status='complete' AND g.result_url IS NOT NULL THEN true ELSE false END as has_media
                     FROM generations g `;
        const params = [userId];

        if (sessionId) {
            query += `JOIN chat_messages m ON m.generation_id = g.id WHERE g.user_id=$1 AND m.session_id=$2 `;
            params.push(sessionId, limit, offset);
        } else {
            query += `WHERE g.user_id=$1 `;
            params.push(limit, offset);
        }

        query += `ORDER BY g.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

        const result = await pool.query(query, params);

        const generations = result.rows.map(g => ({
            ...g,
            result_url: g.has_media ? `/api/generations/${g.id}/media` : null
        }));

        return res.json({ generations, limit, offset });
    } catch (err) {
        console.error('[generations/list]', err);
        return res.status(500).json({ error: err.message });
    }
});

// GET /api/generations/:id
router.get('/:id', async (req, res) => {
    try {
        const { userId } = req.user;
        const { id } = req.params;

        const result = await pool.query(
            `SELECT * FROM generations WHERE id=$1 AND user_id=$2`,
            [id, userId]
        );

        if (!result.rows.length) return res.status(404).json({ error: 'Geração não encontrada' });
        
        const g = result.rows[0];
        g.result_url = g.result_url ? `/api/generations/${g.id}/media` : null;

        return res.json(g);
    } catch (err) {
        console.error('[generations/get]', err);
        return res.status(500).json({ error: err.message });
    }
});

// GET /api/generations/:id/media
router.get('/:id/media', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT result_url, type FROM generations WHERE id=$1`,
            [id]
        );
        if (!result.rows.length || !result.rows[0].result_url) {
            return res.status(404).json({ error: 'Media not found' });
        }
        let base64Data = result.rows[0].result_url;
        let mimeType = result.rows[0].type === 'video' ? 'video/mp4' : 'image/png';
        if (base64Data.startsWith('data:')) {
            const commaIndex = base64Data.indexOf(',');
            if (commaIndex !== -1) {
                const header = base64Data.substring(0, commaIndex);
                if (header.includes(';base64')) {
                    mimeType = header.replace('data:', '').replace(';base64', '');
                }
                base64Data = base64Data.substring(commaIndex + 1);
            }
        }
        const buffer = Buffer.from(base64Data, 'base64');
        const total = buffer.length;
        const rangeHeader = req.headers.range;

        if (rangeHeader) {
            const parts = rangeHeader.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : total - 1;
            const chunkSize = end - start + 1;
            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${total}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': mimeType,
                'Cache-Control': 'public, max-age=31536000',
            });
            return res.end(buffer.slice(start, end + 1));
        }

        res.writeHead(200, {
            'Content-Type': mimeType,
            'Content-Length': total,
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'public, max-age=31536000',
        });
        return res.end(buffer);
    } catch (err) {
        console.error('[generations/media]', err);
        return res.status(500).json({ error: err.message });
    }
});

// DELETE /api/generations/:id
router.delete('/:id', async (req, res) => {
    try {
        const { userId } = req.user;
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM generations WHERE id=$1 AND user_id=$2 RETURNING id`,
            [id, userId]
        );

        if (!result.rows.length) return res.status(404).json({ error: 'Geração não encontrada' });
        return res.json({ success: true, deleted: id });
    } catch (err) {
        console.error('[generations/delete]', err);
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;

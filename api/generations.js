const express = require('express');
const pool = require('../lib/db');
const { generateImage } = require('../lib/generateImage');
const { generateVideo } = require('../lib/generateVideo');

const router = express.Router();

// POST /api/generations/image — geração síncrona
router.post('/image', async (req, res) => {
    try {
        const { userId } = req.user;
        const { prompt, inputImage, imageUrl, googleDriveUrl, aspectRatio = '16:9' } = req.body;

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

            await pool.query(
                `INSERT INTO chat_messages (user_id, generation_id, role, content, media_url, media_type)
                 VALUES ($1, $2, 'assistant', $3, $4, 'image')`,
                [userId, generationId, `Imagem gerada: ${title}`, result.image]
            );

            return res.json({ success: true, generationId, image: result.image, title });

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
        const { prompt, inputImage, imageUrl, googleDriveUrl, aspectRatio = '16:9' } = req.body;

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
                await pool.query(
                    `INSERT INTO chat_messages (user_id, generation_id, role, content, media_url, media_type)
                     VALUES ($1, $2, 'assistant', $3, $4, 'video')`,
                    [userId, generationId, `Vídeo gerado: ${title}`, result.video]
                );
                console.log(`[VIDEO] Geração ${generationId} concluída.`);
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
            result: gen.status === 'complete' ? gen.result_url : null,
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
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const offset = parseInt(req.query.offset) || 0;

        const result = await pool.query(
            `SELECT id, type, prompt, title, aspect_ratio, status, video_id, created_at, updated_at,
                    CASE WHEN status='complete' THEN result_url ELSE NULL END as result_url
             FROM generations WHERE user_id=$1
             ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        return res.json({ generations: result.rows, limit, offset });
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
        return res.json(result.rows[0]);
    } catch (err) {
        console.error('[generations/get]', err);
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

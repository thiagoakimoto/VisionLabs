const express = require('express');
const pool = require('../lib/db');

const router = express.Router();

// GET /api/chat/messages
router.get('/messages', async (req, res) => {
    try {
        const { userId } = req.user;
        const limit = Math.min(parseInt(req.query.limit) || 50, 200);
        const beforeId = req.query.before_id ? parseInt(req.query.before_id) : null;

        let query = `SELECT id, role, content, media_type, generation_id, created_at,
                            CASE WHEN media_url IS NOT NULL THEN true ELSE false END as has_media
                     FROM chat_messages WHERE user_id=$1`;
        const params = [userId];

        if (beforeId) {
            query += ` AND id < $${params.length + 1}`;
            params.push(beforeId);
        }

        query += ` ORDER BY created_at ASC LIMIT $${params.length + 1}`;
        params.push(limit);

        const result = await pool.query(query, params);
        const messages = result.rows.map(m => {
            const { has_media, ...rest } = m;
            return {
                ...rest,
                media_url: has_media ? `/api/chat/messages/${m.id}/media` : null
            };
        });
        return res.json({ messages });
    } catch (err) {
        console.error('[chat/messages GET]', err);
        return res.status(500).json({ error: err.message });
    }
});

// POST /api/chat/messages
router.post('/messages', async (req, res) => {
    try {
        const { userId } = req.user;
        const { role, content, mediaUrl, mediaType, generationId } = req.body;

        if (!role || !content) return res.status(400).json({ error: 'role e content são obrigatórios' });
        if (!['user', 'assistant'].includes(role)) return res.status(400).json({ error: 'role deve ser "user" ou "assistant"' });

        const result = await pool.query(
            `INSERT INTO chat_messages (user_id, generation_id, role, content, media_url, media_type)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, created_at`,
            [userId, generationId || null, role, content, mediaUrl || null, mediaType || null]
        );

        return res.status(201).json({ success: true, message: result.rows[0] });
    } catch (err) {
        console.error('[chat/messages POST]', err);
        return res.status(500).json({ error: err.message });
    }
});

// GET /api/chat/assets
router.get('/assets', async (req, res) => {
    try {
        const { userId } = req.user;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const offset = parseInt(req.query.offset) || 0;

        const query = `
            SELECT id, media_type, created_at, content,
                   CASE WHEN media_url IS NOT NULL THEN true ELSE false END as has_media
            FROM chat_messages 
            WHERE user_id=$1 AND media_url IS NOT NULL AND role = 'user'
            ORDER BY created_at DESC 
            LIMIT $2 OFFSET $3
        `;
        const result = await pool.query(query, [userId, limit, offset]);

        const assets = result.rows.map(a => {
            const { has_media, ...rest } = a;
            return {
                ...rest,
                media_url: has_media ? `/api/chat/messages/${a.id}/media` : null
            };
        });

        return res.json({ assets });
    } catch (err) {
        console.error('[chat/assets GET]', err);
        return res.status(500).json({ error: err.message });
    }
});

// GET /api/chat/messages/:id/media
router.get('/messages/:id/media', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT media_url, media_type FROM chat_messages WHERE id=$1`,
            [id]
        );
        if (!result.rows.length || !result.rows[0].media_url) {
            return res.status(404).json({ error: 'Media not found' });
        }
        let base64Data = result.rows[0].media_url;
        let mimeType = result.rows[0].media_type || 'image/png';
        if (base64Data.startsWith('data:')) {
            const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                mimeType = matches[1];
                base64Data = matches[2];
            }
        }
        const buffer = Buffer.from(base64Data, 'base64');
        res.writeHead(200, {
            'Content-Type': mimeType,
            'Content-Length': buffer.length,
            'Cache-Control': 'public, max-age=31536000'
        });
        return res.end(buffer);
    } catch (err) {
        console.error('[chat/messages/media]', err);
        return res.status(500).json({ error: err.message });
    }
});

// DELETE /api/chat/messages
router.delete('/messages', async (req, res) => {
    try {
        const { userId } = req.user;
        await pool.query('DELETE FROM chat_messages WHERE user_id=$1', [userId]);
        return res.json({ success: true, message: 'Chat history cleared' });
    } catch (err) {
        console.error('[chat/messages DELETE]', err);
        return res.status(500).json({ error: err.message });
    }
});

// DELETE /api/chat/messages/:id
router.delete('/messages/:id', async (req, res) => {
    try {
        const { userId } = req.user;
        const { id } = req.params;
        await pool.query('DELETE FROM chat_messages WHERE id=$1 AND user_id=$2', [id, userId]);
        return res.json({ success: true, message: 'Message deleted' });
    } catch (err) {
        console.error('[chat/messages/:id DELETE]', err);
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;

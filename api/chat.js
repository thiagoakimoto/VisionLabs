const express = require('express');
const pool = require('../lib/db');

const router = express.Router();

// GET /api/chat/messages
router.get('/messages', async (req, res) => {
    try {
        const { userId } = req.user;
        const limit = Math.min(parseInt(req.query.limit) || 50, 200);
        const beforeId = req.query.before_id ? parseInt(req.query.before_id) : null;

        let query = `SELECT id, role, content, media_url, media_type, generation_id, created_at
                     FROM chat_messages WHERE user_id=$1`;
        const params = [userId];

        if (beforeId) {
            query += ` AND id < $${params.length + 1}`;
            params.push(beforeId);
        }

        query += ` ORDER BY created_at ASC LIMIT $${params.length + 1}`;
        params.push(limit);

        const result = await pool.query(query, params);
        return res.json({ messages: result.rows });
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

module.exports = router;

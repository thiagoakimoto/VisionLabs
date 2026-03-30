const express = require('express');
const pool = require('../lib/db');

const router = express.Router();

// GET /api/chat/sessions — lista todas as sessões do usuário
router.get('/sessions', async (req, res) => {
    try {
        const { userId } = req.user;
        const result = await pool.query(
            `SELECT
                session_id,
                MIN(created_at) as started_at,
                MAX(created_at) as last_at,
                (SELECT content FROM chat_messages m2
                 WHERE m2.user_id = $1 AND m2.session_id = m.session_id AND m2.role = 'user'
                 ORDER BY m2.created_at ASC LIMIT 1) as title
             FROM chat_messages m
             WHERE user_id = $1
             GROUP BY session_id
             ORDER BY MAX(created_at) DESC
             LIMIT 50`,
            [userId]
        );
        return res.json({ sessions: result.rows });
    } catch (err) {
        console.error('[chat/sessions GET]', err);
        return res.status(500).json({ error: err.message });
    }
});

// GET /api/chat/messages?sessionId=xxx
router.get('/messages', async (req, res) => {
    try {
        const { userId } = req.user;
        const sessionId = req.query.sessionId || 'default-session';
        const limit = Math.min(parseInt(req.query.limit) || 50, 200);
        const beforeId = req.query.before_id ? parseInt(req.query.before_id) : null;

        let query = `SELECT id, role, content, media_type, generation_id, created_at,
                            media_url
                     FROM chat_messages WHERE user_id=$1 AND session_id=$2`;
        const params = [userId, sessionId];

        if (beforeId) {
            query += ` AND id < $${params.length + 1}`;
            params.push(beforeId);
        }

        query += ` ORDER BY created_at ASC LIMIT $${params.length + 1}`;
        params.push(limit);

        const result = await pool.query(query, params);
        const messages = result.rows.map(m => {
            let mediaUrl = null;
            if (m.media_url) {
                // Se já é uma URL (não base64), usa diretamente
                if (m.media_url.startsWith('/') || m.media_url.startsWith('http')) {
                    mediaUrl = m.media_url;
                } else {
                    // É base64: serve via endpoint próprio
                    mediaUrl = `/api/chat/messages/${m.id}/media`;
                }
            }
            return {
                id: m.id,
                role: m.role,
                content: m.content,
                media_type: m.media_type,
                generation_id: m.generation_id,
                created_at: m.created_at,
                media_url: mediaUrl
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
        const { role, content, mediaUrl, mediaType, generationId, sessionId } = req.body;

        if (!role || !content) return res.status(400).json({ error: 'role e content são obrigatórios' });
        if (!['user', 'assistant'].includes(role)) return res.status(400).json({ error: 'role deve ser "user" ou "assistant"' });

        const sid = sessionId || 'default-session';

        const result = await pool.query(
            `INSERT INTO chat_messages (user_id, generation_id, role, content, media_url, media_type, session_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, created_at`,
            [userId, generationId || null, role, content, mediaUrl || null, mediaType || null, sid]
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

// GET /api/chat/messages/:id/media — acesso público (sem auth) para <img> e <video>
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
        let rawUrl = result.rows[0].media_url;
        let mimeType = result.rows[0].media_type;

        // Se o media_url é uma URL (e não base64), redireciona diretamente
        if (rawUrl.startsWith('/') || rawUrl.startsWith('http')) {
            return res.redirect(rawUrl);
        }

        // Normaliza mimeType para base64
        if (!mimeType || mimeType === 'image') mimeType = 'image/png';
        if (mimeType === 'video') mimeType = 'video/mp4';

        let base64Data = rawUrl;
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
                'Cache-Control': 'public, max-age=3600',
            });
            return res.end(buffer.slice(start, end + 1));
        }

        res.writeHead(200, {
            'Content-Type': mimeType,
            'Content-Length': total,
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'public, max-age=3600',
        });
        return res.end(buffer);
    } catch (err) {
        console.error('[chat/messages/media]', err);
        return res.status(500).json({ error: err.message });
    }
});

// DELETE /api/chat/sessions/:sessionId — apaga apenas uma sessão
router.delete('/sessions/:sessionId', async (req, res) => {
    try {
        const { userId } = req.user;
        const { sessionId } = req.params;
        await pool.query('DELETE FROM chat_messages WHERE user_id=$1 AND session_id=$2', [userId, sessionId]);
        return res.json({ success: true });
    } catch (err) {
        console.error('[chat/sessions/:id DELETE]', err);
        return res.status(500).json({ error: err.message });
    }
});

// DELETE /api/chat/messages (legado — mantido para compatibilidade)
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

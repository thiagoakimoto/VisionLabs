const express = require('express');
const pool = require('../lib/db');

const router = express.Router();

// GET /api/settings
router.get('/', async (req, res) => {
    try {
        const { userId } = req.user;

        const result = await pool.query(
            `SELECT first_name, last_name, default_resolution, default_aspect_ratio, hardware_acceleration
             FROM user_settings WHERE user_id=$1`,
            [userId]
        );

        if (!result.rows.length) {
            return res.json({
                firstName: '',
                lastName: '',
                defaultResolution: '720p',
                defaultAspectRatio: '16:9',
                hardwareAcceleration: true
            });
        }

        const s = result.rows[0];
        return res.json({
            firstName: s.first_name || '',
            lastName: s.last_name || '',
            defaultResolution: s.default_resolution,
            defaultAspectRatio: s.default_aspect_ratio,
            hardwareAcceleration: s.hardware_acceleration
        });
    } catch (err) {
        console.error('[settings GET]', err);
        return res.status(500).json({ error: err.message });
    }
});

// PUT /api/settings
router.put('/', async (req, res) => {
    try {
        const { userId } = req.user;
        const { firstName, lastName, defaultResolution, defaultAspectRatio, hardwareAcceleration } = req.body;

        await pool.query(
            `INSERT INTO user_settings (user_id, first_name, last_name, default_resolution, default_aspect_ratio, hardware_acceleration, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW())
             ON CONFLICT (user_id) DO UPDATE SET
               first_name=$2, last_name=$3, default_resolution=$4,
               default_aspect_ratio=$5, hardware_acceleration=$6, updated_at=NOW()`,
            [userId, firstName || null, lastName || null,
             defaultResolution || '720p', defaultAspectRatio || '16:9',
             hardwareAcceleration !== undefined ? hardwareAcceleration : true]
        );

        return res.json({ success: true });
    } catch (err) {
        console.error('[settings PUT]', err);
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;

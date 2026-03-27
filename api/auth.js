const express = require('express');
const pool = require('../lib/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Chave secreta para assinatura dos tokens JWT
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_visionlabs';

// ==========================================
// ROTA 1: REGISTER (Criação de Usuário)
// ==========================================
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    try {
        // 1. Verifica se o usuário já existe
        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(409).json({ error: 'E-mail já cadastrado na plataforma.' });
        }

        // 2. Hash da senha
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // 3. Insere o novo usuário no Neon DB
        const insertQuery = `
      INSERT INTO users (email, password_hash) 
      VALUES ($1, $2) 
      RETURNING id, email, created_at
    `;
        const newUserResult = await pool.query(insertQuery, [email, passwordHash]);
        const user = newUserResult.rows[0];

        // 4. Gera o Token JWT para login imediato (opcional, mas proativo)
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Conta criada com sucesso!',
            user: { id: user.id, email: user.email },
            token
        });

    } catch (error) {
        console.error('Erro no registro /api/auth/register:', error);
        res.status(500).json({ error: 'Erro interno ao processar cadastro.' });
    }
});

// ==========================================
// ROTA 2: LOGIN (Autenticação de Usuário)
// ==========================================
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    try {
        // 1. Busca o usuário pelo e-mail
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        const user = userResult.rows[0];

        // 2. Compara a hash da senha
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        // 3. Gera e assina o Token JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: 'Login realizado com sucesso!',
            user: { id: user.id, email: user.email },
            token
        });

    } catch (error) {
        console.error('Erro no login /api/auth/login:', error);
        res.status(500).json({ error: 'Erro interno ao processar login.' });
    }
});

module.exports = router;

const express = require('express');
const { register, login, getProfile } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Rutas públicas para registro y login
router.post('/register', register);
router.post('/login', login);

// Rutas protegidas para obtener el perfil del usuario
router.get('/me', authMiddleware, getProfile);

module.exports = router;
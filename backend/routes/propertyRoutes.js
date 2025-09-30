const express = require('express');
const { 
  getAllProperties, 
  getPropertyById, 
  createProperty, 
  updateProperty, 
  deleteProperty 
} = require('../controllers/propertyController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Rutas públicas
router.get('/', getAllProperties);
router.get('/:id', getPropertyById);

// Rutas protegidas (requieren autenticación)
router.post('/', authMiddleware, createProperty);
router.put('/:id', authMiddleware, updateProperty);
router.delete('/:id', authMiddleware, deleteProperty);

module.exports = router;
// Middleware de autenticación tipo JWT simple
// En producción, usa verificación JWT adecuada

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const token = authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    // Validación simple de token (en producción, verifica JWT correctamente)
    if (token.startsWith('fake-jwt-token-')) {
      const userId = token.replace('fake-jwt-token-', '');
      req.user = { userId };
      next();
    } else {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;

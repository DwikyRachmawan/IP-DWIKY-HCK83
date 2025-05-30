const { verifyToken } = require('../helpers/jwt');
const { User } = require('../models');

const authentication = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    
    if (!authorization) {
      return res.status(401).json({ message: 'Token akses diperlukan' });
    }

    const token = authorization.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Format token tidak valid' });
    }

    const decoded = verifyToken(token);
    
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'Token tidak valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token tidak valid' });
  }
};

module.exports = authentication;

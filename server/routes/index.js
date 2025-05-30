const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const digimonRoutes = require('./digimon');
const fusionRoutes = require('./fusion');
const favoriteRoutes = require('./favorite');

// Welcome route
router.get('/', (req, res) => {
  res.json({
    message: '🔥 Welcome to Digimon Fusion Generator API!',
    version: '1.0.0',
    endpoints: {
      auth: '/auth (POST /register, POST /login, GET /profile, PUT /profile, DELETE /profile)',
      digimon: '/digimon (GET /)',
      fusion: '/fusion (POST /, GET /history)',
      favorites: '/favorites (POST /, GET /, DELETE /:digimonName, GET /check/:digimonName)'
    }
  });
});

// Route modules
router.use('/auth', authRoutes);
router.use('/digimon', digimonRoutes);
router.use('/fusion', fusionRoutes);
router.use('/favorites', favoriteRoutes);

module.exports = router;

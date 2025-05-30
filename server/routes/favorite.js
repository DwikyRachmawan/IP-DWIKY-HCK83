const express = require('express');
const router = express.Router();
const FavoriteController = require('../controllers/favoriteController');
const authentication = require('../middlewares/authentication');

// Protected routes - user harus login
router.post('/', authentication, FavoriteController.addFavorite);
router.get('/', authentication, FavoriteController.getFavorites);
router.delete('/:digimonName', authentication, FavoriteController.removeFavorite);
router.get('/check/:digimonName', authentication, FavoriteController.checkFavorite);

module.exports = router;

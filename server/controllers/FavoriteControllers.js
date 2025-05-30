const { Favorite } = require('../models');
const axios = require('axios');

class FavoriteController {
  static async addFavorite(req, res, next) {
    try {
      const { digimonName } = req.body;
      const userId = req.user.id;

      if (!digimonName) {
        return res.status(400).json({
          message: 'Digimon name is required'
        });
      }

      // Check if already favorited
      const existingFavorite = await Favorite.findOne({
        where: { userId, digimonName }
      });

      if (existingFavorite) {
        return res.status(400).json({
          message: 'Digimon sudah ada di favorites'
        });
      }

      // Fetch Digimon data from external API
      const response = await axios.get(process.env.DIGIMON_API_URL);
      const digimons = response.data;
      const digimonData = digimons.find(d => d.name.toLowerCase() === digimonName.toLowerCase());

      if (!digimonData) {
        return res.status(404).json({
          message: 'Digimon tidak ditemukan'
        });
      }

      // Save to favorites
      const favorite = await Favorite.create({
        userId,
        digimonName: digimonData.name,
        digimonLevel: digimonData.level,
        digimonImage: digimonData.img
      });

      res.status(201).json({
        message: 'Digimon berhasil ditambahkan ke favorites',
        favorite
      });
    } catch (error) {
      next(error);
    }
  }

  static async getFavorites(req, res, next) {
    try {
      const userId = req.user.id;

      const favorites = await Favorite.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']]
      });

      res.json({
        message: 'Favorites berhasil diambil',
        data: favorites
      });
    } catch (error) {
      next(error);
    }
  }

  static async removeFavorite(req, res, next) {
    try {
      const { digimonName } = req.params;
      const userId = req.user.id;

      const favorite = await Favorite.findOne({
        where: { userId, digimonName }
      });

      if (!favorite) {
        return res.status(404).json({
          message: 'Favorite tidak ditemukan'
        });
      }

      await favorite.destroy();

      res.json({
        message: 'Digimon berhasil dihapus dari favorites'
      });
    } catch (error) {
      next(error);
    }
  }

  static async checkFavorite(req, res, next) {
    try {
      const { digimonName } = req.params;
      const userId = req.user.id;

      const favorite = await Favorite.findOne({
        where: { userId, digimonName }
      });

      res.json({
        isFavorite: !!favorite
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FavoriteController;

const { FusionHistory } = require('../models');
const { generateFusionWithGemini } = require('../helpers/gemini');
const axios = require('axios');

class FusionController {
  static async createFusion(req, res, next) {
    try {
      const { digimon1, digimon2 } = req.body;

      if (!digimon1 || !digimon2) {
        return res.status(400).json({
          message: 'Digimon1 dan Digimon2 harus diisi'
        });
      }

      if (digimon1 === digimon2) {
        return res.status(400).json({
          message: 'Pilih 2 Digimon yang berbeda'
        });
      }

      // Fetch Digimon data from external API
      const fetchDigimonData = async (name) => {
        try {
          const response = await axios.get(`${process.env.DIGIMON_API_URL}`);
          const digimons = response.data;
          return digimons.find(d => d.name.toLowerCase() === name.toLowerCase());
        } catch (error) {
          console.error('Error fetching Digimon data:', error.message);
          return null;
        }
      };

      const digimon1Data = await fetchDigimonData(digimon1);
      const digimon2Data = await fetchDigimonData(digimon2);

      if (!digimon1Data || !digimon2Data) {
        return res.status(404).json({
          message: 'Satu atau kedua Digimon tidak ditemukan'
        });
      }

      console.log('Digimon data fetched:', {
        digimon1: digimon1Data.name,
        digimon1Image: digimon1Data.img,
        digimon2: digimon2Data.name,
        digimon2Image: digimon2Data.img
      });

      // Generate fusion using Gemini AI with images
      const fusionResult = await generateFusionWithGemini(
        digimon1,
        digimon2,
        digimon1Data.img,
        digimon2Data.img
      );

      // Check if user has favorited these Digimons
      let digimon1IsFavorite = false;
      let digimon2IsFavorite = false;

      if (req.user) {
        try {
          const { Favorite } = require('../models');
          const favorites = await Favorite.findAll({
            where: { 
              userId: req.user.id,
              digimonName: [digimon1, digimon2]
            }
          });
          
          digimon1IsFavorite = favorites.some(f => f.digimonName === digimon1);
          digimon2IsFavorite = favorites.some(f => f.digimonName === digimon2);
        } catch (favoriteError) {
          console.error('Error checking favorites:', favoriteError.message);
        }
      }

      // Save to history if user is authenticated
      if (req.user) {
        try {
          await FusionHistory.create({
            userId: req.user.id,
            digimon1,
            digimon2,
            fusionName: fusionResult.name,
            fusionDescription: fusionResult.description
          });
        } catch (historyError) {
          console.error('Error saving to history:', historyError.message);
        }
      }

      res.json({
        message: 'Fusion berhasil dibuat',
        fusion: {
          digimon1: digimon1,
          digimon2: digimon2,
          digimon1IsFavorite,
          digimon2IsFavorite,
          ...fusionResult
        }
      });
    } catch (error) {
      console.error('Fusion creation error:', error);
      next(error);
    }
  }

  static async getFusionHistory(req, res, next) {
    try {
      const history = await FusionHistory.findAll({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']]
      });

      res.json({
        message: 'Riwayat fusion berhasil diambil',
        data: history
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FusionController;

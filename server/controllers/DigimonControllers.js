const axios = require('axios');

class DigimonController {
  static async getAllDigimon(req, res, next) {
    try {
      const response = await axios.get(process.env.DIGIMON_API_URL);
      
      // Handle null or invalid 
      const digimonData = response.data || [];
      
      res.json({
        message: 'Digimon data retrieved successfully',
        data: Array.isArray(digimonData) ? digimonData : []
      });
    } catch (error) {
      console.error('Error fetching Digimon data:', error.message);
      
      // Return 503 for external API errors
      res.status(503).json({
        message: 'External API service unavailable',
        error: error.message
      });
    }
  }
}

module.exports = DigimonController;

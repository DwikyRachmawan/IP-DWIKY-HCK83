const request = require('supertest');
const app = require('../app');

describe('Digimon Controller', () => {
  describe('GET /digimon', () => {
    it('should get all digimon successfully', async () => {
      const response = await request(app).get('/digimon');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Digimon data retrieved successfully');
      expect(response.body.data).toHaveLength(3);
      expect(response.body.data[0]).toHaveProperty('name', 'Agumon');
    });

    it('should handle API error', async () => {
      const axios = require('axios');
      const originalGet = axios.get;
      axios.get.mockRejectedValueOnce(new Error('API Error'));

      const response = await request(app).get('/digimon');

      expect(response.status).toBe(503);
      axios.get = originalGet;
    });

    it('should handle empty response', async () => {
      const axios = require('axios');
      const originalGet = axios.get;
      axios.get.mockResolvedValueOnce({ data: [] });

      const response = await request(app).get('/digimon');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
      axios.get = originalGet;
    });

    it('should handle malformed response', async () => {
      const axios = require('axios');
      const originalGet = axios.get;
      axios.get.mockResolvedValueOnce({ data: null });

      const response = await request(app).get('/digimon');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
      axios.get = originalGet;
    });

    it('should handle network timeout', async () => {
      const axios = require('axios');
      const originalGet = axios.get;
      axios.get.mockRejectedValueOnce({ code: 'ECONNABORTED' });

      const response = await request(app).get('/digimon');

      expect(response.status).toBe(503);
      axios.get = originalGet;
    });

    it('should handle invalid JSON response', async () => {
      const axios = require('axios');
      const originalGet = axios.get;
      axios.get.mockResolvedValueOnce({ data: 'invalid json' });

      const response = await request(app).get('/digimon');

      expect(response.status).toBe(200);
      axios.get = originalGet;
    });
  });
});

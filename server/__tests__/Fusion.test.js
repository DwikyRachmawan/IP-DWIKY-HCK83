const request = require('supertest');
const app = require('../app');
const { User, FusionHistory, Favorite } = require('../models');
const { signToken } = require('../helpers/jwt');

describe('Fusion Controller', () => {
  let user, token;

  beforeEach(async () => {
    user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    token = signToken({ id: user.id, email: user.email });
  });

  describe('POST /fusion', () => {
    it('should create fusion successfully', async () => {
      const response = await request(app)
        .post('/fusion')
        .set('Authorization', `Bearer ${token}`)
        .send({
          digimon1: 'Agumon',
          digimon2: 'Gabumon'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Fusion berhasil dibuat');
      expect(response.body.fusion).toHaveProperty('name', 'TestFusion');
      expect(response.body.fusion).toHaveProperty('digimon1IsFavorite', false);
      expect(response.body.fusion).toHaveProperty('digimon2IsFavorite', false);
    });

    it('should show favorite status in fusion result', async () => {
      await Favorite.create({
        userId: user.id,
        digimonName: 'Agumon',
        digimonLevel: 'Rookie',
        digimonImage: 'test.jpg'
      });

      const response = await request(app)
        .post('/fusion')
        .set('Authorization', `Bearer ${token}`)
        .send({
          digimon1: 'Agumon',
          digimon2: 'Gabumon'
        });

      expect(response.status).toBe(200);
      expect(response.body.fusion.digimon1IsFavorite).toBe(true);
      expect(response.body.fusion.digimon2IsFavorite).toBe(false);
    });

    it('should return 400 if digimon1 missing', async () => {
      const response = await request(app)
        .post('/fusion')
        .set('Authorization', `Bearer ${token}`)
        .send({ digimon2: 'Gabumon' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Digimon1 dan Digimon2 harus diisi');
    });

    it('should return 400 if digimon2 missing', async () => {
      const response = await request(app)
        .post('/fusion')
        .set('Authorization', `Bearer ${token}`)
        .send({ digimon1: 'Agumon' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Digimon1 dan Digimon2 harus diisi');
    });

    it('should return 400 if same digimon', async () => {
      const response = await request(app)
        .post('/fusion')
        .set('Authorization', `Bearer ${token}`)
        .send({
          digimon1: 'Agumon',
          digimon2: 'Agumon'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Pilih 2 Digimon yang berbeda');
    });

    it('should return 404 if digimon not found', async () => {
      const axios = require('axios');
      axios.get.mockResolvedValueOnce({
        data: [{ name: 'Agumon', level: 'Rookie', img: 'test.jpg' }]
      });

      const response = await request(app)
        .post('/fusion')
        .set('Authorization', `Bearer ${token}`)
        .send({
          digimon1: 'Agumon',
          digimon2: 'NonExistent'
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Satu atau kedua Digimon tidak ditemukan');
    });

    it('should return 401 if no token', async () => {
      const response = await request(app)
        .post('/fusion')
        .send({
          digimon1: 'Agumon',
          digimon2: 'Gabumon'
        });

      expect(response.status).toBe(401);
    });

    it('should return 404 if digimon not found in API', async () => {
      const axios = require('axios');
        axios.get.mockResolvedValueOnce({ data: [] });
        const response = await request(app)
            .post('/fusion')
            .set('Authorization', `Bearer ${token}`)
            .send({
                digimon1: 'Agumon',
                digimon2: 'Gabumon'
            });
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Satu atau kedua Digimon tidak ditemukan');
    });

    it('should handle axios error gracefully', async () => {
      const axios = require('axios');
      axios.get.mockRejectedValueOnce(new Error('Network error'));

      const response = await request(app)
        .post('/fusion')
        .set('Authorization', `Bearer ${token}`)
        .send({
          digimon1: 'Agumon',
          digimon2: 'Gabumon'
        });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /fusion/history', () => {
    it('should get fusion history successfully', async () => {
        await FusionHistory.create({
            userId: user.id,
            digimon1: 'Agumon',
            digimon2: 'Gabumon',
            fusionName: 'TestFusion',
            fusionDescription: 'Test desc',
            imagePrompt: 'A fusion Digimon combining Agumon and Gabumon'
        });

      const response = await request(app)
        .get('/fusion/history')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toHaveProperty('fusionName', 'TestFusion');
    });

    it('should return empty array if no history', async () => {
      const response = await request(app)
        .get('/fusion/history')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
    });

    it('should return 401 if no token', async () => {
      const response = await request(app).get('/fusion/history');
      expect(response.status).toBe(401);
    });

    it('should only return user history', async () => {
      const otherUser = await User.create({
        username: 'other',
        email: 'other@example.com',
        password: 'password123'
      });

      await FusionHistory.bulkCreate([
        {
          userId: user.id,
          digimon1: 'Agumon',
          digimon2: 'Gabumon',
          fusionName: 'UserFusion',
          fusionDescription: 'User desc',
          imagePrompt: 'User fusion prompt'
        },
        {
          userId: otherUser.id,
          digimon1: 'Patamon',
          digimon2: 'Gomamon',
          fusionName: 'OtherFusion',
          fusionDescription: 'Other desc',
          imagePrompt: 'Other fusion prompt'
        }
      ]);

      const response = await request(app)
        .get('/fusion/history')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].fusionName).toBe('UserFusion');
    });
  });

  describe('Error Handling', () => {
    it('should handle favorites checking error', async () => {
      // Mock Favorite.findAll to throw error
      const originalFindAll = Favorite.findAll;
      Favorite.findAll = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/fusion')
        .set('Authorization', `Bearer ${token}`)
        .send({
          digimon1: 'Agumon',
          digimon2: 'Gabumon'
        });

      expect(response.status).toBe(200);
      expect(response.body.fusion).toHaveProperty('digimon1IsFavorite', false);
      expect(response.body.fusion).toHaveProperty('digimon2IsFavorite', false);

      Favorite.findAll = originalFindAll;
    });

    it('should handle fusion history save error', async () => {
      // Mock FusionHistory.create to throw error
      const originalCreate = FusionHistory.create;
      FusionHistory.create = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/fusion')
        .set('Authorization', `Bearer ${token}`)
        .send({
          digimon1: 'Agumon',
          digimon2: 'Gabumon'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Fusion berhasil dibuat');

      FusionHistory.create = originalCreate;
    });

    it('should handle database error in getFusionHistory', async () => {
      const originalFindAll = FusionHistory.findAll;
      FusionHistory.findAll = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/fusion/history')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(500);

      FusionHistory.findAll = originalFindAll;
    });

    it('should handle general fusion creation error', async () => {
      // Mock generateFusionWithGemini to throw error
      const { generateFusionWithGemini } = require('../helpers/gemini');
      const originalFunction = generateFusionWithGemini;
      
      // Mock the entire module
      jest.doMock('../helpers/gemini', () => ({
        generateFusionWithGemini: jest.fn().mockRejectedValue(new Error('Gemini API error'))
      }));

      const response = await request(app)
        .post('/fusion')
        .set('Authorization', `Bearer ${token}`)
        .send({
          digimon1: 'Agumon',
          digimon2: 'Gabumon'
        });

      expect(response.status).toBe(500);

      // Restore mock
      jest.unmock('../helpers/gemini');
    });
  });
});

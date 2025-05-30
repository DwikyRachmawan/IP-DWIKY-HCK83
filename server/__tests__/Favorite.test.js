const request = require('supertest');
const app = require('../app');
const { User, Favorite } = require('../models');
const { signToken } = require('../helpers/jwt');
const axios = require('axios');

// Mock axios for external API calls
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({
    data: [
      { name: 'Agumon', level: 'Rookie', img: 'agumon.jpg' },
      { name: 'Gabumon', level: 'Rookie', img: 'gabumon.jpg' }
    ]
  }))
}));

describe('Favorite Controller', () => {
  let user, token;

  beforeEach(async () => {
    // Create test user before each test
    user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    token = signToken({ id: user.id, email: user.email });
  });

  afterAll(async () => {
    // Cleanup
    await Favorite.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  beforeEach(async () => {
    // Clear favorites before each test
    await Favorite.destroy({ where: {} });
  });

  describe('POST /favorites', () => {
    it('should add favorite successfully', async () => {
      const response = await request(app)
        .post('/favorites')
        .set('Authorization', `Bearer ${token}`)
        .send({ digimonName: 'Agumon' });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Digimon berhasil ditambahkan ke favorites');
      expect(response.body.favorite).toHaveProperty('digimonName', 'Agumon');
      expect(response.body.favorite).toHaveProperty('digimonLevel', 'Rookie');
    });

    it('should return 400 if name missing', async () => {
      const response = await request(app)
        .post('/favorites')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Digimon name is required');
    });

    it('should return 400 if already favorited', async () => {
      await Favorite.create({
        userId: user.id,
        digimonName: 'Agumon',
        digimonLevel: 'Rookie',
        digimonImage: 'test.jpg'
      });

      const response = await request(app)
        .post('/favorites')
        .set('Authorization', `Bearer ${token}`)
        .send({ digimonName: 'Agumon' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Digimon sudah ada di favorites');
    });

    it('should return 404 if digimon not found', async () => {
      const axios = require('axios');
      axios.get.mockResolvedValueOnce({
        data: [{ name: 'Agumon', level: 'Rookie', img: 'test.jpg' }]
      });

      const response = await request(app)
        .post('/favorites')
        .set('Authorization', `Bearer ${token}`)
        .send({ digimonName: 'NonExistent' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Digimon tidak ditemukan');
    });

    it('should return 401 if no token', async () => {
      const response = await request(app)
        .post('/favorites')
        .send({ digimonName: 'Agumon' });

      expect(response.status).toBe(401);
    });

    it('should handle API error', async () => {
      const axios = require('axios');
      axios.get.mockRejectedValueOnce(new Error('API Error'));

      const response = await request(app)
        .post('/favorites')
        .set('Authorization', `Bearer ${token}`)
        .send({ digimonName: 'Agumon' });

      expect(response.status).toBe(500);
    });
  });

  describe('GET /favorites', () => {
    it('should get favorites successfully', async () => {
      await Favorite.bulkCreate([
        {
          userId: user.id,
          digimonName: 'Agumon',
          digimonLevel: 'Rookie',
          digimonImage: 'test1.jpg'
        },
        {
          userId: user.id,
          digimonName: 'Gabumon',
          digimonLevel: 'Rookie',
          digimonImage: 'test2.jpg'
        }
      ]);

      const response = await request(app)
        .get('/favorites')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Favorites berhasil diambil');
      expect(response.body.data).toHaveLength(2);
    });

    it('should return empty array', async () => {
      const response = await request(app)
        .get('/favorites')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
    });

    it('should return 401 if no token', async () => {
      const response = await request(app).get('/favorites');
      expect(response.status).toBe(401);
    });

    it('should only return user favorites', async () => {
      const otherUser = await User.create({
        username: 'other',
        email: 'other@example.com',
        password: 'password123'
      });

      await Favorite.bulkCreate([
        {
          userId: user.id,
          digimonName: 'Agumon',
          digimonLevel: 'Rookie',
          digimonImage: 'test.jpg'
        },
        {
          userId: otherUser.id,
          digimonName: 'Gabumon',
          digimonLevel: 'Rookie',
          digimonImage: 'test.jpg'
        }
      ]);

      const response = await request(app)
        .get('/favorites')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].digimonName).toBe('Agumon');
    });
  });

  describe('DELETE /favorites/:digimonName', () => {
    it('should remove favorite successfully', async () => {
      await Favorite.create({
        userId: user.id,
        digimonName: 'Agumon',
        digimonLevel: 'Rookie',
        digimonImage: 'test.jpg'
      });

      const response = await request(app)
        .delete('/favorites/Agumon')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Digimon berhasil dihapus dari favorites');
    });

    it('should return 404 if not found', async () => {
      const response = await request(app)
        .delete('/favorites/NonExistent')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Favorite tidak ditemukan');
    });

    it('should return 401 if no token', async () => {
      const response = await request(app).delete('/favorites/Agumon');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /favorites/check/:digimonName', () => {
    it('should return true if favorited', async () => {
      await Favorite.create({
        userId: user.id,
        digimonName: 'Agumon',
        digimonLevel: 'Rookie',
        digimonImage: 'test.jpg'
      });

      const response = await request(app)
        .get('/favorites/check/Agumon')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.isFavorite).toBe(true);
    });

    it('should return false if not favorited', async () => {
      const response = await request(app)
        .get('/favorites/check/Gabumon')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.isFavorite).toBe(false);
    });

    it('should return 401 if no token', async () => {
      const response = await request(app).get('/favorites/check/Agumon');
      expect(response.status).toBe(401);
    });
  });
});

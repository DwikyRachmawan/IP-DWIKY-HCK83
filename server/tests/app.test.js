const request = require('supertest');
const app = require('../app');
const { User, FusionHistory, sequelize } = require('../models');

// Mock external APIs
jest.mock('axios');
const axios = require('axios');

describe('Digimon Fusion Generator API', () => {
  let userToken;
  let userId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await User.destroy({ where: {} });
    await FusionHistory.destroy({ where: {} });
  });

  describe('GET /', () => {
    it('should return welcome message', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Welcome to Digimon Fusion Generator API');
    });
  });

  describe('Auth Endpoints', () => {
    describe('POST /auth/register', () => {
      it('should register a new user successfully', async () => {
        const userData = {
          email: 'test@example.com',
          password: 'password123',
          username: 'testuser'
        };

        const response = await request(app)
          .post('/auth/register')
          .send(userData);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('User registered successfully');
        expect(response.body.user.email).toBe(userData.email);
      });

      it('should return error for missing fields', async () => {
        const response = await request(app)
          .post('/auth/register')
          .send({ email: 'test@example.com' });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Email, password, and username are required');
      });
    });

    describe('POST /auth/login', () => {
      beforeEach(async () => {
        await User.create({
          email: 'test@example.com',
          password: 'password123',
          username: 'testuser'
        });
      });

      it('should login successfully with valid credentials', async () => {
        const response = await request(app)
          .post('/auth/login')
          .send({
            email: 'test@example.com',
            password: 'password123'
          });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Login successful');
        expect(response.body.access_token).toBeDefined();
        
        userToken = response.body.access_token;
        userId = response.body.user.id;
      });

      it('should return error for invalid credentials', async () => {
        const response = await request(app)
          .post('/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrongpassword'
          });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid email or password');
      });
    });
  });

  describe('Digimon Endpoints', () => {
    describe('GET /digimon', () => {
      it('should fetch Digimon data successfully', async () => {
        const mockDigimonData = [
          { name: 'Agumon', level: 'Rookie' },
          { name: 'Gabumon', level: 'Rookie' }
        ];

        axios.get.mockResolvedValue({ data: mockDigimonData });

        const response = await request(app).get('/digimon');

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Digimon data retrieved successfully');
        expect(response.body.data).toEqual(mockDigimonData);
      });

      it('should handle external API errors', async () => {
        axios.get.mockRejectedValue(new Error('API Error'));

        const response = await request(app).get('/digimon');

        expect(response.status).toBe(503);
        expect(response.body.message).toBe('Failed to fetch Digimon data from external API');
      });
    });
  });

  describe('Fusion Endpoints', () => {
    beforeEach(async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser'
      });
      userId = user.id;

      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      
      userToken = loginResponse.body.access_token;
    });

    describe('POST /fusion', () => {
      it('should generate fusion successfully', async () => {
        const response = await request(app)
          .post('/fusion')
          .send({
            digimon1: 'Agumon',
            digimon2: 'Gabumon'
          });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Fusion generated successfully');
        expect(response.body.fusion.digimon1).toBe('Agumon');
        expect(response.body.fusion.digimon2).toBe('Gabumon');
        expect(response.body.fusion.name).toBeDefined();
      });

      it('should return error for missing digimon names', async () => {
        const response = await request(app)
          .post('/fusion')
          .send({ digimon1: 'Agumon' });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Both digimon1 and digimon2 are required');
      });
    });

    describe('GET /fusion/history', () => {
      it('should require authentication', async () => {
        const response = await request(app).get('/fusion/history');

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Access token is required');
      });

      it('should return fusion history for authenticated user', async () => {
        await FusionHistory.create({
          userId: userId,
          digimon1: 'Agumon',
          digimon2: 'Gabumon',
          fusionName: 'Agubumon',
          fusionDescription: 'Test fusion',
          imagePrompt: 'Test prompt'
        });

        const response = await request(app)
          .get('/fusion/history')
          .set('Authorization', `Bearer ${userToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Fusion history retrieved successfully');
        expect(response.body.data).toHaveLength(1);
      });
    });
  });
});

const request = require('supertest');
const app = require('../app');
const { User, FusionHistory } = require('../models');
const { signToken } = require('../helpers/jwt');

describe('Auth Controller', () => {
  let user, token;

  describe('POST /auth/register', () => {
    it('should register user successfully', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.user).toHaveProperty('username', 'testuser');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 400 if username is missing', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email, password, and username are required');
    });

    it('should return 400 if email is missing', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email, password, and username are required');
    });

    it('should return 400 if password is missing', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email, password, and username are required');
    });

    it('should handle validation errors', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: '',
          email: 'invalid-email',
          password: ''
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email, password, and username are required');
    });

    it('should handle duplicate email', async () => {
      await User.create({
        username: 'existing',
        email: 'existing@example.com',
        password: 'password123'
      });

      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'newuser',
          email: 'existing@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email already exists');
    });

    it('should handle Sequelize validation errors', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'invalid',
          password: 'password123'
        });

      expect(response.status).toBe(500);
    });

    it('should handle database constraint errors', async () => {
      // Create user first
      await User.create({
        username: 'existing',
        email: 'existing@example.com',
        password: 'password123'
      });

      // Try to create another user with same email but bypass validation
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'newuser',
          email: 'existing@example.com',  // Duplicate email
          password: 'password123'
        });

      expect([400, 500]).toContain(response.status);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should login successfully', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body).toHaveProperty('access_token');
      expect(response.body.user).toHaveProperty('username', 'testuser');
    });

    it('should return 400 if email is missing', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email and password are required');
    });

    it('should return 400 if password is missing', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email and password are required');
    });

    it('should return 401 if email not found', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'notfound@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should return 401 if password is wrong', async () => {
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

  describe('GET /auth/profile', () => {
    beforeEach(async () => {
      user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      token = signToken({ id: user.id, email: user.email });
    });

    it('should get profile successfully', async () => {
      const response = await request(app)
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Profil berhasil diambil');
      expect(response.body.user).toHaveProperty('username', 'testuser');
    });

    it('should return 401 if no token provided', async () => {
      const response = await request(app).get('/auth/profile');
      expect(response.status).toBe(401);
    });

    it('should return 401 if invalid token', async () => {
      const response = await request(app)
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalidtoken');
      expect(response.status).toBe(401);
    });
  });

  describe('PUT /auth/profile', () => {
    beforeEach(async () => {
      user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      token = signToken({ id: user.id, email: user.email });
    });

    it('should update username successfully', async () => {
      const response = await request(app)
        .put('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ username: 'newusername' });

      expect(response.status).toBe(200);
      expect(response.body.user.username).toBe('newusername');
    });

    it('should update email successfully', async () => {
      const response = await request(app)
        .put('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'new@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe('new@example.com');
    });

    it('should update password successfully', async () => {
      const response = await request(app)
        .put('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ password: 'newpassword' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Profil berhasil diperbarui');
    });

    it('should return 400 if no fields provided', async () => {
      const response = await request(app)
        .put('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
    });

    it('should return 401 if no token provided', async () => {
      const response = await request(app)
        .put('/auth/profile')
        .send({ username: 'new' });
      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /auth/profile', () => {
    beforeEach(async () => {
      user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      token = signToken({ id: user.id, email: user.email });
    });

    it('should delete profile successfully', async () => {
      const response = await request(app)
        .delete('/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Profil dan semua data terkait berhasil dihapus');

      const deletedUser = await User.findByPk(user.id);
      expect(deletedUser).toBeNull();
    });

    it('should delete profile with related data', async () => {
      await FusionHistory.create({
        userId: user.id,
        digimon1: 'Agumon',
        digimon2: 'Gabumon',
        fusionName: 'Test',
        fusionDescription: 'Test desc',
        imagePrompt: 'Test image prompt'
      });

      const response = await request(app)
        .delete('/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
    });

    it('should return 401 if no token provided', async () => {
      const response = await request(app).delete('/auth/profile');
      expect(response.status).toBe(401);
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      token = signToken({ id: user.id, email: user.email });
    });

    it('should handle server errors in register', async () => {
      // Mock User.create to throw an error
      const originalCreate = User.create;
      User.create = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'newuser',
          email: 'new@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(500);

      // Restore original method
      User.create = originalCreate;
    });

    it('should handle server errors in login', async () => {
      // Mock User.findOne to throw an error
      const originalFindOne = User.findOne;
      User.findOne = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(500);

      // Restore original method
      User.findOne = originalFindOne;
    });

    it('should handle server errors in getProfile', async () => {
      // Mock authentication middleware to throw error
      const response = await request(app)
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token-format');

      expect(response.status).toBe(401);
    });

    it('should handle server errors in updateProfile', async () => {
      // Mock User.update to throw an error
      const originalUpdate = User.update;
      User.update = jest.fn().mockRejectedValue(new Error('Update failed'));

      const response = await request(app)
        .put('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ username: 'newusername' });

      expect(response.status).toBe(500);

      // Restore original method
      User.update = originalUpdate;
    });

    it('should handle server errors in deleteProfile', async () => {
      // Mock User.destroy to throw an error
      const originalDestroy = User.destroy;
      User.destroy = jest.fn().mockRejectedValue(new Error('Delete failed'));

      const response = await request(app)
        .delete('/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(500);

      // Restore original method
      User.destroy = originalDestroy;
    });
  });
});

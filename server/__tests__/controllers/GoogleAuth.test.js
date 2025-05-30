const GoogleAuthController = require('../../controllers/GoogleAuthControllers');
const { User } = require('../../models');
const { signToken } = require('../../helpers/jwt');
const { OAuth2Client } = require('google-auth-library');

// Mock dependencies
jest.mock('../../models');
jest.mock('../../helpers/jwt');
jest.mock('google-auth-library');

describe('GoogleAuthController', () => {
  let mockReq, mockRes, mockNext;
  let mockClient;

  beforeEach(() => {
    mockReq = {
      body: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();

    mockClient = {
      verifyIdToken: jest.fn()
    };
    OAuth2Client.mockImplementation(() => mockClient);

    jest.clearAllMocks();
  });

  describe('googleLogin', () => {
    const mockPayload = {
      email: 'test@gmail.com',
      name: 'Test User'
    };

    it('should login existing user successfully', async () => {
      const existingUser = {
        id: 1,
        email: 'test@gmail.com',
        username: 'test'
      };

      mockReq.body.id_token = 'valid-google-token';
      
      mockClient.verifyIdToken.mockResolvedValue({
        getPayload: () => mockPayload
      });
      
      User.findOne.mockResolvedValue(existingUser);
      signToken.mockReturnValue('jwt-token');

      await GoogleAuthController.googleLogin(mockReq, mockRes, mockNext);

      expect(mockClient.verifyIdToken).toHaveBeenCalledWith({
        idToken: 'valid-google-token',
        audience: process.env.client_id
      });
      expect(User.findOne).toHaveBeenCalledWith({
        where: { email: 'test@gmail.com' }
      });
      expect(signToken).toHaveBeenCalledWith({ id: 1 });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Login berhasil',
        access_token: 'jwt-token'
      });
    });    it('should create new user and login when user does not exist', async () => {
      const newUser = {
        id: 2,
        email: 'newuser@gmail.com',
        username: 'newuser'
      };

      mockReq.body.id_token = 'valid-google-token';
      
      mockClient.verifyIdToken.mockResolvedValue({
        getPayload: () => ({ email: 'newuser@gmail.com' })
      });
      
      User.findOne.mockResolvedValue(null); // User tidak ditemukan
      User.create.mockResolvedValue(newUser);
      signToken.mockReturnValue('jwt-token-new');

      await GoogleAuthController.googleLogin(mockReq, mockRes, mockNext);

      expect(User.findOne).toHaveBeenCalledWith({
        where: { email: 'newuser@gmail.com' }
      });
      expect(User.create).toHaveBeenCalledWith({
        username: 'newuser',
        email: 'newuser@gmail.com',
        password: expect.any(String)
      });
      expect(signToken).toHaveBeenCalledWith({ id: 2 });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'User berhasil dibuat dan login',
        access_token: 'jwt-token-new'
      });
    });

    it('should handle Google token verification error', async () => {
      mockReq.body.id_token = 'invalid-google-token';
      
      mockClient.verifyIdToken.mockRejectedValue(new Error('Invalid token'));

      await GoogleAuthController.googleLogin(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle database error when finding user', async () => {
      mockReq.body.id_token = 'valid-google-token';
      
      mockClient.verifyIdToken.mockResolvedValue({
        getPayload: () => mockPayload
      });
      
      User.findOne.mockRejectedValue(new Error('Database error'));

      await GoogleAuthController.googleLogin(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle database error when creating user', async () => {
      mockReq.body.id_token = 'valid-google-token';
      
      mockClient.verifyIdToken.mockResolvedValue({
        getPayload: () => mockPayload
      });
      
      User.findOne.mockResolvedValue(null);
      User.create.mockRejectedValue(new Error('Database create error'));

      await GoogleAuthController.googleLogin(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle token signing error', async () => {
      const existingUser = {
        id: 1,
        email: 'test@gmail.com',
        username: 'test'
      };

      mockReq.body.id_token = 'valid-google-token';
      
      mockClient.verifyIdToken.mockResolvedValue({
        getPayload: () => mockPayload
      });
      
      User.findOne.mockResolvedValue(existingUser);
      signToken.mockImplementation(() => {
        throw new Error('Token signing error');
      });

      await GoogleAuthController.googleLogin(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle email with complex domain for username generation', async () => {
      const newUser = {
        id: 3,
        email: 'complex.email@sub.domain.com',
        username: 'complex.email'
      };

      mockReq.body.id_token = 'valid-google-token';
      
      mockClient.verifyIdToken.mockResolvedValue({
        getPayload: () => ({ email: 'complex.email@sub.domain.com' })
      });
      
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(newUser);
      signToken.mockReturnValue('jwt-token-complex');

      await GoogleAuthController.googleLogin(mockReq, mockRes, mockNext);

      expect(User.create).toHaveBeenCalledWith({
        username: 'complex.email',
        email: 'complex.email@sub.domain.com',
        password: expect.any(String)
      });
    });

    it('should generate random password for new users', async () => {
      const newUser = {
        id: 4,
        email: 'random@gmail.com',
        username: 'random'
      };

      mockReq.body.id_token = 'valid-google-token';
      
      mockClient.verifyIdToken.mockResolvedValue({
        getPayload: () => ({ email: 'random@gmail.com' })
      });
      
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(newUser);
      signToken.mockReturnValue('jwt-token-random');

      await GoogleAuthController.googleLogin(mockReq, mockRes, mockNext);

      const createCall = User.create.mock.calls[0][0];
      expect(createCall.password).toBeTruthy();
      expect(typeof createCall.password).toBe('string');
      expect(createCall.password.length).toBeGreaterThan(0);
    });
  });
});

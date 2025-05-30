const authentication = require('../../middlewares/authentication');
const { verifyToken } = require('../../helpers/jwt');
const { User } = require('../../models');

// Mock dependencies
jest.mock('../../helpers/jwt');
jest.mock('../../models');

describe('Authentication Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    
    jest.clearAllMocks();
  });

  it('should pass authentication with valid token', async () => {
    const mockUser = { id: 1, email: 'test@example.com' };
    
    mockReq.headers.authorization = 'Bearer valid-token';
    verifyToken.mockReturnValue({ id: 1, email: 'test@example.com' });
    User.findByPk.mockResolvedValue(mockUser);

    await authentication(mockReq, mockRes, mockNext);

    expect(verifyToken).toHaveBeenCalledWith('valid-token');
    expect(User.findByPk).toHaveBeenCalledWith(1);
    expect(mockReq.user).toBe(mockUser);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should return 401 when no authorization header', async () => {
    await authentication(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Token akses diperlukan'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 when authorization header is empty', async () => {
    mockReq.headers.authorization = '';

    await authentication(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Token akses diperlukan'
    });
  });

  it('should return 401 when token is missing from Bearer format', async () => {
    mockReq.headers.authorization = 'Bearer';

    await authentication(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Format token tidak valid'
    });
  });

  it('should return 401 when token format is invalid', async () => {
    mockReq.headers.authorization = 'InvalidFormat';

    await authentication(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Format token tidak valid'
    });
  });

  it('should return 401 when user not found', async () => {
    mockReq.headers.authorization = 'Bearer valid-token';
    verifyToken.mockReturnValue({ id: 999, email: 'test@example.com' });
    User.findByPk.mockResolvedValue(null);

    await authentication(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Token tidak valid'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 when token verification fails', async () => {
    mockReq.headers.authorization = 'Bearer invalid-token';
    verifyToken.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await authentication(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Token tidak valid'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 when database query fails', async () => {
    mockReq.headers.authorization = 'Bearer valid-token';
    verifyToken.mockReturnValue({ id: 1, email: 'test@example.com' });
    User.findByPk.mockRejectedValue(new Error('Database error'));

    await authentication(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Token tidak valid'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});

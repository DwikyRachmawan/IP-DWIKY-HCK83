const errorHandler = require('../../middlewares/errorHandler');

describe('Error Handler Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    
    // Mock console.error to avoid clutter in test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should handle SequelizeValidationError', () => {
    const error = {
      name: 'SequelizeValidationError',
      errors: [
        { message: 'Email is required' },
        { message: 'Password must be at least 6 characters' }
      ]
    };

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Email is required, Password must be at least 6 characters'
    });
  });

  it('should handle SequelizeUniqueConstraintError', () => {
    const error = {
      name: 'SequelizeUniqueConstraintError',
      errors: [
        { message: 'Email must be unique' }
      ]
    };

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Email must be unique'
    });
  });

  it('should handle JsonWebTokenError', () => {
    const error = {
      name: 'JsonWebTokenError',
      message: 'invalid signature'
    };

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Invalid token'
    });
  });

  it('should handle TokenExpiredError', () => {
    const error = {
      name: 'TokenExpiredError',
      message: 'jwt expired'
    };

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Token expired'
    });
  });

  it('should handle ExternalAPIError', () => {
    const error = {
      name: 'ExternalAPIError',
      message: 'API service is down'
    };

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(503);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'API service is down'
    });
  });

  it('should handle ExternalAPIError without message', () => {
    const error = {
      name: 'ExternalAPIError'
    };

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(503);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'External API service unavailable'
    });
  });

  it('should handle GoogleAuthError', () => {
    const error = {
      name: 'GoogleAuthError',
      message: 'Invalid Google token'
    };

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Invalid Google token'
    });
  });

  it('should handle GoogleAuthError without message', () => {
    const error = {
      name: 'GoogleAuthError'
    };

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Google authentication failed'
    });
  });

  it('should handle unknown error with message', () => {
    const error = {
      name: 'CustomError',
      message: 'Something went wrong'
    };

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Something went wrong'
    });
  });

  it('should handle unknown error without message', () => {
    const error = {
      name: 'UnknownError'
    };

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Internal Server Error'
    });
  });

  it('should handle generic Error object', () => {
    const error = new Error('Generic error message');

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Generic error message'
    });
  });
});

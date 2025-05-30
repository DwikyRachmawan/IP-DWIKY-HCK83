const errorHandler = (err, req, res, next) => {
  let status = 500;
  let message = 'Internal Server Error';

  console.error('Error:', err);

  switch (err.name) {
    case 'SequelizeValidationError':
      status = 400;
      message = err.errors.map(error => error.message).join(', ');
      break;
    case 'SequelizeUniqueConstraintError':
      status = 400;
      message = err.errors.map(error => error.message).join(', ');
      break;
    case 'JsonWebTokenError':
      status = 401;
      message = 'Invalid token';
      break;
    case 'TokenExpiredError':
      status = 401;
      message = 'Token expired';
      break;
    case 'ExternalAPIError':
      status = 503;
      message = err.message || 'External API service unavailable';
      break;
    case 'GoogleAuthError':
      status = 401;
      message = err.message || 'Google authentication failed';
      break;
    default:
      if (err.message) {
        message = err.message;
      }
  }

  res.status(status).json({ message });
};

module.exports = errorHandler;

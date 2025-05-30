// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key_for_testing';
process.env.GEMINI_API_KEY = 'test_gemini_key';
process.env.STABILITY_API_KEY = 'sk-test_stability_key';
process.env.DIGIMON_API_URL = 'https://digimon-api.vercel.app/api/digimon';

const { sequelize } = require('../models');

// Jest configuration inline
module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'controllers/**/*.js',
    'helpers/**/*.js',
    'middlewares/**/*.js',
    '!**/__tests__/**',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};

// Global test setup
beforeAll(async () => {
  try {
    // Force sync database for testing
    await sequelize.sync({ force: true });
    console.log('Test database synced successfully');
  } catch (error) {
    console.error('Database sync error:', error);
    throw error;
  }
}, 30000); // 30 second timeout

afterAll(async () => {
  try {
    // Close database connection after all tests
    await sequelize.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Database close error:', error);
  }
}, 10000);

// Clear database between tests
beforeEach(async () => {
  try {
    const models = sequelize.models;
    await models.Favorite?.destroy({ where: {}, force: true });
    await models.FusionHistory?.destroy({ where: {}, force: true });
    await models.User?.destroy({ where: {}, force: true });
  } catch (error) {
    console.error('Cleanup error:', error);
  }
});

// Mock external APIs globally
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({
    data: [
      { name: 'Agumon', level: 'Rookie', img: 'https://digimon.shadowsmith.com/img/agumon.jpg' },
      { name: 'Gabumon', level: 'Rookie', img: 'https://digimon.shadowsmith.com/img/gabumon.jpg' },
      { name: 'Patamon', level: 'Rookie', img: 'https://digimon.shadowsmith.com/img/patamon.jpg' }
    ]
  })),
  postForm: jest.fn(() => Promise.resolve({
    status: 200,
    data: Buffer.from('fake-image-data'),
    headers: { 'content-type': 'image/jpeg' }
  }))
}));

// Mock Gemini helper
jest.mock('../helpers/gemini', () => ({
  generateFusionWithGemini: jest.fn(() => Promise.resolve({
    name: 'TestFusion',
    description: 'A powerful fusion combining the abilities of two Digimon',
    level: 'Champion',
    type: 'Vaccine',
    imagePrompt: 'A fusion Digimon with combined characteristics',
    fusionImage: 'data:image/jpeg;base64,fake-base64-data',
    originalImages: {
      digimon1: 'https://digimon.shadowsmith.com/img/agumon.jpg',
      digimon2: 'https://digimon.shadowsmith.com/img/gabumon.jpg'
    }
  }))
}));

// Suppress console output during tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn()
};

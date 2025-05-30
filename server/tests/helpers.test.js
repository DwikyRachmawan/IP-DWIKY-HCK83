const { generateToken, verifyToken } = require('../helpers/jwt');
const { generateFusionWithGemini } = require('../helpers/gemini');

// Mock axios for Gemini API tests
jest.mock('axios');
const axios = require('axios');

describe('Helper Functions', () => {
  describe('JWT Helper', () => {
    it('should generate and verify token successfully', () => {
      const payload = { id: 1, email: 'test@example.com' };
      const token = generateToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      const decoded = verifyToken(token);
      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        verifyToken('invalid_token');
      }).toThrow();
    });
  });

  describe('Gemini AI Helper', () => {
    it('should generate fusion successfully', async () => {
      const mockResponse = {
        data: {
          candidates: [{
            content: {
              parts: [{
                text: '{"name": "AguGabumon", "description": "A fusion of Agumon and Gabumon", "imagePrompt": "A dragon-wolf hybrid"}'
              }]
            }
          }]
        }
      };

      axios.post.mockResolvedValue(mockResponse);

      const result = await generateFusionWithGemini('Agumon', 'Gabumon');

      expect(result.name).toBe('AguGabumon');
      expect(result.description).toBe('A fusion of Agumon and Gabumon');
      expect(result.imagePrompt).toBe('A dragon-wolf hybrid');
    });

    it('should provide fallback when Gemini API fails', async () => {
      axios.post.mockRejectedValue(new Error('API Error'));

      const result = await generateFusionWithGemini('Agumon', 'Gabumon');

      expect(result.name).toBe('AgumonGabumon');
      expect(result.description).toContain('Agumon');
      expect(result.description).toContain('Gabumon');
      expect(result.imagePrompt).toContain('Agumon');
      expect(result.imagePrompt).toContain('Gabumon');
    });
  });
});

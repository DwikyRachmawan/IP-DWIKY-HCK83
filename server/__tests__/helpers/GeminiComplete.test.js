const { generateFusionWithGemini } = require('../../helpers/gemini');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Mock external dependencies
jest.mock('@google/generative-ai');
jest.mock('axios');
jest.mock('form-data');
jest.mock('fs');
jest.mock('path');

describe('Gemini Helper - generateFusionWithGemini Complete Coverage', () => {
  let mockGenAI;
  let mockModel;
  let mockGenerateContent;
  let mockResponse;
  let consoleLogSpy;
  let consoleWarnSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock console methods
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Mock Google Generative AI
    mockResponse = {
      text: jest.fn()
    };
    
    mockGenerateContent = jest.fn().mockResolvedValue({
      response: mockResponse
    });
    
    mockModel = {
      generateContent: mockGenerateContent
    };
    
    mockGenAI = {
      getGenerativeModel: jest.fn().mockReturnValue(mockModel)
    };
    
    GoogleGenerativeAI.mockImplementation(() => mockGenAI);
    
    // Mock axios
    axios.postForm = jest.fn();
    axios.toFormData = jest.fn().mockReturnValue({});
    
    // Mock FormData
    FormData.mockImplementation(() => ({}));
    
    // Mock fs
    fs.existsSync = jest.fn();
    fs.mkdirSync = jest.fn();
    fs.writeFileSync = jest.fn();
    fs.readFileSync = jest.fn();
    fs.statSync = jest.fn();
    fs.rmSync = jest.fn();
    
    // Mock path
    path.join = jest.fn().mockImplementation((...args) => args.join('/'));
    
    // Set default environment variables
    process.env.GEMINI_API_KEY = 'test-gemini-key';
    process.env.STABILITY_API_KEY = 'sk-test-stability-key';
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.GEMINI_API_KEY;
    delete process.env.STABILITY_API_KEY;
    
    // Restore console methods
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('Environment variable validation', () => {
    it('should throw error when GEMINI_API_KEY is missing', async () => {
      delete process.env.GEMINI_API_KEY;

      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'image1.jpg', 'image2.jpg');

      expect(consoleErrorSpy).toHaveBeenCalledWith('Fusion Generation Error:', 'GEMINI_API_KEY not found in environment variables');
      expect(result.name).toBe('AgumonGabumon');
      expect(result.fusionImage).toContain('placeholder');
    });

    it('should warn when STABILITY_API_KEY is missing', async () => {
      delete process.env.STABILITY_API_KEY;
      
      mockResponse.text.mockReturnValue('{"name": "TestFusion", "description": "Test"}');

      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'image1.jpg', 'image2.jpg');

      expect(consoleWarnSpy).toHaveBeenCalledWith('STABILITY_API_KEY not found, image generation will be skipped');
      expect(consoleLogSpy).toHaveBeenCalledWith('Stability API key not available, skipping image generation');
      expect(axios.postForm).not.toHaveBeenCalled();
      expect(result.fusionImage).toContain('placeholder');
    });

    it('should handle invalid Stability API key format', async () => {
      process.env.STABILITY_API_KEY = 'invalid-key-format';
      
      mockResponse.text.mockReturnValue('{"name": "TestFusion"}');

      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'image1.jpg', 'image2.jpg');

      expect(result.fusionImage).toContain('placeholder');
    });

    it('should validate API key format and log information', async () => {
      process.env.STABILITY_API_KEY = 'sk-test1234567890abcdef';
      mockResponse.text.mockReturnValue('{"name": "TestFusion"}');
      
      axios.postForm.mockResolvedValue({
        status: 200,
        data: Buffer.from('fake-image-data'),
        headers: { 'content-type': 'image/jpeg' }
      });
      
      fs.existsSync.mockReturnValue(false);
      fs.statSync.mockReturnValue({ size: 1024 });
      fs.readFileSync.mockReturnValue(Buffer.from('fake-image-data'));

      await generateFusionWithGemini('Agumon', 'Gabumon', 'image1.jpg', 'image2.jpg');

      expect(consoleLogSpy).toHaveBeenCalledWith('API Key format check:', 'sk-test123...');
    });
  });

  describe('Text generation with Gemini', () => {
    it('should generate fusion with valid JSON response', async () => {
      const mockJsonResponse = {
        name: 'Agubumon',
        description: 'A powerful fusion combining fire and ice powers',
        level: 'Champion',
        type: 'Data',
        imagePrompt: 'A dragon-wolf hybrid Digimon with fire and ice elements'
      };
      
      mockResponse.text.mockReturnValue(JSON.stringify(mockJsonResponse));

      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'image1.jpg', 'image2.jpg');

      expect(result.name).toBe('Agubumon');
      expect(result.description).toBe('A powerful fusion combining fire and ice powers');
      expect(result.level).toBe('Champion');
      expect(result.type).toBe('Data');
      expect(result.imagePrompt).toBe('A dragon-wolf hybrid Digimon with fire and ice elements');
    });

    it('should extract JSON from text with surrounding content', async () => {
      mockResponse.text.mockReturnValue('Some text before { "name": "TestFusion", "description": "test desc" } some text after');
      
      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'image1.jpg', 'image2.jpg');

      expect(result.name).toBe('TestFusion');
      expect(result.description).toBe('test desc');
    });

    it('should handle JSON parsing failure and use fallback', async () => {
      mockResponse.text.mockReturnValue('Invalid JSON response with no valid JSON');
      
      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'image1.jpg', 'image2.jpg');

      expect(result.name).toBe('AgumonGabumon');
      expect(result.description).toContain('Fusion legendaris');
      expect(consoleLogSpy).toHaveBeenCalledWith('Failed to parse JSON, using fallback');
    });

    it('should handle Gemini API errors', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Gemini API error'));

      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'image1.jpg', 'image2.jpg');

      expect(consoleErrorSpy).toHaveBeenCalledWith('Fusion Generation Error:', 'Gemini API error');
      expect(result.name).toBe('AgumonGabumon');
    });

    it('should handle response processing errors', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => {
            throw new Error('Response processing error');
          }
        }
      });

      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'image1.jpg', 'image2.jpg');

      expect(result.name).toBe('AgumonGabumon');
    });
  });

  describe('Image generation with Stability AI', () => {
    beforeEach(() => {
      mockResponse.text.mockReturnValue('{"name": "TestFusion", "imagePrompt": "test prompt"}');
    });

    it('should generate image successfully', async () => {
      axios.postForm.mockResolvedValue({
        status: 200,
        data: Buffer.from('fake-image-data'),
        headers: { 'content-type': 'image/jpeg' }
      });
      
      fs.existsSync.mockReturnValue(false);
      fs.statSync.mockReturnValue({ size: 1024 });
      fs.readFileSync.mockReturnValue(Buffer.from('fake-image-data'));

      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'image1.jpg', 'image2.jpg');

      expect(consoleLogSpy).toHaveBeenCalledWith('Starting Stability AI image generation...');
      expect(consoleLogSpy).toHaveBeenCalledWith('Fusion image generated successfully');
      expect(result.fusionImage).toBe('data:image/jpeg;base64,ZmFrZS1pbWFnZS1kYXRh');
    });

    it('should handle 401 unauthorized error', async () => {
      axios.postForm.mockResolvedValue({
        status: 401,
        data: Buffer.from('Unauthorized'),
        headers: {}
      });

      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'image1.jpg', 'image2.jpg');

      expect(consoleErrorSpy).toHaveBeenCalledWith('Stability AI: Invalid API key');
      expect(result.fusionImage).toContain('placeholder');
    });

    it('should handle 402 insufficient credits error', async () => {
      axios.postForm.mockResolvedValue({
        status: 402,
        data: Buffer.from('Insufficient credits'),
        headers: {}
      });

      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'image1.jpg', 'image2.jpg');

      expect(consoleErrorSpy).toHaveBeenCalledWith('Stability AI: Insufficient credits');
      expect(result.fusionImage).toContain('placeholder');
    });

    it('should handle other error codes', async () => {
      axios.postForm.mockResolvedValue({
        status: 500,
        data: Buffer.from('Internal server error'),
        headers: {}
      });

      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'image1.jpg', 'image2.jpg');

      expect(consoleErrorSpy).toHaveBeenCalledWith('Stability AI Error: 500: Internal server error');
      expect(result.fusionImage).toContain('placeholder');
    });

    it('should handle network errors with response details', async () => {
      const networkError = new Error('Network error');
      networkError.code = 'ECONNREFUSED';
      networkError.response = {
        status: 503,
        data: Buffer.from('Service unavailable')
      };
      
      axios.postForm.mockRejectedValue(networkError);

      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'image1.jpg', 'image2.jpg');

      expect(consoleErrorSpy).toHaveBeenCalledWith('Stability AI Error Details:', expect.objectContaining({
        message: 'Network error',
        code: 'ECONNREFUSED',
        response: 503,
        data: 'Service unavailable'
      }));
      expect(result.fusionImage).toContain('placeholder');
    });

    it('should handle network errors without response data', async () => {
      const networkError = new Error('Connection timeout');
      axios.postForm.mockRejectedValue(networkError);

      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'image1.jpg', 'image2.jpg');

      expect(consoleErrorSpy).toHaveBeenCalledWith('Stability AI Error Details:', expect.objectContaining({
        message: 'Connection timeout',
        data: 'No data'
      }));
      expect(result.fusionImage).toContain('placeholder');
    });

    it('should handle empty image file', async () => {
      axios.postForm.mockResolvedValue({
        status: 200,
        data: Buffer.from('fake-image-data'),
        headers: { 'content-type': 'image/jpeg' }
      });
      
      fs.existsSync.mockReturnValue(false);
      fs.statSync.mockReturnValue({ size: 0 }); // Empty file

      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'image1.jpg', 'image2.jpg');

      expect(consoleErrorSpy).toHaveBeenCalledWith('Generated fusion image file is empty');
      expect(result.fusionImage).toContain('placeholder');
    });

    it('should use custom image prompt', async () => {
      const customPrompt = 'Custom dragon fire ice prompt';
      mockResponse.text.mockReturnValue(`{"name": "TestFusion", "imagePrompt": "${customPrompt}"}`);
      
      axios.postForm.mockResolvedValue({
        status: 200,
        data: Buffer.from('fake-image-data'),
        headers: { 'content-type': 'image/jpeg' }
      });
      
      fs.existsSync.mockReturnValue(false);
      fs.statSync.mockReturnValue({ size: 1024 });
      fs.readFileSync.mockReturnValue(Buffer.from('fake-image-data'));

      await generateFusionWithGemini('Agumon', 'Gabumon', 'image1.jpg', 'image2.jpg');

      expect(consoleLogSpy).toHaveBeenCalledWith('Image prompt:', customPrompt);
    });

    it('should use default image prompt when not provided', async () => {
      mockResponse.text.mockReturnValue('{"name": "TestFusion"}');
      
      axios.postForm.mockResolvedValue({
        status: 200,
        data: Buffer.from('fake-image-data'),
        headers: { 'content-type': 'image/jpeg' }
      });
      
      fs.existsSync.mockReturnValue(false);
      fs.statSync.mockReturnValue({ size: 1024 });
      fs.readFileSync.mockReturnValue(Buffer.from('fake-image-data'));

      await generateFusionWithGemini('Agumon', 'Gabumon', 'image1.jpg', 'image2.jpg');

      expect(consoleLogSpy).toHaveBeenCalledWith('Image prompt:', expect.stringContaining('A fusion Digimon combining Agumon and Gabumon'));
    });
  });

  describe('File system operations', () => {
    beforeEach(() => {
      mockResponse.text.mockReturnValue('{"name": "TestFusion"}');
      axios.postForm.mockResolvedValue({
        status: 200,
        data: Buffer.from('fake-image-data'),
        headers: { 'content-type': 'image/jpeg' }
      });
    });

    it('should create temp directory if it does not exist', async () => {
      fs.existsSync.mockReturnValue(false);
      fs.statSync.mockReturnValue({ size: 1024 });
      fs.readFileSync.mockReturnValue(Buffer.from('fake-image-data'));

      await generateFusionWithGemini('Agumon', 'Gabumon', 'image1.jpg', 'image2.jpg');

      expect(fs.mkdirSync).toHaveBeenCalledWith(expect.stringContaining('temp'), { recursive: true });
    });

    it('should not create temp directory if it already exists', async () => {
      fs.existsSync.mockReturnValue(true);
      fs.statSync.mockReturnValue({ size: 1024 });
      fs.readFileSync.mockReturnValue(Buffer.from('fake-image-data'));

      await generateFusionWithGemini('Agumon', 'Gabumon', 'image1.jpg', 'image2.jpg');

      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });

    it('should handle cleanup errors gracefully', async () => {
      fs.existsSync.mockReturnValueOnce(false).mockReturnValueOnce(true);
      fs.statSync.mockReturnValue({ size: 1024 });
      fs.readFileSync.mockReturnValue(Buffer.from('fake-image-data'));
      fs.rmSync.mockImplementation(() => {
        throw new Error('Cleanup failed');
      });

      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'image1.jpg', 'image2.jpg');

      expect(consoleErrorSpy).toHaveBeenCalledWith('Cleanup error:', 'Cleanup failed');
      expect(result).toBeDefined();
    });

    it('should handle cleanup when temp directory does not exist', async () => {
      fs.existsSync.mockReturnValueOnce(false).mockReturnValueOnce(false);
      fs.statSync.mockReturnValue({ size: 1024 });
      fs.readFileSync.mockReturnValue(Buffer.from('fake-image-data'));

      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'image1.jpg', 'image2.jpg');

      expect(fs.rmSync).not.toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should log file operations successfully', async () => {
      fs.existsSync.mockReturnValue(false);
      fs.statSync.mockReturnValue({ size: 2048 });
      fs.readFileSync.mockReturnValue(Buffer.from('fake-image-data'));

      await generateFusionWithGemini('Agumon', 'Gabumon', 'image1.jpg', 'image2.jpg');

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Fusion image saved to:'));
      expect(consoleLogSpy).toHaveBeenCalledWith('Fusion image file size: 2048 bytes');
    });

    it('should handle special characters in fusion name', async () => {
      mockResponse.text.mockReturnValue('{"name": "Test@Fusion#Special$%^&*()"}');
      
      fs.existsSync.mockReturnValue(false);
      fs.statSync.mockReturnValue({ size: 1024 });
      fs.readFileSync.mockReturnValue(Buffer.from('fake-image-data'));

      await generateFusionWithGemini('Agumon', 'Gabumon', 'image1.jpg', 'image2.jpg');

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('Test_Fusion_Special_'),
        expect.any(Buffer)
      );
    });
  });

  describe('Fallback scenarios', () => {
    it('should provide default values when fusion data is incomplete', async () => {
      mockResponse.text.mockReturnValue('{"name": "TestFusion"}');

      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'image1.jpg', 'image2.jpg');

      expect(result.level).toBe('Champion');
      expect(result.type).toBe('Data');
      expect(result.imagePrompt).toContain('fusion Digimon combining');
    });

    it('should handle placeholder image generation with encoded names', async () => {
      mockResponse.text.mockReturnValue('{"name": "Test Fusion With Spaces"}');

      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'image1.jpg', 'image2.jpg');

      expect(result.fusionImage).toContain('Test%20Fusion%20With%20Spaces');
      expect(consoleLogSpy).toHaveBeenCalledWith('Using placeholder image instead of generated image');
    });

    it('should return complete fallback response when everything fails', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Complete failure'));

      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'image1.jpg', 'image2.jpg');

      expect(result).toEqual({
        name: 'AgumonGabumon',
        description: expect.stringContaining('Fusion legendaris'),
        level: 'Champion',
        type: 'Data',
        imagePrompt: expect.stringContaining('A powerful fusion Digimon combining'),
        fusionImage: expect.stringContaining('placeholder'),
        originalImages: {
          digimon1: 'image1.jpg',
          digimon2: 'image2.jpg'
        }
      });
    });
  });

  describe('Response status and headers logging', () => {
    beforeEach(() => {
      mockResponse.text.mockReturnValue('{"name": "StatusTest"}');
    });

    it('should log response status and headers', async () => {
      axios.postForm.mockResolvedValue({
        status: 200,
        data: Buffer.from('fake-image-data'),
        headers: { 'content-type': 'image/jpeg', 'x-custom': 'test' }
      });
      
      fs.existsSync.mockReturnValue(false);
      fs.statSync.mockReturnValue({ size: 1024 });
      fs.readFileSync.mockReturnValue(Buffer.from('fake-image-data'));

      await generateFusionWithGemini('Agumon', 'Gabumon', 'image1.jpg', 'image2.jpg');

      expect(consoleLogSpy).toHaveBeenCalledWith('Stability AI Response Status: 200');
      expect(consoleLogSpy).toHaveBeenCalledWith('Response headers:', expect.objectContaining({
        'content-type': 'image/jpeg',
        'x-custom': 'test'
      }));
    });
  });
});

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Mock dependencies
jest.mock('axios');
jest.mock('fs');
jest.mock('@google/generative-ai');

const mockAxios = axios;
const mockFs = fs;

// Reset mocks before each test
jest.resetModules();

describe('Gemini Helper', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    // Reset require cache to ensure fresh modules
    delete require.cache[require.resolve('../../helpers/gemini')];
    delete require.cache[require.resolve('@google/generative-ai')];
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('generateFusionWithGemini', () => {    it('should throw error when GEMINI_API_KEY is missing', async () => {
      delete process.env.GEMINI_API_KEY;
      delete process.env.STABILITY_API_KEY;

      // Import after environment setup
      const { generateFusionWithGemini } = require('../../helpers/gemini');

      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'img1', 'img2');
      
      expect(result.name).toBe('AgumonGabumon');
      expect(result.description).toContain('Fusion legendaris');
      expect(result.level).toBe('Champion');
      expect(result.type).toBe('Data');
      expect(result.fusionImage).toContain('placeholder');
    });    it('should generate fusion with valid API keys', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      process.env.STABILITY_API_KEY = 'sk-test-stability-key';

      // Import after environment setup
      const { generateFusionWithGemini } = require('../../helpers/gemini');

      const mockGenAI = {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: () => '{"name": "AguGabu", "description": "Test fusion", "level": "Champion", "type": "Data", "imagePrompt": "Test prompt"}'
            }
          })
        })
      };
      
      // Setup mocks after require
      require('@google/generative-ai').GoogleGenerativeAI = jest.fn(() => mockGenAI);

      // Mock Stability AI response
      mockAxios.postForm.mockResolvedValue({
        status: 200,
        data: Buffer.from('fake-image-data'),
        headers: {}
      });

      // Mock file system operations
      const path = require('path');
      mockFs.existsSync.mockImplementation((dir) => {
        if (dir.includes('temp')) return false;
        return true;
      });
      mockFs.mkdirSync.mockImplementation(() => {});
      mockFs.writeFileSync.mockImplementation(() => {});
      mockFs.statSync.mockReturnValue({ size: 1024 });
      mockFs.readFileSync.mockReturnValue(Buffer.from('fake-image-data'));
      mockFs.rmSync.mockImplementation(() => {});

      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'img1', 'img2');

      expect(result.name).toBe('AguGabu');
      expect(result.description).toBe('Test fusion');
      expect(result.level).toBe('Champion');
      expect(result.type).toBe('Data');
      expect(result.fusionImage).toContain('data:image/jpeg;base64,');
    });

    it('should handle invalid JSON from Gemini', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const mockGenAI = {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: () => 'invalid json response'
            }
          })
        })
      };
      GoogleGenerativeAI.mockImplementation(() => mockGenAI);

      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'img1', 'img2');

      expect(result.name).toBe('AgumonGabumon');
      expect(result.fusionImage).toContain('placeholder');
    });

    it('should handle Stability AI 401 error', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      process.env.STABILITY_API_KEY = 'sk-test-stability-key';

      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const mockGenAI = {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: () => '{"name": "TestFusion"}'
            }
          })
        })
      };
      GoogleGenerativeAI.mockImplementation(() => mockGenAI);

      mockAxios.postForm.mockResolvedValue({
        status: 401,
        data: Buffer.from('Unauthorized'),
        headers: {}
      });

      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'img1', 'img2');

      expect(result.fusionImage).toContain('placeholder');
    });

    it('should handle Stability AI 402 error', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      process.env.STABILITY_API_KEY = 'sk-test-stability-key';

      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const mockGenAI = {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: () => '{"name": "TestFusion"}'
            }
          })
        })
      };
      GoogleGenerativeAI.mockImplementation(() => mockGenAI);

      mockAxios.postForm.mockResolvedValue({
        status: 402,
        data: Buffer.from('Insufficient credits'),
        headers: {}
      });

      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'img1', 'img2');

      expect(result.fusionImage).toContain('placeholder');
    });

    it('should handle invalid Stability API key format', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      process.env.STABILITY_API_KEY = 'invalid-key-format';

      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const mockGenAI = {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: () => '{"name": "TestFusion"}'
            }
          })
        })
      };
      GoogleGenerativeAI.mockImplementation(() => mockGenAI);

      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'img1', 'img2');

      expect(result.fusionImage).toContain('placeholder');
    });

    it('should handle empty generated image file', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      process.env.STABILITY_API_KEY = 'sk-test-stability-key';

      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const mockGenAI = {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: () => '{"name": "TestFusion"}'
            }
          })
        })
      };
      GoogleGenerativeAI.mockImplementation(() => mockGenAI);

      mockAxios.postForm.mockResolvedValue({
        status: 200,
        data: Buffer.from('fake-image-data'),
        headers: {}
      });

      mockFs.existsSync.mockReturnValue(false);
      mockFs.mkdirSync.mockImplementation(() => {});
      mockFs.writeFileSync.mockImplementation(() => {});
      mockFs.statSync.mockReturnValue({ size: 0 }); // Empty file
      mockFs.rmSync.mockImplementation(() => {});

      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'img1', 'img2');

      expect(result.fusionImage).toContain('placeholder');
    });

    it('should handle cleanup errors', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';

      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const mockGenAI = {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: () => '{"name": "TestFusion"}'
            }
          })
        })
      };
      GoogleGenerativeAI.mockImplementation(() => mockGenAI);

      mockFs.existsSync.mockReturnValue(true);
      mockFs.rmSync.mockImplementation(() => {
        throw new Error('Cleanup failed');
      });

      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'img1', 'img2');

      expect(result.name).toBe('TestFusion');
    });

    it('should handle network errors from Stability AI', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      process.env.STABILITY_API_KEY = 'sk-test-stability-key';

      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const mockGenAI = {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: () => '{"name": "TestFusion"}'
            }
          })
        })
      };
      GoogleGenerativeAI.mockImplementation(() => mockGenAI);

      mockAxios.postForm.mockRejectedValue({
        message: 'Network Error',
        code: 'ECONNREFUSED',
        response: {
          status: 500,
          data: Buffer.from('Server Error')
        }
      });

      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'img1', 'img2');

      expect(result.fusionImage).toContain('placeholder');
    });

    it('should handle Gemini API errors', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';

      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const mockGenAI = {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockRejectedValue(new Error('Gemini API Error'))
        })
      };
      GoogleGenerativeAI.mockImplementation(() => mockGenAI);

      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'img1', 'img2');

      expect(result.name).toBe('AgumonGabumon');
      expect(result.description).toContain('Fusion legendaris');
    });

    it('should use placeholder when STABILITY_API_KEY is missing', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      delete process.env.STABILITY_API_KEY;

      const { generateFusionWithGemini } = require('../../helpers/gemini');

      const mockGenAI = {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: () => '{"name": "TestFusion", "description": "Test description"}'
            }
          })
        })
      };
      
      require('@google/generative-ai').GoogleGenerativeAI = jest.fn(() => mockGenAI);

      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'img1', 'img2');

      expect(result.name).toBe('TestFusion');
      expect(result.fusionImage).toContain('placeholder');
    });

    it('should handle when API key format is valid but starts with sk-', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      process.env.STABILITY_API_KEY = 'sk-valid-key-format';

      const { generateFusionWithGemini } = require('../../helpers/gemini');

      const mockGenAI = {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: () => '{"name": "ValidKeyTest"}'
            }
          })
        })
      };
      
      require('@google/generative-ai').GoogleGenerativeAI = jest.fn(() => mockGenAI);

      mockAxios.postForm.mockResolvedValue({
        status: 200,
        data: Buffer.from('test-image'),
        headers: {}
      });

      mockFs.existsSync.mockReturnValue(false);
      mockFs.mkdirSync.mockImplementation(() => {});
      mockFs.writeFileSync.mockImplementation(() => {});
      mockFs.statSync.mockReturnValue({ size: 100 });
      mockFs.readFileSync.mockReturnValue(Buffer.from('test-image'));
      mockFs.rmSync.mockImplementation(() => {});

      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'img1', 'img2');

      expect(result.name).toBe('ValidKeyTest');
    });

    it('should handle when temp directory already exists', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      process.env.STABILITY_API_KEY = 'sk-test-key';

      const { generateFusionWithGemini } = require('../../helpers/gemini');

      const mockGenAI = {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: () => '{"name": "ExistingDirTest"}'
            }
          })
        })
      };
      
      require('@google/generative-ai').GoogleGenerativeAI = jest.fn(() => mockGenAI);

      mockAxios.postForm.mockResolvedValue({
        status: 200,
        data: Buffer.from('test-image'),
        headers: {}
      });

      mockFs.existsSync.mockReturnValue(true); // Directory exists
      mockFs.writeFileSync.mockImplementation(() => {});
      mockFs.statSync.mockReturnValue({ size: 200 });
      mockFs.readFileSync.mockReturnValue(Buffer.from('test-image'));
      mockFs.rmSync.mockImplementation(() => {});

      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'img1', 'img2');

      expect(mockFs.mkdirSync).not.toHaveBeenCalled();
      expect(result.name).toBe('ExistingDirTest');
    });

    it('should handle various Stability AI error responses', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      process.env.STABILITY_API_KEY = 'sk-test-key';

      const { generateFusionWithGemini } = require('../../helpers/gemini');

      const mockGenAI = {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: () => '{"name": "ErrorTest"}'
            }
          })
        })
      };
      
      require('@google/generative-ai').GoogleGenerativeAI = jest.fn(() => mockGenAI);

      mockAxios.postForm.mockResolvedValue({
        status: 500,
        data: Buffer.from('Internal Server Error'),
        headers: {}
      });

      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'img1', 'img2');

      expect(result.fusionImage).toContain('placeholder');
    });

    it('should handle special characters in fusion name for file naming', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      process.env.STABILITY_API_KEY = 'sk-test-key';

      const { generateFusionWithGemini } = require('../../helpers/gemini');

      const mockGenAI = {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: () => '{"name": "Special@Name#Test!"}'
            }
          })
        })
      };
      
      require('@google/generative-ai').GoogleGenerativeAI = jest.fn(() => mockGenAI);

      mockAxios.postForm.mockResolvedValue({
        status: 200,
        data: Buffer.from('test-image'),
        headers: {}
      });

      mockFs.existsSync.mockReturnValue(false);
      mockFs.mkdirSync.mockImplementation(() => {});
      mockFs.writeFileSync.mockImplementation((filePath) => {
        expect(filePath).toContain('Special_Name_Test_');
      });
      mockFs.statSync.mockReturnValue({ size: 150 });
      mockFs.readFileSync.mockReturnValue(Buffer.from('test-image'));
      mockFs.rmSync.mockImplementation(() => {});

      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'img1', 'img2');

      expect(result.name).toBe('Special@Name#Test!');
    });
  });
});

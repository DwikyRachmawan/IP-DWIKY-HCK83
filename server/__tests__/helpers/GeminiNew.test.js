const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Mock dependencies
jest.mock('axios');
jest.mock('fs');
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn()
}));
jest.mock('form-data', () => {
  return jest.fn().mockImplementation(() => ({}));
});

const mockAxios = axios;
const mockFs = fs;

describe('Gemini Helper Complete Coverage', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    // Reset require cache
    delete require.cache[require.resolve('../../helpers/gemini')];
    delete require.cache[require.resolve('@google/generative-ai')];
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('generateFusionWithGemini - Full Coverage', () => {
    it('should handle missing GEMINI_API_KEY and return fallback', async () => {
      delete process.env.GEMINI_API_KEY;
      delete process.env.STABILITY_API_KEY;

      const { generateFusionWithGemini } = require('../../helpers/gemini');
      
      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'img1', 'img2');
      
      expect(result.name).toBe('AgumonGabumon');
      expect(result.description).toContain('Fusion legendaris');
      expect(result.level).toBe('Champion');
      expect(result.type).toBe('Data');
      expect(result.fusionImage).toContain('placeholder');
      expect(result.originalImages.digimon1).toBe('img1');
      expect(result.originalImages.digimon2).toBe('img2');
    });

    it('should handle valid keys but no STABILITY_API_KEY', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      delete process.env.STABILITY_API_KEY;

      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const mockGenAI = {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: () => '{"name": "TestFusion", "description": "Test desc", "level": "Ultimate", "type": "Virus", "imagePrompt": "Test prompt"}'
            }
          })
        })
      };
      GoogleGenerativeAI.mockImplementation(() => mockGenAI);

      const { generateFusionWithGemini } = require('../../helpers/gemini');
      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'img1', 'img2');

      expect(result.name).toBe('TestFusion');
      expect(result.level).toBe('Ultimate');
      expect(result.type).toBe('Virus');
      expect(result.fusionImage).toContain('placeholder');
    });

    it('should handle valid STABILITY_API_KEY but invalid format', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      process.env.STABILITY_API_KEY = 'invalid-format-key';

      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const mockGenAI = {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: () => '{"name": "InvalidKeyTest"}'
            }
          })
        })
      };
      GoogleGenerativeAI.mockImplementation(() => mockGenAI);

      const { generateFusionWithGemini } = require('../../helpers/gemini');
      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'img1', 'img2');

      expect(result.name).toBe('InvalidKeyTest');
      expect(result.fusionImage).toContain('placeholder');
    });

    it('should handle valid API keys and successful image generation', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      process.env.STABILITY_API_KEY = 'sk-valid-stability-key';

      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const mockGenAI = {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: () => '{"name": "SuccessTest", "description": "Success", "level": "Mega", "type": "Data", "imagePrompt": "Success prompt"}'
            }
          })
        })
      };
      GoogleGenerativeAI.mockImplementation(() => mockGenAI);

      mockAxios.postForm.mockResolvedValue({
        status: 200,
        data: Buffer.from('success-image-data'),
        headers: {}
      });

      mockFs.existsSync.mockReturnValue(false);
      mockFs.mkdirSync.mockImplementation(() => {});
      mockFs.writeFileSync.mockImplementation(() => {});
      mockFs.statSync.mockReturnValue({ size: 2048 });
      mockFs.readFileSync.mockReturnValue(Buffer.from('success-image-data'));
      mockFs.rmSync.mockImplementation(() => {});

      const { generateFusionWithGemini } = require('../../helpers/gemini');
      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'img1', 'img2');

      expect(result.name).toBe('SuccessTest');
      expect(result.description).toBe('Success');
      expect(result.level).toBe('Mega');
      expect(result.type).toBe('Data');
      expect(result.fusionImage).toContain('data:image/jpeg;base64,');
    });

    it('should handle when temp directory already exists', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      process.env.STABILITY_API_KEY = 'sk-valid-stability-key';

      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const mockGenAI = {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: () => '{"name": "ExistingDir"}'
            }
          })
        })
      };
      GoogleGenerativeAI.mockImplementation(() => mockGenAI);

      mockAxios.postForm.mockResolvedValue({
        status: 200,
        data: Buffer.from('image-data'),
        headers: {}
      });

      mockFs.existsSync.mockReturnValue(true); // Directory exists
      mockFs.writeFileSync.mockImplementation(() => {});
      mockFs.statSync.mockReturnValue({ size: 1024 });
      mockFs.readFileSync.mockReturnValue(Buffer.from('image-data'));
      mockFs.rmSync.mockImplementation(() => {});

      const { generateFusionWithGemini } = require('../../helpers/gemini');
      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'img1', 'img2');

      expect(mockFs.mkdirSync).not.toHaveBeenCalled();
      expect(result.name).toBe('ExistingDir');
    });

    it('should handle empty image file size', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      process.env.STABILITY_API_KEY = 'sk-valid-stability-key';

      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const mockGenAI = {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: () => '{"name": "EmptyFile"}'
            }
          })
        })
      };
      GoogleGenerativeAI.mockImplementation(() => mockGenAI);

      mockAxios.postForm.mockResolvedValue({
        status: 200,
        data: Buffer.from(''),
        headers: {}
      });

      mockFs.existsSync.mockReturnValue(false);
      mockFs.mkdirSync.mockImplementation(() => {});
      mockFs.writeFileSync.mockImplementation(() => {});
      mockFs.statSync.mockReturnValue({ size: 0 }); // Empty file
      mockFs.rmSync.mockImplementation(() => {});

      const { generateFusionWithGemini } = require('../../helpers/gemini');
      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'img1', 'img2');

      expect(result.name).toBe('EmptyFile');
      expect(result.fusionImage).toContain('placeholder');
    });

    it('should handle Stability AI 401 error', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      process.env.STABILITY_API_KEY = 'sk-valid-stability-key';

      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const mockGenAI = {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: () => '{"name": "Unauthorized"}'
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

      const { generateFusionWithGemini } = require('../../helpers/gemini');
      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'img1', 'img2');

      expect(result.fusionImage).toContain('placeholder');
    });

    it('should handle Stability AI 402 error', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      process.env.STABILITY_API_KEY = 'sk-valid-stability-key';

      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const mockGenAI = {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: () => '{"name": "InsufficientCredits"}'
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

      const { generateFusionWithGemini } = require('../../helpers/gemini');
      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'img1', 'img2');

      expect(result.fusionImage).toContain('placeholder');
    });

    it('should handle other Stability AI errors', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      process.env.STABILITY_API_KEY = 'sk-valid-stability-key';

      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const mockGenAI = {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: () => '{"name": "OtherError"}'
            }
          })
        })
      };
      GoogleGenerativeAI.mockImplementation(() => mockGenAI);

      mockAxios.postForm.mockResolvedValue({
        status: 500,
        data: Buffer.from('Internal Server Error'),
        headers: {}
      });

      const { generateFusionWithGemini } = require('../../helpers/gemini');
      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'img1', 'img2');

      expect(result.fusionImage).toContain('placeholder');
    });

    it('should handle network errors from Stability AI', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      process.env.STABILITY_API_KEY = 'sk-valid-stability-key';

      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const mockGenAI = {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: () => '{"name": "NetworkError"}'
            }
          })
        })
      };
      GoogleGenerativeAI.mockImplementation(() => mockGenAI);

      mockAxios.postForm.mockRejectedValue({
        message: 'Network Error',
        code: 'ECONNREFUSED'
      });

      const { generateFusionWithGemini } = require('../../helpers/gemini');
      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'img1', 'img2');

      expect(result.fusionImage).toContain('placeholder');
    });

    it('should handle cleanup errors', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      process.env.STABILITY_API_KEY = 'sk-valid-stability-key';

      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const mockGenAI = {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: () => '{"name": "CleanupError"}'
            }
          })
        })
      };
      GoogleGenerativeAI.mockImplementation(() => mockGenAI);

      mockAxios.postForm.mockResolvedValue({
        status: 200,
        data: Buffer.from('test'),
        headers: {}
      });

      mockFs.existsSync.mockReturnValue(true);
      mockFs.writeFileSync.mockImplementation(() => {});
      mockFs.statSync.mockReturnValue({ size: 100 });
      mockFs.readFileSync.mockReturnValue(Buffer.from('test'));
      mockFs.rmSync.mockImplementation(() => {
        throw new Error('Cleanup failed');
      });

      const { generateFusionWithGemini } = require('../../helpers/gemini');
      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'img1', 'img2');

      expect(result.name).toBe('CleanupError');
    });

    it('should handle invalid JSON from Gemini', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';

      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const mockGenAI = {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: () => 'invalid json response without proper format'
            }
          })
        })
      };
      GoogleGenerativeAI.mockImplementation(() => mockGenAI);

      const { generateFusionWithGemini } = require('../../helpers/gemini');
      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'img1', 'img2');

      expect(result.name).toBe('AgumonGabumon');
      expect(result.description).toContain('Fusion legendaris');
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

      const { generateFusionWithGemini } = require('../../helpers/gemini');
      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'img1', 'img2');

      expect(result.name).toBe('AgumonGabumon');
      expect(result.description).toContain('Fusion legendaris');
    });

    it('should handle special characters in fusion name for file paths', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      process.env.STABILITY_API_KEY = 'sk-valid-stability-key';

      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const mockGenAI = {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: () => '{"name": "Special@Name#Test!$%^&*()"}'
            }
          })
        })
      };
      GoogleGenerativeAI.mockImplementation(() => mockGenAI);

      mockAxios.postForm.mockResolvedValue({
        status: 200,
        data: Buffer.from('test'),
        headers: {}
      });

      let capturedFilePath = '';
      mockFs.existsSync.mockReturnValue(false);
      mockFs.mkdirSync.mockImplementation(() => {});
      mockFs.writeFileSync.mockImplementation((filePath) => {
        capturedFilePath = filePath;
      });
      mockFs.statSync.mockReturnValue({ size: 100 });
      mockFs.readFileSync.mockReturnValue(Buffer.from('test'));
      mockFs.rmSync.mockImplementation(() => {});

      const { generateFusionWithGemini } = require('../../helpers/gemini');
      const result = await generateFusionWithGemini('Agumon', 'Gabumon', 'img1', 'img2');

      expect(result.name).toBe('Special@Name#Test!$%^&*()');
      expect(capturedFilePath).toContain('Special_Name_Test_');
    });
  });
});

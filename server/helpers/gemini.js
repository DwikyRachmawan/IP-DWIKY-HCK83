const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const generateFusionWithGemini = async (digimon1, digimon2, digimon1Image, digimon2Image) => {
  try {
    // Validate API keys first
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not found in environment variables');
    }
    if (!process.env.STABILITY_API_KEY) {
      console.warn('STABILITY_API_KEY not found, image generation will be skipped');
    }

    // Step 1: Generate text description using Gemini
    console.log('Starting Gemini text generation...');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const textModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const textPrompt = `Gabungkan Digimon ${digimon1} dan ${digimon2} menjadi satu Digimon fusion. Buatkan:
- Nama Digimon baru yang kreatif
- Deskripsi unik hasil gabungan (minimal 100 kata)
- Level (Rookie, Champion, Ultimate, Mega)
- Type (Vaccine, Data, Virus)
- Prompt deskripsi visual untuk generate gambar fusion (dalam bahasa Inggris, detail)
Format JSON: { "name": "...", "description": "...", "level": "...", "type": "...", "imagePrompt": "..." }`;

    const textResult = await textModel.generateContent(textPrompt);
    const textResponse = await textResult.response;
    const generatedText = textResponse.text();
    
    // Extract JSON from text response
    const jsonMatch = generatedText.match(/\{.*\}/s);
    let fusionData = {};
    
    if (jsonMatch) {
      try {
        fusionData = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.log('Failed to parse JSON, using fallback');
      }
    }

    // Step 2: Generate fusion image using Stability AI
    let fusionImageBase64 = null;
    let fusionImageUrl = null;

    if (!process.env.STABILITY_API_KEY) {
      console.log('Stability API key not available, skipping image generation');
    } else {
      try {
        console.log('Starting Stability AI image generation...');
        console.log('API Key format check:', process.env.STABILITY_API_KEY.substring(0, 10) + '...');
        
        // Verify API key format
        if (!process.env.STABILITY_API_KEY.startsWith('sk-')) {
          throw new Error('Invalid Stability API key format. Must start with "sk-"');
        }

        // Create image prompt for fusion
        const imagePrompt = fusionData.imagePrompt || 
          `A fusion Digimon combining ${digimon1} and ${digimon2}, digital monster art style, anime style, vibrant colors, fantasy creature, detailed design, professional artwork`;

        console.log('Image prompt:', imagePrompt);

        const payload = {
          prompt: imagePrompt,
          output_format: "jpeg"
        };

        const response = await axios.postForm(
          `https://api.stability.ai/v2beta/stable-image/generate/sd3`,
          axios.toFormData(payload, new FormData()),
          {
            validateStatus: undefined,
            responseType: "arraybuffer",
            headers: { 
              Authorization: `Bearer ${process.env.STABILITY_API_KEY}`, 
              Accept: "image/*" 
            },
            timeout: 60000, // 1 minute timeout for image generation
          }
        );

        console.log(`Stability AI Response Status: ${response.status}`);
        console.log('Response headers:', response.headers);
        
        if (response.status === 200) {
          // Save generated image
          const fusionName = (fusionData.name || `${digimon1}${digimon2}`).replace(/[^a-zA-Z0-9]/g, '_');
          const tempDir = path.join(__dirname, '../temp');
          
          if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
          }
          
          const imagePath = path.join(tempDir, `${fusionName}.jpeg`);
          fs.writeFileSync(imagePath, Buffer.from(response.data));
          console.log(`Fusion image saved to: ${imagePath}`);
          
          // Verify the saved file
          const imageStats = fs.statSync(imagePath);
          console.log(`Fusion image file size: ${imageStats.size} bytes`);
          
          if (imageStats.size > 0) {
            // Convert to base64 for response
            const imageBuffer = fs.readFileSync(imagePath);
            fusionImageBase64 = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
            console.log('Fusion image generated successfully');
          } else {
            console.error('Generated fusion image file is empty');
          }
        } else if (response.status === 401) {
          console.error('Stability AI: Invalid API key');
        } else if (response.status === 402) {
          console.error('Stability AI: Insufficient credits');
        } else {
          const errorText = Buffer.from(response.data).toString();
          console.error(`Stability AI Error: ${response.status}: ${errorText}`);
        }
      } catch (stabilityError) {
        console.error('Stability AI Error Details:', {
          message: stabilityError.message,
          code: stabilityError.code,
          response: stabilityError.response?.status,
          data: stabilityError.response?.data ? Buffer.from(stabilityError.response.data).toString() : 'No data'
        });
      }
    }

    // Generate placeholder if image generation fails
    if (!fusionImageBase64) {
      const fusionName = fusionData.name || `${digimon1}${digimon2}`;
      fusionImageUrl = `https://via.placeholder.com/512x512/FF6B35/FFFFFF?text=${encodeURIComponent(fusionName)}`;
      console.log('Using placeholder image instead of generated image');
    }

    // Clean up temp files
    try {
      const tempDir = path.join(__dirname, '../temp');
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError.message);
    }

    return {
      name: fusionData.name || `${digimon1}${digimon2}`,
      description: fusionData.description || `Fusion legendaris yang menggabungkan kekuatan ${digimon1} dan ${digimon2}. Digimon baru ini memiliki kemampuan unik dari kedua pendahulunya dengan design yang memukau.`,
      level: fusionData.level || 'Champion',
      type: fusionData.type || 'Data',
      imagePrompt: fusionData.imagePrompt || `A fusion Digimon combining ${digimon1} and ${digimon2}`,
      fusionImage: fusionImageBase64 || fusionImageUrl, // Generated image or placeholder
      originalImages: {
        digimon1: digimon1Image,
        digimon2: digimon2Image
      }
    };
  } catch (error) {
    console.error('Fusion Generation Error:', error.message);
    
    // Fallback response if everything fails
    return {
      name: `${digimon1}${digimon2}`,
      description: `Fusion legendaris yang menggabungkan kekuatan ${digimon1} dan ${digimon2}. Digimon baru ini memiliki kemampuan unik dari kedua pendahulunya dengan design yang memukau.`,
      level: 'Champion',
      type: 'Data',
      imagePrompt: `A powerful fusion Digimon combining characteristics of ${digimon1} and ${digimon2}`,
      fusionImage: `https://via.placeholder.com/512x512/FF6B35/FFFFFF?text=${encodeURIComponent(`${digimon1}${digimon2}`)}`,
      originalImages: {
        digimon1: digimon1Image,
        digimon2: digimon2Image
      }
    };
  }
};

module.exports = {
  generateFusionWithGemini
};
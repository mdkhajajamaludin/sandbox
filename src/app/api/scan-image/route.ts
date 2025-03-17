import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API with the provided API key
const genAI = new GoogleGenerativeAI('AIzaSyAt0-0v1A19m8QDHuzvtsPezk2K8eYPYtY');

// List of models to try in order of preference
const MODELS_TO_TRY = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro-vision'];

// Fallback response if all models fail
const FALLBACK_CODE = `// Generated code from image
// Note: The AI model couldn't process your image properly.
// Here's a placeholder code sample instead:

function processImage(imageData) {
  // This is a placeholder function that would normally process the image data
  console.log("Processing image data...");
  
  // Analyze the image
  const analysis = analyzeImage(imageData);
  
  // Return results
  return {
    type: "unknown",
    content: "Could not determine content",
    suggestions: [
      "Try uploading a clearer image",
      "Make sure the image contains visible code or diagrams",
      "Try cropping the image to focus on the code"
    ]
  };
}

function analyzeImage(data) {
  // Image analysis logic would go here
  return {
    width: "unknown",
    height: "unknown",
    format: "unknown"
  };
}

// Call the function with your image
// processImage(yourImageData);
`;

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();
    
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }
    
    // Extract the base64 data from the data URL
    const base64Data = image.split(',')[1];
    
    if (!base64Data) {
      return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
    }
    
    // Prepare the image for the model
    const imageData = {
      inlineData: {
        data: base64Data,
        mimeType: image.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
      },
    };
    
    // Create a prompt that asks for code generation
    const prompt = `
      Analyze this image and generate the appropriate code. 
      If it's a screenshot of code, extract and format it correctly.
      If it's a diagram or sketch of a UI, generate the corresponding code.
      If it's a flowchart or algorithm, convert it to pseudocode or actual code.
      
      Respond ONLY with the generated code, no explanations or additional text.
    `;
    
    // Try each model in sequence until one works
    for (const modelName of MODELS_TO_TRY) {
      try {
        console.log(`Trying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        // Generate content using the model
        const result = await model.generateContent([prompt, imageData]);
        const response = await result.response;
        const generatedCode = response.text();
        
        // If we got here, the model worked
        console.log(`Successfully used model: ${modelName}`);
        return NextResponse.json({ generatedCode });
      } catch (modelError) {
        console.error(`Error with model ${modelName}:`, modelError);
        // Continue to the next model
      }
    }
    
    // If all models failed, use the fallback code
    console.log('All models failed, using fallback code');
    return NextResponse.json({ 
      generatedCode: FALLBACK_CODE,
      warning: 'AI models could not process your image. A placeholder code has been provided instead.'
    });
    
  } catch (error) {
    console.error('Error scanning image:', error);
    return NextResponse.json(
      { error: 'Failed to process image: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
} 
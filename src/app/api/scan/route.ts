import { NextRequest, NextResponse } from 'next/server';

const ANALYSIS_PROMPT = `Analyze the uploaded medicine image and provide structured information in JSON format:

{
  "medicineName": "Name of the medicine (or 'Unknown' if unclear)",
  "type": "tablet / capsule / syrup / injection / cream / other",
  "mainUse": "Primary use/indication",
  "howItWorks": "Simple explanation (1-2 sentences)",
  "dosage": "General dosage guidance (or 'Consult doctor')",
  "whenToTake": "before food / after food / with food / as directed",
  "sideEffects": ["list of common side effects"],
  "warnings": ["important warnings"],
  "expiry": "Expiry date if visible, or 'Not visible'",
  "safetyAdvice": "Safety recommendations",
  "confidence": "high / medium / low"
}

Rules:
- Keep language simple and beginner-friendly
- If unclear about medicine name → say "Unable to identify" with confidence: "low"
- Always include general disclaimer: "Consult a doctor before taking any medicine"
- Only include well-known information
- Return valid JSON only, no additional text`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json(
        { success: false, error: 'No image provided. Please upload an image.' },
        { status: 400 }
      );
    }

    // Try Gemini Vision API first if key is configured
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (apiKey && !apiKey.startsWith('#') && !apiKey.includes('your_')) {
      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey);
        
        const visionModel = genAI.getGenerativeModel({
          model: 'gemini-2.0-flash',
        });

        // Convert base64 to buffer
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        const binaryString = Buffer.from(base64Data, 'base64');
        
        // Create image part
        const imagePart = {
          inlineData: {
            data: base64Data,
            mimeType: 'image/jpeg',
          },
        };

        const promptPart = {
          text: ANALYSIS_PROMPT,
        };

        const result = await visionModel.generateContent([promptPart, imagePart]);
        const response = result.response.text();

        // Parse JSON from response
        try {
          // Find JSON in response (might be wrapped in markdown)
          const jsonStart = response.indexOf('{');
          const jsonEnd = response.lastIndexOf('}') + 1;
          const jsonMatch = jsonStart >= 0 ? response.slice(jsonStart, jsonEnd) : null;
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch);
            
            return NextResponse.json({
              success: true,
              data: {
                ...parsed,
                source: 'gemini-vision',
              },
            });
          }
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          // Return raw response as fallback
          return NextResponse.json({
            success: true,
            data: {
              medicineName: response.slice(0, 100),
              type: 'Unknown',
              mainUse: 'Unable to parse full response',
              confidence: 'low',
              safetyAdvice: 'Consult a doctor before taking any medicine',
              error: 'Could not parse AI response completely',
            },
          });
        }
      } catch (geminiError: any) {
        console.error('Gemini Vision API error:', geminiError?.message);
        // Fall through to fallback
      }
    }

    // Fallback response (when no API key)
    return NextResponse.json({
      success: true,
      data: {
        medicineName: 'Demo Medicine',
        type: 'Tablet',
        mainUse: 'Pain relief and fever reduction',
        howItWorks: 'Works by blocking pain signals and reducing fever',
        dosage: '1 tablet every 4-6 hours as needed',
        whenToTake: 'After food',
        sideEffects: ['Stomach upset', 'Nausea', 'Drowsiness'],
        warnings: ['Do not exceed recommended dose', 'Avoid alcohol'],
        expiry: 'Check package',
        safetyAdvice: 'Consult a doctor before taking any medicine. This is a demo response.',
        confidence: 'low',
        note: 'Configure GEMINI_API_KEY in .env for better results',
      },
    });
  } catch (error: any) {
    console.error('Scan Error:', error?.message || error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to scan medicine. Please try again with a clearer image.' 
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse } from '@/lib/ai-engine';

const ROLE_SYSTEM_PROMPTS: Record<string, string> = {
  patient: `You are "AI Health Assist", a friendly AI health assistant for patients. Answer health questions, help understand symptoms, provide medication guidance, and suggest when to see a doctor. Always recommend consulting a real doctor for serious concerns. Use markdown formatting.`,
  student: `You are "AI Health Assist Study Tutor", an expert medical education AI. Explain medical concepts clearly with clinical correlations, mnemonics, and exam tips. Cover anatomy, physiology, pharmacology, pathology, microbiology, medicine, surgery. Use markdown formatting.`,
  doctor: `You are "AI Health Assist Clinical Assistant", an AI for doctors. Provide differential diagnosis suggestions, drug interactions, treatment guidelines, and clinical scoring systems. Note this is for informational purposes. Use markdown formatting.`,
  professor: `You are "AI Health Assist Teaching Assistant", an AI for medical professors. Help create teaching materials, assessment methods, exam questions, and curriculum planning. Use markdown formatting.`,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, userRole, history } = body;

    if (!message || !userRole) {
      return NextResponse.json({ success: false, error: 'Message and userRole are required' }, { status: 400 });
    }

    // Try Gemini API first if key is configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && !apiKey.startsWith('#') && !apiKey.includes('your_')) {
      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.0-flash',
          systemInstruction: ROLE_SYSTEM_PROMPTS[userRole] || ROLE_SYSTEM_PROMPTS.patient,
        });

        const chatHistory = (history || []).slice(-10).map((msg: { role: string; content: string }) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        }));

        const chat = model.startChat({ history: chatHistory });
        const result = await chat.sendMessage(message);
        const text = result.response.text();

        return NextResponse.json({
          success: true,
          data: { role: 'assistant', content: text, timestamp: new Date().toISOString(), source: 'gemini' },
        });
      } catch (geminiError: any) {
        console.error('Gemini API error, falling back to built-in engine:', geminiError?.message);
        // Fall through to built-in engine
      }
    }

    // Built-in AI engine (works without any API key)
    const response = generateAIResponse(message, userRole);

    return NextResponse.json({
      success: true,
      data: { role: 'assistant', content: response, timestamp: new Date().toISOString(), source: 'built-in' },
    });
  } catch (error: any) {
    console.error('AI Chat Error:', error?.message || error);

    // Ultimate fallback
    return NextResponse.json({
      success: true,
      data: {
        role: 'assistant',
        content: "I apologize for the temporary issue. Please try again in a moment. In the meantime, you can explore other features of the platform.",
        timestamp: new Date().toISOString(),
        source: 'fallback',
      },
    });
  }
}

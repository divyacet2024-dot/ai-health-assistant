import { NextRequest, NextResponse } from 'next/server';
import { agentDecide } from '@/lib/agent-system';
import {
  severityTool,
  medicineLookupTool,
  doctorBookingTool,
  inferDepartment,
} from '@/lib/tools';
import { makeCall } from '@/lib/twilio-call';
import { analyzeUtterance, formatNlpContext } from '@/lib/nlp/analyze';
import { reverseGeocode } from '@/lib/geocode';
import { stripVoiceOutputForSpeech } from '@/lib/voice-language-registry';

interface AgentResponse {
  intent: 'book_appointment' | 'emergency' | 'general';
  action: 'book' | 'call' | 'none';
  data: {
    date?: string;
    time?: string;
    name?: string;
  } & Record<string, any>;  // Flexible data
  response: string;
}

async function executeAction(agent: AgentResponse, userMessage: string): Promise<string> {
  const { action, data, response } = agent;
  console.log(`[Agent] Executing ${agent.intent} → ${action}`, data);

  try {
    switch (action) {
      case 'call':
        const callSid = await makeCall('Emergency! Patient needs immediate help.');
        return `Calling caretaker. Call ID: ${callSid.slice(-4)}.`;

      case 'book': {
        const bookingRes = await doctorBookingTool({
          userMessage,
          dateHint: data.date ? String(data.date) : undefined,
          timeHint: data.time ? String(data.time) : undefined,
          patientName: data.name ? String(data.name) : undefined,
        });
        const b = bookingRes.data;
        const persistNote = b.persisted
          ? 'Saved to your appointments list.'
          : 'Saved locally — clinic database was unavailable.';
        return (
          `You’re on the list.\n\n` +
          `Queue token **#${b.tokenNumber}**\n` +
          `${b.department} · ${b.doctorName}\n` +
          `${b.date} at ${b.time}\n\n` +
          `${persistNote}\n\n` +
          `You can review this under **Appointments**.\n\n` +
          `_Reminder: confirm details with your clinic if anything changes._`
        );
      }

      case 'none':
        // Root-level `response` from agent JSON (NOT data.response — that was always missing)
        return response?.trim() || 'Tell me what you’re feeling or what you need — one sentence is fine.';

      default:
        return 'Action completed.';
    }
  } catch (error) {
    console.error('[Agent] Action failed:', error);
    return 'Action failed, but I\'m here to help.';
  }
}

/** Strip ```json fences so Gemini JSON parses reliably */
function parseAgentJson(raw: string): AgentResponse | null {
  let s = raw.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) s = fence[1].trim();
  try {
    return JSON.parse(s) as AgentResponse;
  } catch {
    return null;
  }
}

type ChatHistoryItem = { role: string; content: string };

/**
 * Full conversational answer — addresses the actual question (not one generic sentence).
 */
async function generateDetailedAnswer(params: {
  message: string;
  userRole: string;
  effectiveLanguage: string;
  enhancedSystemPrompt: string;
  toolData: string;
  history?: ChatHistoryItem[];
  planningHint?: string;
  /** Mic path: terse, action-first; no long-form chat */
  voiceMode?: boolean;
}): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.startsWith('#') || apiKey.includes('your_')) return null;

  const criticalRules = params.voiceMode
    ? `CRITICAL — VOICE REAL-TIME AGENT (NOT LONG-FORM CHAT):
- Hard limit: MAX 40 words in your entire reply (count before sending).
- Give ONE clear action or answer first (what to do / what it means). One short safety line if needed.
- No markdown tables, no numbered essays, no "Introduction". At most 2 very short bullets.
- If CONTEXT has medicines: name at most ONE generic plus one warning — not a lecture.
- Educational-not-prescription: one short phrase only.
- If unclear: ONE short clarifying question (under 10 words).`
    : `CRITICAL RESPONSE RULES:
- Answer the user's actual question directly. Name symptoms, medicines, or topics they mentioned.
- Never reply with only "I understand", "Understood", or "I'm here to help" — always add concrete, specific guidance.
- If CONTEXT lists medicines with dosing and warnings, present them clearly (name, use, dosing note, warnings). Say clearly this is educational information, not a prescription.
- If CONTEXT describes a booked appointment with token number, repeat token, department, doctor, date and time so it feels like a real confirmation.
- If the question is unclear, ask ONE specific clarifying question instead of a vague acknowledgment.
- Use bullet points or short paragraphs when it helps readability.`;

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: `${params.enhancedSystemPrompt}

${criticalRules}`,
    });

    const hist = Array.isArray(params.history) ? params.history.slice(-10) : [];
    const historyText =
      hist.length > 0
        ? hist.map((t) => `${String(t.role)}: ${String(t.content)}`).join('\n')
        : '(no prior turns)';

    const hint = params.planningHint?.trim()
      ? `\nOptional routing hint (may help tone only): ${params.planningHint}\n`
      : '';

    const userBlock = `${hint}Context from tools / retrieval:
${params.toolData ? params.toolData : '(none)'}

Recent conversation:
${historyText}

User's question:
${params.message}

Write a helpful, specific answer for role "${params.userRole}". Follow the language rules for "${params.effectiveLanguage}".`;

    const result = await model.generateContent(userBlock);
    const text = result.response.text().trim();
    return text || null;
  } catch (e) {
    console.error('[Gemini] Detailed answer failed:', e);
    return null;
  }
}

function isEmergency(text: string): boolean {
  const t = text.toLowerCase();
  // Word boundaries avoid matching substrings like "helpful"
  return (
    /\bemergency\b/.test(t) ||
    /\bcritical\b/.test(t) ||
    /\burgent\b/.test(t) ||
    /\bhelp\b/.test(t) ||
    /\bhelp\s+me\b/.test(t) ||
    /\bsave\s+me\b/.test(t)
  );
}

/** User asked to phone / alert their caretaker (not only "emergency" wording). */
function requestsCaretakerPhoneCall(text: string): boolean {
  const t = text.toLowerCase();
  const mentionsCaretaker = /\bcaretaker\b/.test(t);
  const callLike = /\b(call|phone|ring|dial|notify|reach|contact)\b/.test(t);
  if (mentionsCaretaker && callLike) return true;
  if (/\bcall\s+(to\s+)?(my\s+)?(the\s+)?caretaker\b/.test(t)) return true;
  if (/\b(contact|notify)\s+(my\s+)?(the\s+)?caretaker\b/.test(t)) return true;
  return false;
}

function shouldOutboundCallCaretaker(text: string): boolean {
  return isEmergency(text) || requestsCaretakerPhoneCall(text);
}

/**
 * System prompts per role — language-agnostic base
 * Language-specific instructions are injected dynamically
 */
const ROLE_SYSTEM_PROMPTS: Record<string, string> = {
  patient: `You are the voice and chat helper for a real outpatient clinic — calm, direct, and human.

PERSONA (sound realistic, not like a generic chatbot):
- Talk like an experienced triage line or front-desk nurse: short sentences, warm but efficient.
- Never use filler such as "As an AI", "Great question", "I’d be happy to", "Certainly", or "Let me assist you with".
- Start with the useful part: what to do, what to watch for, or what to ask the doctor — not a preamble.
- One brief empathy line is enough, then move to facts and next steps.
- You give general education only — you never replace a clinician. Say so in one honest line when it matters.

STRICT OUTPUT RULE:
- NEVER say "Let me create...", "I will now...", "Step 1", "Now I will fix"
- DO NOT describe your own process
- Output ONLY what the patient should read or hear
- No thinking steps

GUIDELINES:
- Help with symptoms, medicines (general info), and when to seek care
- Use plain language; match the user’s language and tone
- Never diagnose or prescribe; suggest they confirm with a doctor for anything serious
- Use light markdown when it helps (short bullets), but keep voice-style answers speakable`,

  student: `You are "AI Health Assist Study Tutor", an expert medical education AI.

STRICT OUTPUT RULE:
- NEVER say "Let me create...", "I will now...", "Step 1", "Now I will fix"
- DO NOT describe what you are doing
- Output ONLY the final response to user
- No explanations of process
- No thinking steps

GUIDELINES:
- Explain medical concepts clearly with clinical correlations
- Use mnemonics and practical tips
- Cover anatomy, physiology, pharmacology, pathology, microbiology, medicine, surgery
- Encourage active learning and clinical thinking
- Use markdown formatting`,

  doctor: `You are "AI Health Assist Clinical Assistant", an AI for doctors.

STRICT OUTPUT RULE:
- NEVER say "Let me create...", "I will now...", "Step 1", "Now I will fix"
- DO NOT describe what you are doing
- Output ONLY the final response to user
- No explanations of process
- No thinking steps

GUIDELINES:
- Provide differential diagnosis suggestions
- Share evidence-based treatment guidelines
- Warn about drug interactions
- Include clinical scoring systems
- Be concise and clinically focused
- Use markdown formatting`,

  professor: `You are "AI Health Assist Teaching Assistant", an AI for medical professors.

STRICT OUTPUT RULE:
- NEVER say "Let me create...", "I will now...", "Step 1", "Now I will fix"
- DO NOT describe what you are doing
- Output ONLY the final response to user
- No explanations of process
- No thinking steps

GUIDELINES:
- Help create teaching materials and assessments
- Suggest curriculum design strategies
- Answer complex medical queries
- Support student engagement
- Be scholarly and pedagogical
- Use markdown formatting`,
};

/**
 * Language-specific style guidance for natural responses
 * CRITICAL: When user inputs in a regional language, respond ONLY in that language.
 */
const LANGUAGE_STYLES: Record<string, string> = {
  hi: `CRITICAL: YOU MUST RESPOND IN HINDI ONLY (Devanagari script).

RULES:
- Use conversational, friendly Hindi — like talking to a neighbor or friend
- NEVER use English unless user explicitly uses English words
- Use simple, common Hindi words: "dard" (pain), "bukhaar" (fever), "dawai" (medicine), "suksham" (headache), "pet" (stomach), "narmee" (vomit)
- Avoid English medical jargon — explain in Hindi: "bp" → "রক্তচাপ", "sugar" → "মধুমেহ"
- Example good: "Aapko sir dard ho raha hai? Pani zyada piye, aaram karein. Paracetamol le sakte ho."
- Example BAD: "You have headache. Drink water." (this is English — NEVER do this)

If medical term has no Hindi equivalent, describe it simply: "heart attack" → "heart ka andar blood block ho jata hai"`,

  kn: `CRITICAL: YOU MUST RESPOND IN KANNADA ONLY (Kannada script).

RULES:
- Use natural, spoken Kannada (ಬಾಸಿಗೆ ಕನ್ನಡ) — NOT literary/textbook form
- NEVER use English unless user mixes English. If user says "I have headache", respond in Kannada: "ನಿಮಗೆ ತಲೆನೋವು ಇದೆಯೆ?"
- Use simple, everyday Kannada words:
  • "ನೋವು" (nōvu) = pain, "ಜ್ವರ" (jvara) / "ಬುಕ್ಕ" (bukka) = fever
  • "ಜಲ" (jala) / "ತು" (tu) = water, "ಮಡುಕ" (maḍuka) = rest
  • "ಔಷಧಿ" (auṣadhi) = medicine, "ವೈದ್ಯರು" (vaidyaru) / "ಡಾಕ್ಟರ್" = doctor
  • "ಆಸ್ಪತ್ರೆ" (āspat) = hospital
- Warm, respectful tone — like talking to family/elder
- Use "ನೀವು" (nīvu) respectful form; "ನೀನು" only for close friends
- Keep sentences short, practical, empathetic

MEDICAL QUERY PATTERN (for patient role):
1. First suggest 1-2 simple home remedies (ಮನೆಯಲ್ಲಿ ಮಾಡಬಹುದಾದುದು)
2. Explain in 2-3 sentences max
3. Always add: "ಇದರಿಂದ ಸರಿಯಾಗದಿದ್ದರೆ, ಏನು? ಡಾಕ್ಟರ್ ನೋಡಿಸಿ." (If not better, see doctor)
4. NEVER list 5-6 medicines — only common safe ones (paracetamol, ORS)

EXAMPLE CONVERSATIONS:
User: "ನನ್ನಿಗೆ ಜ್ವರ ಬಂತೆ"
You: "ಎದ್ದು ನೋವು? ಜ್ವರವಾಗಿದೆ. ನೀರು plenty ಕುಡಿಯಿರಿ. ವಿಶ್ರಾಂತಿ ತೆಗೆದುಕೊಳ್ಳಿ. ಟಿ-ಫೆಮೆಂಟ್ ಬಳಸಬಹುದು. ಮೂರು ದಿನ ಆಗದಿದ್ದರೆ ಡಾಕ್ಟರ್ ಕಾಣಿ."

User: "ತಲೆನೋವು ಇದೆ"
You: "ತಲೆನೋವು? ಶೀ assembl ಶಾಂತ ಕ್ಷೇತ್ರ. ನೀರು ಕುಡಿ. ಕಣ್ಣು ಮುಚ್ಚಿ ಸಾಲು. ಸೆಯಿಂಗ್ ಇಲ್ಲ? ವೈದ್ಯರು ಪರಿಚಯ."

CRITICAL: If user uses ANY English word, DO NOT switch to English. Keep Kannada for everything except the English medical term itself (e.g., "headache" → use "ತಲೆನೋವು", not "headache").`,

  te: `CRITICAL: YOU MUST RESPOND IN TELUGU ONLY (Telugu script).

RULES:
- Use everyday Telugu (ఇంటి భాష) — conversational, not textbook
- NEVER use English unless user uses English words
- Simple health terms:
  • "వేడి" = fever
  • "పీడా" / "వేపు" = pain
  • "నీళ్ళు" = water
  • "మందు" = medicine
  • "మరుగు" = rest
  • "తల నొప్పి" = headache
- Warm, friendly tone like talking to a friend
- Start with "హలో" or "నమస్కారం"
- Example: "మీలో తల నొప్పి ఉంది? చాలా నీటి ప Richardson. శాంతిగా ఉండండి. డాక్టర్ కి చూడండి."`,

  ta: `CRITICAL: YOU MUST RESPOND IN TAMIL ONLY (Tamil script).

RULES:
- Use spoken Tamil (பழமொழி) — colloquial, NOT literary Tamil
- NEVER use English unless user mixes English
- Simple health words:
  • "தலைவலி" = headache
  • "கலைட்" = fever
  • "நீர்" = water
  • "மருந்து" = medicine
  • "ஒியுள்" = sleep
- Warm tone like family conversation
- Phrases: " என்ன பŻblem?" (what problem?), "சொல்லுங்க" (tell me), "பாஸ்ஸumna?" (how are you?)
- Example: "தலைவலி இருக்கிறதா? நீர் தண்ணீர் குடிக்குங்க. ஃபர塞க் போகலாம். டாக்டரை காணவும்."`,

  ml: `CRITICAL: YOU MUST RESPOND IN MALAYALAM ONLY (Malayalam script).

RULES:
- Use casual, conversational Malayalam — like talking to neighbor/cousin
- NEVER use English unless user mixes it
- Simple terms:
  • "kuy" / "കുയി" = fever
  • "vedana" / "വെദന" = pain
  • "marunnu" / "മരുന്ന്" = medicine
  • "vellam" / "വെള്ളം" = water
  • "nidra" / "നിദ്ര" = sleep
- Friendly, caring tone
- Example: "തല വേദനമുണ്ടോ? വെള്ളം കുടിക്കുക. ശാന്തമാകുക. ഡോക്ടർ കാണിക്കുക."`,

  mr: `CRITICAL: YOU MUST RESPOND IN MARATHI ONLY (Devanagari script).

RULES:
- Conversational Marathi (बोलचाल) — not formal
- NEVER use English unless user does
- Simple health words:
  • "उकāl" / "उकाल" = fever
  • "વે દન" / "દુખ" = pain
  • "ઓષધ" / "દવા" = medicine
  • "પાણી" = water
- Use "તમે" (formal you) or "તુ" (close) appropriately
- Example: "તમારા સિરમાં દર્દ છે? પાણી ખૂબ ખો. આરામ કરો. ડાક્ટર દેખાવો."`,

  en: `RESPOND IN ENGLISH:

RULES:
- Clear, simple English — not overly technical
- Professional but friendly tone
- If user is doctor/professor, can use medical terminology
- Avoid jargon for patients — explain terms simply
- Example (patient): "Headache can be caused by stress or dehydration. Drink plenty of water, rest, and consider taking paracetamol. If it persists, consult a doctor."
- Example (doctor): "Consider differential: tension headache vs migraine. Rule out secondary causes. NSAIDs first-line."`,
};

/**
 * Detect language using simple heuristics + Gemini
 */
async function detectMessageLanguage(message: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  // Comprehensive heuristic detection — checks word banks
  const lowerMsg = message.toLowerCase();

  // Hindi: common words + Devanagari script detection
  const hindiWords = ['hai', 'hain', 'ka', 'ki', 'ke', 'mera', 'teraa', 'kya', 'kaise', 'kyun', 'main', 'hum', 'aap', 'nahi', 'mere', 'pass', 'ko', 'ki', 'se', 'koi', 'kuch', 'samajh', 'aaya', 'jaana', 'karna'];
  if (hindiWords.some(w => lowerMsg.includes(w)) || /[।!?]/.test(message)) return 'hi';

  // Kannada: common conversational words
  const kannadaWords = ['idu', 'neenu', 'naanu', 'yaaru', 'hege', 'yaake', 'sari', 'illa', 'howda', 'munde', 'nooru', 'tgu', 'nimm', 'nimma', 'nana', 'nanna', 'anga', 'inga', 'yahge', 'sariyagi', 'bangara'];
  if (kannadaWords.some(w => lowerMsg.includes(w))) return 'kn';

  // Telugu
  const teluguWords = ['nenu', 'nuvu', 'em chestundi', 'ela', 'ledu', 'sare', 'bagundi', 'pelli', 'vadhalu', 'eemely', 'mega', 'cheppu', 'tinali'];
  if (teluguWords.some(w => lowerMsg.includes(w))) return 'te';

  // Tamil
  const tamilWords = ['naan', 'nee', 'enna', 'eppadi', 'yeppadi', 'solla', 'panna', 'irukku', 'ennada', 'sollunga', 'pannunga', 'epdi', 'yenna'];
  if (tamilWords.some(w => lowerMsg.includes(w))) return 'ta';

  // Malayalam
  const malayalamWords = ['njan', 'nin', 'enne', 'enth', 'alla', 'ariyam', 'shari', 'pokum', 'kanum', 'ith', 'pottan', 'nokko', 'paray', 'nadakku'];
  if (malayalamWords.some(w => lowerMsg.includes(w))) return 'ml';

  // Marathi
  const marathiWords = ['mi', 'tu', 'aahe', 'kasa', 'kay', 'aamhi', 'tumhi', 'nahi', 'kity', 'shambhar'];
  if (marathiWords.some(w => lowerMsg.includes(w))) return 'mr';

  // Mixed language detection (Hinglish, Tanglish, Kanglish)
  if (lowerMsg.match(/[a-zA-Z]/) && /[।!?]/.test(message)) return 'hinglish'; // Hindi + English chars
  if (lowerMsg.match(/[a-zA-Z]/) && tamilWords.some(w => lowerMsg.includes(w))) return 'tanglish';
  if (lowerMsg.match(/[a-zA-Z]/) && kannadaWords.some(w => lowerMsg.includes(w))) return 'kanglish';

  // Use Gemini for complex detection if available
  if (apiKey && !apiKey.startsWith('#') && !apiKey.includes('your_')) {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const prompt = `Detect the language of this text. Respond with ONLY the language code:
options: en, hi, kn, te, ta, ml, mr, gu, bn, pan, ur, hinglish, tanglish, kanglish

Text: "${message.slice(0, 200)}"

Language code:`;

      const result = await model.generateContent(prompt);
      const detected = result.response.text().trim().toLowerCase();

      const validCodes = ['en','hi','kn','te','ta','ml','mr','gu','bn','pan','ur','hinglish','tanglish','kanglish'];
      if (validCodes.includes(detected)) {
        return detected as any;
      }
    } catch (e) {
      // Fall through to default
    }
  }

  return 'en'; // Default fallback
}

/**
 * Translate text to target language using Gemini
 */
async function translateText(text: string, targetLang: string): Promise<string> {
  if (targetLang === 'en') return text;
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.startsWith('#') || apiKey.includes('your_')) {
    return text; // No translation without API key
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const styleGuide = LANGUAGE_STYLES[targetLang] || LANGUAGE_STYLES.en;
    
    const prompt = `Translate and adapt this medical/health response to ${targetLang} following these guidelines:

${styleGuide}

IMPORTANT:
1. Translate meaning, not word-for-word
2. Use natural, conversational tone
3. Keep medical terminology accurate but simple
4. Maintain original formatting (markdown, bullet points)
5. Do NOT add explanations — just output translated text

Text to translate:
---
${text}
---

Translated response in ${targetLang}:`;
    
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Fallback to original
  }
}

/**
 * Simple heuristic to check if response is in expected language
 */
function isTextInExpectedLanguage(text: string, expectedLang: string): boolean {
  if (expectedLang === 'en') return /[a-zA-Z]/.test(text);
  
  const scriptRanges: Record<string, [number, number][]> = {
    hi: [[0x0900, 0x097F]], // Devanagari
    kn: [[0x0C80, 0x0CFF]], // Kannada
    te: [[0x0C00, 0x0C7F]], // Telugu
    ta: [[0x0B80, 0x0BFF]], // Tamil
    ml: [[0x0D00, 0x0D7F]], // Malayalam
    mr: [[0x0900, 0x097F]], // Devanagari
    gu: [[0x0A80, 0x0AFF]], // Gujarati
    bn: [[0x0980, 0x09FF]], // Bengali
    pan: [[0x0A00, 0x0A7F]], // Gurmukhi
    ur: [[0x0600, 0x06FF]], // Arabic
  };

  const ranges = scriptRanges[expectedLang];
  if (!ranges) return true; // Unknown lang — accept
  
  // Check if at least 30% of non-space chars are in expected script
  const chars = text.replace(/\s/g, '').split('');
  if (chars.length === 0) return false;
  
  let matches = 0;
  for (const char of chars) {
    const code = char.charCodeAt(0);
    for (const [start, end] of ranges) {
      if (code >= start && code <= end) {
        matches++;
        break;
      }
    }
  }
  
  return (matches / chars.length) > 0.3;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, userRole, history, preferredLanguage } = body;
    const voiceMode = Boolean(body.voiceMode);

    if (!message || !userRole) {
      return NextResponse.json(
        { success: false, error: 'Message and userRole are required' },
        { status: 400 }
      );
    }

    // Outbound voice call — emergency OR explicit “call my caretaker” (runs before LLM so it always executes)
    const userMessage = String(message);
    if (shouldOutboundCallCaretaker(userMessage)) {
      const isUrgent = isEmergency(userMessage);
      const twilioSay = isUrgent
        ? 'Emergency alert. Patient needs immediate help. Please respond immediately.'
        : 'This is your health assistant. The patient asked to reach you. Please check on them or call back as soon as you can.';

      let callSid: string | null = null;
      let callError: string | null = null;

      try {
        console.log('[API ai-chat] Outbound call triggered', {
          reason: isUrgent ? 'emergency_keywords' : 'caretaker_call_request',
        });
        callSid = await makeCall(twilioSay);
        console.log('[API ai-chat] Twilio call created', { sid: callSid });
      } catch (err: unknown) {
        callError = err instanceof Error ? err.message : String(err);
        console.error('[API ai-chat] Twilio call failed:', callError);
      }

      const content =
        callSid != null
          ? isUrgent
            ? 'Calling caretaker. Emergency alert sent.'
            : 'Calling your caretaker now.'
          : `Could not place the call: ${callError ?? 'unknown error'}. Set TWILIO_* and CARETAKER_PHONE_NUMBER (+countrycode number) and verify the number on a Twilio trial account.`;

      return NextResponse.json({
        success: true,
        data: {
          role: 'assistant',
          content,
          timestamp: new Date().toISOString(),
          isEmergency: isUrgent,
          triggeredBy: isUrgent ? 'emergency' : 'caretaker_request',
          callSid,
          callError,
        },
      });
    }

     // 1. DETECT LANGUAGE
     const detectedLang = await detectMessageLanguage(message);
     const effectiveLanguage = preferredLanguage === 'auto' ? detectedLang : (preferredLanguage || 'en');

    // 1b. NLP (intent + entities) + optional device location → geo label
    const nlp = analyzeUtterance(userMessage);
    let geoLabel: string | null = null;
    const rawLoc = body.location as
      | { latitude?: number; longitude?: number; accuracy?: number }
      | undefined;
    if (
      rawLoc &&
      Number.isFinite(rawLoc.latitude) &&
      Number.isFinite(rawLoc.longitude)
    ) {
      try {
        const rev = await reverseGeocode(rawLoc.latitude!, rawLoc.longitude!);
        geoLabel = rev?.label ?? null;
        if (geoLabel) {
          console.log('[API ai-chat] Location context:', geoLabel.slice(0, 100));
        }
      } catch (geoErr) {
        console.warn('[API ai-chat] reverseGeocode failed:', geoErr);
      }
    }
    const nlpContextBlock = formatNlpContext(nlp, geoLabel);
    console.log('[API ai-chat] NLP intent:', nlp.primaryIntent, 'conf:', nlp.confidence.toFixed(2));

    // 2. AGENT DECISION: Determine what kind of action to take
    const decision = agentDecide(message);

     // Execute appropriate tool based on decision
     let toolData = "";

     switch (decision.type) {
       case "severity":
         const severityRes = await severityTool(decision.input);
         toolData = `Severity level: ${severityRes.data}`;
         break;

       case "medicine": {
         const medsRes = await medicineLookupTool(decision.input);
         toolData =
           medsRes.data?.markdownBlock ||
           `Medicines: ${(medsRes.data?.names || []).join(', ')}`;
         break;
       }

       case "booking":
         toolData = `User requested an appointment. Summary: "${String(decision.input).slice(0, 260)}". Suggested specialty: ${inferDepartment(decision.input)}. Executing action "book" will save a token to appointments.`;
         break;

       case "chat":
       default:
         toolData = "";
         break;
     }

     const toolDataCombined = [toolData, `NLP / Location context:\n${nlpContextBlock}`]
       .filter(Boolean)
       .join('\n\n');

     // Voice optimization: mic uses stricter action-first rules (voiceMode); typed chat uses milder hints
     const voiceInstruction = voiceMode
       ? `\n\nVOICE REAL-TIME AGENT (USER ON MIC):
- You are executing intents in spoken form — NOT writing an essay or form.
- MAX ~40 words for any generated explanation after tools run.
- Prefer: immediate answer → one safety line → offer next spoken command ("Say book appointment").
- Never describe internal steps or "I will now analyze".`
       : `\n\nVOICE OUTPUT RULES (when user may use speaker):
- Keep sentences SHORT (max 10-12 words per sentence)
- Use simple words, not complex terminology
- Break long explanations into 2-3 sentence chunks
- Conversational tone: "You have fever. Drink water. Take rest."
- For medical advice: state remedy → explain briefly → suggest doctor if needed`;

     // Behavioral rules for all languages
     const behavioralRules = `
BEHAVIOR RULES:
- You get things done: book, explain, or route to emergency — not endless chat
- For patients: one or two safe self-care ideas when appropriate, then clear “see a doctor if…” lines
- Never invent drug names, doses, or tests not implied by the user or context
- If something is unclear, ask ONE specific question in the same language the user used
- Sound like a real person on a busy shift: kind, direct, no corporate tone`;

     // Build enhanced system prompt with all context
     const basePrompt = ROLE_SYSTEM_PROMPTS[userRole] || ROLE_SYSTEM_PROMPTS.patient;
     const styleGuide = LANGUAGE_STYLES[effectiveLanguage] || LANGUAGE_STYLES.en;
     
     const enhancedSystemPrompt =
       (effectiveLanguage !== 'en'
         ? `${basePrompt}${voiceInstruction}${behavioralRules}\n\n${styleGuide}\n\nCRITICAL: Respond in ${effectiveLanguage} only. Use native script.`
         : `${basePrompt}${voiceInstruction}${behavioralRules}`) +
       `\n\n--- Structured understanding (NLP + optional GPS; use naturally, never invent addresses) ---\n${nlpContextBlock}`;

// 4. AGENT JSON MODE - Structured actions with priority
    const agentPrompt = `
PRIORITY RULES (STRICT):
1. EMERGENCY / PHONE CARETAKER first: "emergency", "critical", "urgent", "help", "call my caretaker", "phone caretaker", "notify caretaker" → intent:"emergency", action:"call"
2. BOOKING: "book appointment", "schedule visit", "see doctor", "hospital tomorrow", "need doctor" → intent:"book_appointment", action:"book". Fill data.date (e.g. tomorrow), data.time if user said it, data.name if given.
3. MEDICINE questions keep action:"none" unless booking — CONTEXT already has medicine facts for you to summarize.
4. GENERAL default — concrete answers only.

OUTPUT ONLY VALID JSON (no extra text):
{
  "intent": "book_appointment | emergency | general",
  "action": "book | call | none", 
  "data": {
    "date": "tomorrow",
    "time": "5pm", 
    "name": "John"
  },
  "response": "${voiceMode ? 'MAX 8 WORDS — spoken cue only' : 'SHORT VOICE MESSAGE (1 sentence)'}"
}

User: ${message}
${toolDataCombined ? 'Context:\n' + toolDataCombined : ''}

JSON:`;

    let agentResponse: AgentResponse;
    
    // Try Gemini for JSON
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && !apiKey.startsWith('#') && !apiKey.includes('your_')) {
      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const result = await model.generateContent(agentPrompt);
        const jsonStr = result.response.text().trim();

        const parsed = parseAgentJson(jsonStr);
        if (parsed) {
          agentResponse = parsed;
          console.log('[Agent] Parsed JSON:', agentResponse);
        }
      } catch (parseError) {
        console.error('[Agent] JSON parse failed:', parseError);
      }
    }

    // Fallback rule-based
    if (!agentResponse) {
      if (shouldOutboundCallCaretaker(String(message))) {
        agentResponse = {
          intent: 'emergency',
          action: 'call',
          data: {},
          response: 'Calling your caretaker now.',
        };
      } else {
        const decision = agentDecide(message);
        if (decision.type === 'booking') {
          agentResponse = {
            intent: 'book_appointment',
            action: 'book',
            data: { date: decision.input },
            response: 'Checking doctor availability.'
          };
        } else {
          agentResponse = {
            intent: 'general',
            action: 'none',
            data: {},
            response: 'How can I help with your health today? Say symptoms, medicines, or book a visit.'
          };
        }
      }
    }

    // If the model returned JSON but ignored a caretaker-call request, force the call path
    if (requestsCaretakerPhoneCall(String(message)) && agentResponse.action !== 'call') {
      agentResponse = {
        intent: 'emergency',
        action: 'call',
        data: {},
        response: 'Calling your caretaker now.',
      };
    }

    const wantsAppointment =
      nlp.primaryIntent === 'appointment' ||
      /\b(book|schedule)\s+(an\s+)?appointment\b/i.test(userMessage) ||
      /\b(visit|see)\s+(the\s+)?(doctor|physician)\b/i.test(userMessage);
    const medicineOnly =
      nlp.primaryIntent === 'medicine_info' ||
      /\b(which|what)\s+(medicine|tablet|drug)\b/i.test(userMessage);

    if (
      wantsAppointment &&
      !medicineOnly &&
      agentResponse.action !== 'call' &&
      agentResponse.action !== 'book'
    ) {
      agentResponse = {
        intent: 'book_appointment',
        action: 'book',
        data: {
          ...(agentResponse.data || {}),
          date: agentResponse.data?.date || 'tomorrow',
          name: agentResponse.data?.name || 'Patient',
        },
        response: 'Booking your appointment.',
      };
    }

    // 5. EXECUTE ACTION & FINALIZE RESPONSE
    const historyItems = Array.isArray(history)
      ? (history as ChatHistoryItem[]).filter((h) => h && typeof h.content === 'string')
      : [];

    let finalResponse: string;
    if (agentResponse.action === 'call' || agentResponse.action === 'book') {
      finalResponse = await executeAction(agentResponse, userMessage);
      if (voiceMode) {
        finalResponse = stripVoiceOutputForSpeech(finalResponse);
      }
    } else {
      const detailed = await generateDetailedAnswer({
        message: String(message),
        userRole: String(userRole),
        effectiveLanguage,
        enhancedSystemPrompt,
        toolData: toolDataCombined,
        history: historyItems,
        planningHint: agentResponse.response,
        voiceMode,
      });
      finalResponse = detailed ?? (await executeAction(agentResponse, userMessage));
    }

    // Translate if needed
    let spokenResponse =
      effectiveLanguage !== 'en' ? await translateText(finalResponse, effectiveLanguage) : finalResponse;

    if (voiceMode) {
      spokenResponse = stripVoiceOutputForSpeech(spokenResponse);
    }

    return NextResponse.json({
      success: true,
      data: {
        role: 'assistant',
        content: spokenResponse,
        agent: agentResponse,  // Full structured for frontend
        timestamp: new Date().toISOString(),
        language: effectiveLanguage,
        nlp: {
          primaryIntent: nlp.primaryIntent,
          confidence: nlp.confidence,
          entities: nlp.entities,
        },
        locationContext: geoLabel
          ? { label: geoLabel, approximate: true as const }
          : rawLoc
            ? { latitude: rawLoc.latitude, longitude: rawLoc.longitude, approximate: true as const }
            : null,
        voiceMode,
      },
    });
    } catch (error: any) {
     console.error('AI Chat Error:', error?.message || error);

     return NextResponse.json({
       success: true,
       data: {
         role: 'assistant',
         content: "I apologize for the technical issue. Please try again shortly. If the problem persists, check your internet connection.",
         timestamp: new Date().toISOString(),
         source: 'fallback',
         language: 'en',
       },
     });
   }
}
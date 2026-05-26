export type AgentContext = {
  language: string;
  userRole: string;
  conversationHistory: Array<{ text: string; isUser: boolean }>;
};

export type AgentDecision =
  | {
      action: 'respond';
      content: string;
      reasoning: string;
    }
  | {
      action: 'clarify';
      content: string;
      reasoning: string;
    }
  | {
      action: 'action';
      actionType: 'navigate' | 'trigger';
      path?: string;
      reasoning: string;
    }
  | {
      action: 'continue';
      reasoning: string;
    };

function containsMedicalTerms(input: string, language: string): boolean {
  const medicalMap: Record<string, string[]> = {
    en: ['pain', 'fever', 'headache', 'cough', 'cold', 'stomach', 'nausea', 'vomit', 'dizzy', 'sick', 'hurt', 'ache'],
    hi: ['dard', 'bukhaar', 'sir', 'pet', 'mich', 'ulti', 'chaal', 'gala'],
    kn: ['nōvu', 'jvara', 'talenōvu', 'jeḷe', 'hosagē', 'hōlu'],
    te: ['nōpu', 'jvara', 'talanōpu', 'tala'],
    ta: ['nōy', 'kuḷir', 'talainōy', 'vayiru'],
    ml: ['vedana', 'kōṭṭ', 'talavedana'],
    mr: ['vedanā', 'tāp', 'hōḷa'],
  };

  const words = medicalMap[language] || medicalMap.en;
  const lower = input.toLowerCase();
  return words.some((w) => lower.includes(w));
}

/**
 * Intent detection
 */
export function detectIntent(input: string, language: string, userRole: string) {
  const lower = input.toLowerCase();

  // Appointment
  const appointmentKeywords: Record<string, string[]> = {
    en: ['appointment', 'book', 'schedule', 'visit', 'consult', 'doctor'],
    hi: ['अपॉइंटमेंट', 'बुक', 'शेड्यूल', 'विजिट', 'डॉक्टर'],
    kn: ['ಭೇಟಿ', 'ಬುಕ್', 'ಸ್ಥu200cयೋಜನೆ', 'ವೈದ್ಯರನ್ನು'],
    te: ['అపాయింటu200cమెంట్', 'బుక్', 'విజిట్', 'డాక్టర్'],
    ta: ['நேரம்', 'வெளிச்சம்', 'சந்திப்பு', 'மருத்துவரை'],
    ml: ['അപോയിന്റ്മെന്റ്', 'ബുക്ക്', 'വിസിറ്റ്', 'ഡോക്ടർ'],
    mr: ['भेट', 'बुक', 'वेळ', 'डॉक्टर'],
  };
  const appWords = appointmentKeywords[language] || appointmentKeywords.en;
  if (appWords.some((k) => lower.includes(k))) {
    return { type: 'appointment', confidence: 0.8 };
  }

  // Medicine
  const medKeywords: Record<string, string[]> = {
    en: ['medicine', 'tablet', 'pill', 'scan', 'prescription'],
    hi: ['दवा', 'मेडिसिन', 'टैबलेट', 'स्कैन'],
    kn: ['ಮರಿu200dಜು', 'ಮೆಡಿಸಿನ್', 'ಔಷಧಿ', 'ಸ್ಕ್ಯಾನ್'],
    te: ['మందు', 'మెడిసిన్', 'టాబ్లెట్', 'స్కాన్'],
    ta: ['மருந்து', 'மெதിചியன்', 'tablet', 'scan'],
    ml: ['മരുന്ന്', 'മെഡിസിൻ', 'ടാബ്ലറ്റ്', 'സ്ക്യാൻ'],
    mr: ['औषध', 'मेडिसिन', 'टेबलेट', 'स्कॅन'],
  };
  const medWords = medKeywords[language] || medKeywords.en;
  if (medWords.some((k) => lower.includes(k))) {
    return { type: 'medicine', confidence: 0.8 };
  }

  // Health log
  const healthKW = ['log', 'track', 'record', 'health', 'analytics'];
  if (healthKW.some((k) => lower.includes(k))) {
    return { type: 'health_log', confidence: 0.7 };
  }

  return { type: 'general', confidence: 0.3 };
}

export function getPathForIntent(intent: string, role: string): string {
  const map: Record<string, string> = {
    appointment: role === 'patient' ? '/dashboard/appointments' : '/dashboard/patients',
    medicine: '/dashboard/medicine',
    health_log: '/dashboard/health-analytics',
  };
  return map[intent] || '/dashboard/';
}

/**
 * Extract symptoms
 */
export function extractSymptoms(input: string, language: string): string[] {
  const symptomMap: Record<string, string[]> = {
    en: ['headache', 'fever', 'cough', 'cold', 'stomach', 'pain', 'nausea', 'dizzy'],
    hi: ['सिर दर्द', 'बुखार', 'खांसी', 'जुकाम', 'पेट दर्द', 'उल्टी'],
    kn: ['ತಲೆ ನೋವು', 'ಜ್ವರ', 'ಒಲೆ', 'ಹೊಟ್ಟೆ ನೋವು', 'ವಾಂತಿ'],
    te: ['తల నొప్పి', 'జ్వరం', 'టాలిసు', 'పెట్ట నొప్పి'],
    ta: ['தலைவலி', 'குளிர்', 'வயிறு நோய்'],
    ml: ['തല വേദന', 'കോട്ട', 'വയർ നോയ്'],
    mr: ['डोक्याचा दुख', 'ताप', 'पेट दुख'],
  };

  const symptoms = symptomMap[language] || symptomMap.en;
  const found: string[] = [];
  const lower = input.toLowerCase();
  for (const sym of symptoms) {
    if (lower.includes(sym.toLowerCase())) {
      found.push(sym);
    }
  }
  return found;
}

/**
 * Main Agent Decision Engine
 */
export function agentDecide(input: string, context: AgentContext): AgentDecision {
  const { language, userRole } = context;

  // 1. Medical symptoms (patient only) → immediate safe response
  if (userRole === 'patient' && containsMedicalTerms(input, language)) {
    const response = generateMedicalResponse(input, language);
    return {
      action: 'respond',
      content: response,
      reasoning: 'Medical symptoms → safe home remedy + doctor advice',
    };
  }

  // 2. Intent routing
  const intent = detectIntent(input, language, userRole);
  if (intent.confidence > 0.6) {
    return {
      action: 'action',
      actionType: 'navigate',
      path: getPathForIntent(intent.type, userRole),
      reasoning: `Intent detected: ${intent.type} → route to feature`,
    };
  }

  // 3. Clarification
  const clarity = needsClarification(input, language);
  if (clarity.shouldAsk) {
    const question = generateClarificationQuestion(clarity.reason, language, userRole);
    return {
      action: 'clarify',
      content: question,
      reasoning: 'Unclear input → ask clarification in same language',
    };
  }

  // 4. Continue to LLM
  return {
    action: 'continue',
    reasoning: 'General conversation → forward to LLM',
  };
}

/**
 * Generate safe medical response (home remedies + doctor advice)
 * NO specific medicine names
 */
export function generateMedicalResponse(input: string, language: string): string {
  const symptoms = extractSymptoms(input, language);
  const symptomText = symptoms.length ? symptoms.join(', ') : 'ಈ ಸಂಕೆಟ';

  const templates: Record<string, string> = {
    en: `I understand you're experiencing ${symptomText}.\n\n**What you can do at home:**\n1. Rest adequately\n2. Drink plenty of water\n3. Eat light, nutritious food\n\nIf symptoms persist for more than 2-3 days or worsen, please consult a doctor immediately.\n\nWould you like me to book an appointment or show your health dashboard?`,
    hi: `मैं समझ गया हूँ कि आपको ${symptomText} हो रहा है।\n\n**घर पर क्या करें:**\n1. आराम करें\n2. पानी बहुत पिएं\n3. हल्का, पौष्टिक भोजन लें\n\nयदि 2-3 दिन से लगता रहे या बढ़ जाए, तो तुरंत डॉक्टर से सलाह लें।\n\nक्या आप अपॉइंटमेंट बुक करवाना चाहेंगे या हेल्थ डैशबोर्ड देखना चाहेंगे?`,
    kn: `ನಾನು ಅರ್ಥ ಮಾಡಿದ್ದೇನೆ: ನಿಮಗೆ ${symptomText} ಆಗಿದೆ.\n\n**ಮನೆಯಲ್ಲಿ ಮಾಡಬಹುದಾದುದು:**\n1. ವಿಶ್ರಾಂತಿ ತೆಗೆದುಕೊಳ್ಳಿ\n2. ನೀರು plenty ಕುಡಿಯಿರಿ\n3. ಹಲಕು, ಪೌಷ್ಟಿಕ ಆಹಾರ\n\n**ಮಹತ್ವದ್ದು:** ಮೂರು ದಿನಗಳಿಗಿಂತ ಹೆಚ್ಚು ಇರಲಾದರೆ ಡಾಕ್ಟರ್ ನೋಡಿಸಿ.\n\nನಿಮಗೆ ಭೇಟಿಯನ್ನು ಬುಕ್ ಮಾಡಲು ಬೇಕೆ? ಹೆಲ್ತ್ ಡ್ಯಾಶ್da95944d4be9024795be0be25?`,
    te: `నేను అర్థం చేసుకున్నాను: మీలో ${symptomText} ఉంది.\n\n**ఇది చేయండి:**\n1. విశ్రాంతి తీసుకోండి\n2. చాలా నీరు పునరాధారం పెట్టుకోండి\n3. తేలికapaceten ఆహారం తినండి\n\n**ముఖ్యం:** 2-3 రోజుల కన్నా ఎక్కువ ఉండటంతో, దయచేసి డాక్టర్73253124525426ను సంప్రదించండి.\n\nమీరు అపాయింట్u200dమెంట్ బుక్ చేయాలనుకుంటున్నారా? ఆరోగ్య డాష్4213455241 చూడాలనుకుంటున్నారా?`,
    ta: `நான் புரிந்துகொண்டேன்: நீங்கள் ${symptomText} undergone.\n\n**வீட்டில் என்ன செய்யலாம்:**\n1. ஓய்வெடுக்கவும்\n2. நீர்ப்பால் பரவலாக குடிக்கவும்\n3. சிறிது, சத்து நிறைந்த உணவு எடுக்கவும்\n\n**குறிப்பு:** 2-3 நாட்களை விட உயர்ந்தால், டாக்டரை காணவும்.\n\nநீங்கள் அப் ப怀 petnt book செய்யவா? ஆரோக்கிய டாஷ்போர்டு பார்த்துவிடவா?`,
  };

  return templates[language] || templates.en;
}

function needsClarification(input: string, _language: string) {
  if (input.trim().length < 2) return { shouldAsk: true, reason: 'too_short' };

  const greetings = ['hi', 'hello', 'hey', 'namaste', 'namaskara', 'namaskaram', 'vanakkam'];
  if (greetings.some((g) => input.toLowerCase().includes(g))) {
    return { shouldAsk: false, reason: 'greeting' };
  }

  const wordCount = input.split(' ').filter((w) => w.length > 1).length;
  if (wordCount < 2 && input.length < 6) {
    return { shouldAsk: true, reason: 'unclear' };
  }

  return { shouldAsk: false, reason: 'clear' };
}

function generateClarificationQuestion(_reason: string, _language: string, userRole: string): string {
  if (userRole === 'patient') {
    return "Could you describe your symptoms more clearly? Example: 'I have headache and fever'";
  }
  if (userRole === 'student') {
    return "I'm here to help you learn. What specific medical question do you have?";
  }
  if (userRole === 'doctor') {
    return 'What clinical information do you need?';
  }
  return 'How can I help?';
}


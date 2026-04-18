import { UserRole, ChatMessage } from './types';

const ROLE_SYSTEM_PROMPTS: Record<UserRole, string> = {
  patient: 'You are a helpful AI health assistant for patients. Provide general health information, help with understanding symptoms, remind about medications, and guide appointment booking. Always recommend consulting a real doctor for serious concerns.',
  student: 'You are an AI medical tutor for MBBS and medical students. Help with anatomy, physiology, pharmacology, pathology, microbiology, surgery, and medicine topics. Explain concepts clearly with clinical correlations. Recommend study resources.',
  doctor: 'You are an AI clinical assistant for doctors. Help with differential diagnosis suggestions, drug interactions, treatment guidelines, and clinical decision support. Always note this is for informational purposes.',
  professor: 'You are an AI teaching assistant for medical professors. Help with creating teaching materials, answering student doubts, suggesting assessment methods, and organizing curriculum content.',
};

const ROLE_GREETINGS: Record<UserRole, string> = {
  patient: "Hello! I'm your AI Health Assistant. I can help you with health questions, medicine information, understanding lab reports, and more. How can I help you today?",
  student: "Hi there! I'm your AI Medical Tutor. Ask me about any medical topic — anatomy, physiology, pharmacology, pathology, or clinical subjects. I'll explain concepts clearly with clinical correlations. What would you like to learn?",
  doctor: "Good day, Doctor. I'm your AI Clinical Assistant. I can help with differential diagnosis suggestions, drug interaction checks, treatment guidelines, and clinical decision support. How can I assist?",
  professor: "Welcome, Professor. I'm your AI Teaching Assistant. I can help create teaching materials, suggest assessment methods, answer complex medical queries, and organize resources. What do you need?",
};

// Simulated AI responses based on keywords
function generateResponse(message: string, role: UserRole): string {
  const lower = message.toLowerCase();

  if (role === 'patient') {
    if (lower.includes('headache') || lower.includes('head pain')) {
      return "Headaches can have many causes including tension, dehydration, lack of sleep, or eye strain.\n\n**Immediate relief:**\n- Rest in a quiet, dark room\n- Stay hydrated (drink water)\n- Paracetamol 500mg can help\n\n**When to see a doctor:**\n- Severe or sudden onset\n- Fever with headache\n- Vision changes\n- Persistent for more than 3 days\n\n⚠️ *This is general information. Please consult a doctor for persistent headaches.*";
    }
    if (lower.includes('fever') || lower.includes('temperature')) {
      return "Fever is your body's natural response to infection.\n\n**Home management:**\n- Rest and stay hydrated\n- Paracetamol 500mg every 6 hours\n- Light, comfortable clothing\n- Sponge bath with lukewarm water\n\n**See a doctor if:**\n- Temperature above 103°F (39.4°C)\n- Fever lasting more than 3 days\n- Difficulty breathing\n- Severe body aches\n\n💊 *You can check medicine details in the Medicine Scanner section.*";
    }
    if (lower.includes('appointment') || lower.includes('book')) {
      return "I'd be happy to help you book an appointment!\n\nYou can use the **Book Appointment** feature in your dashboard to:\n1. Select a department\n2. Choose a doctor\n3. Pick a date and time slot\n4. Get a token number (skip the queue!)\n\nWould you like guidance on which department to visit?";
    }
    if (lower.includes('medicine') || lower.includes('drug') || lower.includes('tablet')) {
      return "For medicine information, you can use the **Medicine Scanner** feature in your dashboard. Just search for any medicine name to see:\n- Usage & indications\n- Dosage instructions\n- Side effects\n- Warnings & precautions\n- Approximate price\n\nWhat medicine would you like to know about?";
    }
    if (lower.includes('report') || lower.includes('lab') || lower.includes('test')) {
      return "You can view all your lab reports in the **Lab Reports** section of your dashboard.\n\nEach report shows:\n- Test parameters with values\n- Normal ranges for comparison\n- Status indicators (Normal / High / Low)\n\nResults are color-coded for easy understanding. Any specific report you'd like help interpreting?";
    }
    return "I understand your concern. Here are some general health tips:\n\n1. **Stay hydrated** — Drink at least 8 glasses of water daily\n2. **Balanced diet** — Include fruits, vegetables, and whole grains\n3. **Regular exercise** — At least 30 minutes of moderate activity\n4. **Adequate sleep** — 7-8 hours for adults\n5. **Manage stress** — Practice relaxation techniques\n\nFor specific medical concerns, please use the **Book Appointment** feature to consult a specialist. How else can I help?";
  }

  if (role === 'student') {
    if (lower.includes('anatomy') || lower.includes('muscle') || lower.includes('bone') || lower.includes('nerve')) {
      return "Great question about anatomy! Here's a structured approach:\n\n**Key Study Tips for Anatomy:**\n1. **Origin → Insertion → Action → Nerve Supply** — Follow this pattern for every muscle\n2. **Use mnemonics** — E.g., \"Robert Taylor Drinks Cold Beer\" for brachial plexus roots\n3. **Clinical correlations** — Always link to clinical scenarios (Saturday night palsy → radial nerve)\n\n📚 Check the **Notes** section for comprehensive anatomy study materials.\n🎥 Watch video lectures for 3D visualization of structures.\n\nWhat specific topic would you like me to explain?";
    }
    if (lower.includes('pharmacology') || lower.includes('drug') || lower.includes('antibiotic')) {
      return "Pharmacology made simple! Here's my approach:\n\n**Study Framework:**\n1. **Drug Class** → Mechanism of Action → Uses → Side Effects → Contraindications\n2. **Compare within classes** — How drugs in the same class differ\n3. **Clinical scenarios** — When to use what\n\n**Key Mnemonics:**\n- Beta-blockers: \"AAAA\" — Atenolol, Acebutolol (β1 selective)\n- Aminoglycosides: \"Strep to Gentamycin to Amikacin\" (increasing spectrum)\n\n📖 Check **Notes** for complete pharmacology study materials.\n\nWhich drug class would you like to review?";
    }
    if (lower.includes('exam') || lower.includes('paper') || lower.includes('prepare')) {
      return "Here's my recommended exam preparation strategy:\n\n**4-Week Plan:**\n- **Week 1-2:** Complete syllabus revision from notes\n- **Week 3:** Previous year papers + MCQ practice\n- **Week 4:** Revision of weak areas + high-yield topics\n\n**High-Yield Tips:**\n1. Focus on tables and diagrams — examiners love them\n2. Write clinical correlations in every answer\n3. Practice diagram drawing (anatomical, physiological curves)\n4. Time management: 1.5 min per mark\n\n📝 Find previous year papers in the **Study Resources** section!\n\nWhat subject are you preparing for?";
    }
    return "I'd love to help you with your studies! Here are some resources available to you:\n\n📚 **Notes** — Comprehensive study materials by subject and year\n📝 **Previous Year Papers** — Practice with past exam questions\n🎥 **Video Lectures** — Visual learning for complex topics\n📋 **Study Planner** — Organize your preparation schedule\n\nYou can find all of these in your dashboard. Which subject would you like to focus on today?";
  }

  if (role === 'doctor') {
    if (lower.includes('diabetes') || lower.includes('blood sugar') || lower.includes('hba1c')) {
      return "**Type 2 DM Management Guidelines (Quick Reference):**\n\n**First Line:** Metformin 500mg BD → titrate to 2g/day\n\n**If HbA1c > 7.5% on Metformin:**\n- Add Sulfonylurea (Glimepiride) OR\n- Add DPP-4 inhibitor (Sitagliptin) OR\n- Add SGLT2 inhibitor (Dapagliflozin — preferred if CVD risk)\n\n**If HbA1c > 9%:** Consider insulin initiation\n\n**Monitoring:**\n- HbA1c every 3 months\n- Renal function, lipid profile annually\n- Fundoscopy annually\n\n⚠️ *Clinical decision support only. Please apply clinical judgment.*";
    }
    if (lower.includes('hypertension') || lower.includes('bp') || lower.includes('blood pressure')) {
      return "**Hypertension Management Protocol:**\n\n**Stage 1 (130-139/80-89):** Lifestyle + single drug\n**Stage 2 (≥140/90):** Combination therapy\n\n**Drug Choice by Comorbidity:**\n- Diabetes → ACE inhibitor/ARB\n- Heart failure → ACE + Beta-blocker + Diuretic\n- CKD → ACE inhibitor/ARB\n- Elderly → Amlodipine (CCB)\n\n**Target BP:**\n- General: <130/80\n- Elderly (>65): <140/90\n- Diabetes/CKD: <130/80\n\n**Follow-up:** BP check at 4 weeks after dose change\n\n⚠️ *For clinical reference only.*";
    }
    return "I'm here to assist with clinical queries. I can help with:\n\n1. **Differential diagnosis** suggestions\n2. **Drug interactions** and dosing\n3. **Treatment guidelines** (latest protocols)\n4. **Lab value interpretation**\n5. **Clinical scoring systems** (Wells, CURB-65, etc.)\n\nYou can also manage your **Appointments** and **Patient List** from the dashboard. What clinical question do you have?";
  }

  if (role === 'professor') {
    if (lower.includes('assessment') || lower.includes('exam') || lower.includes('question')) {
      return "Here are some assessment design suggestions:\n\n**MCQ Design Tips:**\n- One best answer format\n- Clinical vignette-based (not rote recall)\n- Include image-based questions\n- 4 options with plausible distractors\n\n**Short Answer Format:**\n- Case-based scenarios\n- Ask for differential diagnosis + workup\n- Include \"draw and label\" questions\n\n**OSCE Station Ideas:**\n- History taking stations\n- Clinical examination skills\n- Communication skills (breaking bad news)\n- ECG / X-ray interpretation\n\nWould you like me to help draft some sample questions?";
    }
    return "I can assist with various teaching tasks:\n\n1. **Create study materials** — Notes, summaries, question banks\n2. **Assessment design** — MCQs, OSCEs, clinical cases\n3. **Student queries** — Help answer complex medical questions\n4. **Resource organization** — Curate and share learning materials\n5. **Curriculum planning** — Topic scheduling and sequencing\n\nCheck your dashboard for **Student Queries** that need attention. How can I help today?";
  }

  return "I'm here to help! Please ask me a specific question and I'll provide detailed guidance based on your role.";
}

export function getGreeting(role: UserRole): ChatMessage {
  return {
    id: 'greeting',
    role: 'assistant',
    content: ROLE_GREETINGS[role],
    timestamp: new Date().toISOString(),
  };
}

export function getAIResponse(message: string, role: UserRole): ChatMessage {
  return {
    id: `msg-${Date.now()}`,
    role: 'assistant',
    content: generateResponse(message, role),
    timestamp: new Date().toISOString(),
  };
}

export { ROLE_SYSTEM_PROMPTS };

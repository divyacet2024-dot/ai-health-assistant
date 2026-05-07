export type AgentAction =
  | { type: "medical"; input: string }
  | { type: "booking"; input: string }
  | { type: "medicine"; input: string }
  | { type: "severity"; input: string }
  | { type: "chat"; message: string };

export function agentDecide(message: string): AgentAction {
  const msg = message.toLowerCase();

  // BOOKING — broader phrases patients actually use
  if (
    /\b(book|schedule|reserve)\s+(an\s+)?appointment\b/.test(msg) ||
    /\bappointment\b/.test(msg) ||
    /\b(visit|see)\s+(the\s+)?(doctor|physician|gp)\b/.test(msg) ||
    /\b(hospital|clinic)\s+(slot|visit|appointment)\b/.test(msg) ||
    /\bneed\s+(to\s+)?see\s+(a\s+)?doctor\b/.test(msg) ||
    /\bdoctor\s+tomorrow\b/.test(msg)
  ) {
    return { type: "booking", input: message };
  }

  // MEDICINE (after booking so “appointment for prescription refill” stays booking-first if both match weakly)
  if (
    /\b(medicine|medication|drug|tablet|pill|capsule|syrup|prescription|dosage|generic)\b/.test(msg) ||
    /\bಮದ್ದು\b/.test(msg) ||
    /\b(paracetamol|ibuprofen|antibiotic|insulin|metformin)\b/.test(msg)
  ) {
    return { type: "medicine", input: message };
  }

  // SEVERITY (symptom check)
  if (msg.includes("pain") || msg.includes("fever") || msg.includes("ಜ್ವರ") || msg.includes("ತಲೆನೋವು")) {
    return { type: "severity", input: message };
  }

  // DEFAULT CHAT
  return { type: "chat", message };
}

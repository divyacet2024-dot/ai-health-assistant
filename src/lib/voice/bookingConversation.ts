import { assignDoctor, previewAppointmentSlots } from '@/lib/booking-logic';

export type BookingFlowState =
  | { phase: 'need_symptom'; context: string }
  | { phase: 'need_confirm'; context: string };

const SYMPTOM_OR_REASON =
  /pain|ache|fever|cough|rash|injury|swelling|nausea|diabetes|thyroid|insulin|heart|chest|headache|migraine|stomach|skin|cold|flu|follow|check|review|back|knee|joint|numb|dizzy|breath|asthma|ulcer|gerd|vomit|diarrhea|visit for|because|since|symptom/i;

const TIME_OR_DAY =
  /\b(today|tomorrow|tonight|morning|evening|afternoon|next week|\d{1,2}\s*(:\d{2})?\s*(am|pm)|\d{4}-\d{2}-\d{2})\b/i;

function looksLikeMedicineOnly(text: string): boolean {
  const t = text.trim();
  if (startsBookingIntent(t)) return false;
  if (t.length > 120) return false;
  return /\b(medicine|medication|tablet|pill|dose|dosage|prescription|paracetamol|ibuprofen|mg\b|ml\b|syrup)\b/i.test(
    t
  );
}

function startsBookingIntent(text: string): boolean {
  const t = text.toLowerCase();
  if (/\b(book|schedule|reserve)\s+(an\s+)?(appointment|slot|visit)\b/i.test(t)) return true;
  if (/\bappointment\b/.test(t) && /\b(want|need|get|for|book)\b/.test(t)) return true;
  if (/\b(visit|see)\s+(the\s+)?(doctor|physician|gp)\b/i.test(t)) return true;
  if (/\b(clinic|hospital)\s+(visit|appointment)\b/i.test(t)) return true;
  if (/\bneed\s+(to\s+)?see\s+(a\s+)?doctor\b/i.test(t)) return true;
  return false;
}

type DoctorOverride = { doctorName: string; department: string };

const NAMED_DOCTORS: { re: RegExp; doctorName: string; department: string }[] = [
  { re: /priya\s*nair/i, doctorName: 'Dr. Priya Nair', department: 'Dermatology' },
  { re: /sunita\s*verma/i, doctorName: 'Dr. Sunita Verma', department: 'Neurology' },
  { re: /rajesh\s*kumar/i, doctorName: 'Dr. Rajesh Kumar', department: 'Cardiology' },
  { re: /meera\s*joshi/i, doctorName: 'Dr. Meera Joshi', department: 'Pediatrics' },
  { re: /anil\s*mehta/i, doctorName: 'Dr. Anil Mehta', department: 'General Medicine' },
];

function parseDepartmentOnly(text: string): DoctorOverride | null {
  const t = text.toLowerCase();
  const rows: [RegExp, string][] = [
    [/dermatolog|skin\s+specialist|\brash\b/i, 'Dermatology'],
    [/neurolog|migraine\s+clinic|nerve\s+doctor/i, 'Neurology'],
    [/cardiolog|heart\s+specialist/i, 'Cardiology'],
    [/orthopedic|orthopaed|bone\s+doctor|joint\s+specialist/i, 'Orthopedics'],
    [/pediatric|children'?s\s+doctor/i, 'Pediatrics'],
    [/endocrin|diabetes\s+clinic/i, 'Endocrinology'],
    [/gastro|stomach\s+specialist|digestive/i, 'Gastroenterology'],
    [/pulmon|chest\s+clinic|lung\s+specialist/i, 'Pulmonology'],
    [/general\s+medicine|physician|internist/i, 'General Medicine'],
  ];
  for (const [re, dep] of rows) {
    if (re.test(t)) return { department: dep, doctorName: assignDoctor(dep) };
  }
  return null;
}

export function parseDoctorFromContext(text: string): Partial<DoctorOverride> {
  for (const row of NAMED_DOCTORS) {
    if (row.re.test(text)) return { doctorName: row.doctorName, department: row.department };
  }
  const dep = parseDepartmentOnly(text);
  if (dep) return dep;
  return {};
}

export function hasAppointmentDetail(text: string): boolean {
  const t = text.trim();
  if (t.length >= 70) return true;
  if (SYMPTOM_OR_REASON.test(t)) return true;
  if (TIME_OR_DAY.test(t)) return true;
  if (parseDoctorFromContext(t).doctorName) return true;
  return false;
}

const CONFIRM_WORD =
  /\b(yes|yeah|yep|sure|ok|okay|confirm|go ahead|book it|please book|proceed|do it|that'?s fine|sounds good)\b/i;

const DENY = /\b(no|not that|don'?t book|wait|hold on|different|change|another)\b/i;

const ABORT_FLOW =
  /\b(cancel|never\s+mind|forget\s+it|abort|stop\s+booking|don'?t\s+want\s+(an\s+)?appointment)\b/i;

/** Hinglish + common Hindi / Kannada / Tamil / Telugu affirmatives for “confirm booking” */
export function soundsLikeAffirmative(text: string): boolean {
  const t = text.trim();
  if (!t || t.length > 72) return false;
  const lower = t.toLowerCase();

  if (/^(\s*y(es|eah|ep)?|sure|ok(ay)?)\s*[!.]?$/i.test(lower)) return true;

  if (
    /\b(haan|haa|haah|theek|thik|thike|bilkul|ji\s*haan|ji\s*ha|kar\s*do|kar\s*lo|book\s*kar|confirm\s*karo)\b/i.test(
      lower
    )
  )
    return true;

  if (/[\u0900-\u097F]/.test(t) && /(हाँ|हां|ठीक|जी|बिल्कुल)/.test(t)) return true;
  if (/[\u0C80-\u0CFF]/.test(t) && /(ಹೌದು|ಸರಿ|ಮಾಡಿ|ಆಯ್ತು)/.test(t)) return true;
  if (/[\u0B80-\u0BFF]/.test(t) && /(ஆம்|சரி|ஆமாம்)/.test(t)) return true;
  if (/[\u0C00-\u0C7F]/.test(t) && /(అవును|సరే|చేయండి)/.test(t)) return true;

  return false;
}

function trimCtx(a: string, b: string): string {
  const merged = `${a} ${b}`.trim();
  return merged.slice(0, 380);
}

function summarizeConfirm(p: ReturnType<typeof previewAppointmentSlots>, ctx: string): string {
  const snippet = ctx.length > 90 ? `${ctx.slice(0, 88)}…` : ctx;
  return (
    `I can put you in ${p.department} with ${p.doctorName} on ${p.date} at ${p.time}. ` +
    `That matches what you said: ${snippet}. ` +
    `Should I lock this in? Say yes to confirm, or tell me if you want another doctor, department, or time.`
  );
}

async function postVoiceBook(payload: {
  message: string;
  patientName?: string;
  dateHint?: string;
  timeHint?: string;
  doctorName?: string;
  department?: string;
}): Promise<{ assistantText: string; raw: unknown }> {
  const body: Record<string, unknown> = {
    message: payload.message,
    ...(payload.dateHint ? { dateHint: payload.dateHint } : {}),
    ...(payload.timeHint ? { timeHint: payload.timeHint } : {}),
    ...(payload.doctorName ? { doctorName: payload.doctorName } : {}),
    ...(payload.department ? { department: payload.department } : {}),
    ...(payload.patientName ? { patientName: payload.patientName } : {}),
  };

  const res = await fetch('/api/voice-book', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then((r) => r.json().catch(() => null));

  const assistantText =
    String(res?.data?.assistantText || '').trim() ||
    `That’s saved. Open appointments to see your queue number.`;

  return { assistantText, raw: res };
}

export type VoiceBookingAdvanceResult =
  | {
      handled: true;
      assistantText: string;
      nextState: BookingFlowState | null;
      navigatePath?: string;
      raw?: unknown;
    }
  | { handled: false };

/**
 * Multi-turn voice booking: asks for symptom / reason when vague, proposes doctor + slot, confirms, then persists.
 */
export async function advanceVoiceBooking(input: {
  userText: string;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  priorState: BookingFlowState | null;
  /** Logged-in display name (session); falls back to “Patient” server-side if omitted */
  patientName?: string;
}): Promise<VoiceBookingAdvanceResult> {
  const userText = input.userText.trim();
  if (!userText) return { handled: false };

  const { priorState } = input;
  const patientLabel = input.patientName?.trim() || undefined;

  if (ABORT_FLOW.test(userText)) {
    return {
      handled: true,
      assistantText:
        'No worries — I’ve dropped that booking. Whenever you’re ready, just say you’d like an appointment and we’ll start again.',
      nextState: null,
    };
  }

  /** Let the medicine intent handle drug questions without merging into appointment context */
  if (
    priorState &&
    looksLikeMedicineOnly(userText)
  ) {
    return { handled: false };
  }

  // --- Active multi-turn flow ---
  if (priorState?.phase === 'need_symptom') {
    const ctx = trimCtx(priorState.context, userText);
    const ov = parseDoctorFromContext(ctx);
    const preview = previewAppointmentSlots({
      userMessage: ctx,
      ...ov,
    });
    return {
      handled: true,
      assistantText: summarizeConfirm(preview, ctx),
      nextState: { phase: 'need_confirm', context: ctx },
    };
  }

  if (priorState?.phase === 'need_confirm') {
    if (/^(hi|hello|hey|thanks|thank you)\b/i.test(userText.trim()) && userText.length < 28) {
      return {
        handled: true,
        assistantText:
          'Whenever you’re ready, say yes and I’ll confirm — or say if you’d rather switch doctor, department, or time.',
        nextState: priorState,
      };
    }

    const explicitBookPhrase = /\b(confirm|book it|go ahead|please book|proceed)\b/i.test(userText);
    const pickedDoctor = Boolean(parseDoctorFromContext(userText).doctorName);
    const soundsLikeRevision =
      DENY.test(userText) ||
      TIME_OR_DAY.test(userText) ||
      pickedDoctor ||
      (SYMPTOM_OR_REASON.test(userText) && userText.trim().length > 14);

    const affirmativeOk = soundsLikeAffirmative(userText);

    const soundsLikeConfirm =
      !soundsLikeRevision &&
      (explicitBookPhrase ||
        /^(\s*y(es|eah|ep)?|sure|ok(ay)?)\s*[!.]?\s*$/i.test(userText.trim()) ||
        affirmativeOk ||
        (CONFIRM_WORD.test(userText) && userText.length < 56));

    if (soundsLikeConfirm) {
      const ctx = priorState.context;
      const ov = parseDoctorFromContext(ctx);
      const slot = previewAppointmentSlots({ userMessage: ctx, ...ov });
      const { assistantText, raw } = await postVoiceBook({
        message: ctx.slice(0, 280),
        dateHint: ctx,
        timeHint: ctx,
        doctorName: slot.doctorName,
        department: slot.department,
        patientName: patientLabel,
      });

      const booked = `${assistantText} Opening your appointments screen so you can see it in writing.`;

      return {
        handled: true,
        assistantText: booked,
        nextState: null,
        navigatePath: '/dashboard/appointments',
        raw,
      };
    }

    if (DENY.test(userText) && userText.length < 40) {
      return {
        handled: true,
        assistantText:
          'Sure. Tell me the doctor or department you want, or a day and time that works better — I’ll adjust the slot.',
        nextState: priorState,
      };
    }

    const ctx = trimCtx(priorState.context, userText);
    const ov = parseDoctorFromContext(ctx);
    const preview = previewAppointmentSlots({ userMessage: ctx, ...ov });
    return {
      handled: true,
      assistantText: summarizeConfirm(preview, ctx),
      nextState: { phase: 'need_confirm', context: ctx },
    };
  }

  // --- New booking request ---
  if (!startsBookingIntent(userText)) {
    return { handled: false };
  }

  if (!hasAppointmentDetail(userText)) {
    return {
      handled: true,
      assistantText:
        'I can get you on the schedule. In a few words, what’s this visit for — for example fever, a follow-up, a skin problem, or a check-up? You can also name a doctor or department if you already know who you need.',
      nextState: { phase: 'need_symptom', context: userText },
    };
  }

  const ctx = userText;
  const ov = parseDoctorFromContext(ctx);
  const preview = previewAppointmentSlots({ userMessage: ctx, ...ov });

  return {
    handled: true,
    assistantText: summarizeConfirm(preview, ctx),
    nextState: { phase: 'need_confirm', context: ctx },
  };
}

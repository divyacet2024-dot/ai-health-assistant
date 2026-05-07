import { MEDICINES } from '@/lib/mock-data';
import type { Medicine } from '@/lib/types';
import {
  assignDoctor,
  inferDepartment,
  previewAppointmentSlots,
  resolveAppointmentDate,
  resolveAppointmentTime,
} from '@/lib/booking-logic';
import { getCollection } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/models';

export type ToolResult = {
  success: boolean;
  data: any;
};

export {
  assignDoctor,
  inferDepartment,
  previewAppointmentSlots,
  resolveAppointmentDate,
  resolveAppointmentTime,
} from '@/lib/booking-logic';

export type BookingParams = {
  userMessage: string;
  dateHint?: string;
  timeHint?: string;
  patientName?: string;
  /** When set (e.g. user asked for a named doctor), overrides inference */
  department?: string;
  doctorName?: string;
};

/**
 * Persists one appointment when the agent confirms action "book".
 * Falls back to demo token if MongoDB is unavailable.
 */
export async function doctorBookingTool(params: BookingParams): Promise<ToolResult> {
  const reason = params.userMessage.slice(0, 280);
  const department = params.department ?? inferDepartment(params.userMessage);
  const doctorName = params.doctorName ?? assignDoctor(department);
  const hintBlob = [params.dateHint, params.timeHint, params.userMessage].filter(Boolean).join(' ');
  const date = resolveAppointmentDate(hintBlob);
  const displayTime = resolveAppointmentTime(hintBlob);

  const patientName = params.patientName?.trim() || 'Patient';

  try {
    const counterCol = await getCollection(COLLECTIONS.tokenCounters);
    const col = await getCollection(COLLECTIONS.appointments);

    const counter = await counterCol.findOneAndUpdate(
      { name: 'appointment_token' },
      { $inc: { value: 1 } },
      { upsert: true, returnDocument: 'after' }
    );

    const c = counter as unknown as { value?: number | { value?: number } };
    const inner = c?.value;
    const tokenNumber =
      typeof inner === 'number'
        ? inner
        : typeof inner === 'object' && inner != null && typeof inner.value === 'number'
          ? inner.value
          : Math.floor(Math.random() * 800) + 101;

    const doc = {
      patientName,
      doctorName,
      department,
      date,
      time: displayTime,
      reason,
      tokenNumber,
      status: 'scheduled',
      createdAt: new Date(),
      source: 'ai_agent',
    };

    await col.insertOne(doc);

    return {
      success: true,
      data: {
        tokenNumber,
        department,
        doctorName,
        date,
        time: displayTime,
        patientName,
        reason,
        persisted: true,
      },
    };
  } catch {
    const tokenNumber = Math.floor(Math.random() * 800) + 101;
    return {
      success: true,
      data: {
        tokenNumber,
        department,
        doctorName,
        date,
        time: displayTime,
        patientName,
        reason,
        persisted: false,
      },
    };
  }
}

function scoreMedicine(symptom: string, m: Medicine): number {
  const l = symptom.toLowerCase();
  const blob = `${m.name} ${m.genericName} ${m.category} ${m.usage}`.toLowerCase();
  let score = 0;
  if (/fever|febrile|temperature|ज्वರ|bukhaar/.test(l) && /paracetamol|acetaminophen|antipyretic/.test(blob))
    score += 8;
  if (/(headache|head pain|migraine|ತಲೆ)/.test(l) && /paracetamol|ibuprofen|analgesic|nsaid/.test(blob))
    score += 8;
  if (/(cough|cold|flu|congestion)/.test(l) && /cetirizine|azithromycin|antibiotic|histamine/.test(blob))
    score += 6;
  if (/(stomach|acid|gerd|reflux|ulcer)/.test(l) && /omeprazole|pantoprazole|ppi/.test(blob)) score += 8;
  if (/(diabetes|sugar|glucose)/.test(l) && /metformin/.test(blob)) score += 8;
  if (/(blood pressure|hypertension)/.test(l) && /amlodipine/.test(blob)) score += 8;
  if (/(allergy|sneeze|itch|rash)/.test(l) && /cetirizine/.test(blob)) score += 7;
  if (symptom.length > 3 && blob.includes(symptom.slice(0, 6).toLowerCase())) score += 3;
  return score;
}

function formatMedicineCard(m: Medicine): string {
  return [
    `**${m.name}** (${m.genericName})`,
    `- Category: ${m.category}`,
    `- Typical use: ${m.usage}`,
    `- General dosing info (not personal prescription): ${m.dosage}`,
    `- Price band (indicative): ${m.price}`,
    `- Side effects to know: ${m.sideEffects.slice(0, 4).join(', ')}`,
    `- Warnings: ${m.warnings.join('; ')}`,
  ].join('\n');
}

/**
 * Rich medicine context from catalog — informational only.
 */
export async function medicineLookupTool(symptom: string): Promise<ToolResult> {
  const ranked = [...MEDICINES]
    .map((m) => ({ m, s: scoreMedicine(symptom, m) }))
    .sort((a, b) => b.s - a.s);

  let picks = ranked.filter((x) => x.s >= 6).map((x) => x.m);
  if (picks.length === 0) {
    picks = ranked.slice(0, 3).map((x) => x.m);
  }
  picks = picks.slice(0, 4);

  const markdownBlock = [
    '_Information only — not a prescription. Confirm dose and suitability with a licensed clinician._',
    '',
    ...picks.map(formatMedicineCard),
  ].join('\n\n');

  const shortList = picks.map((m) => `${m.name} (${m.genericName})`);

  return {
    success: true,
    data: {
      medicines: picks,
      names: shortList,
      markdownBlock,
    },
  };
}

export async function severityTool(symptom: string): Promise<ToolResult> {
  let severity = 'low';
  const lower = symptom.toLowerCase();

  if (
    /high fever|vomiting repeatedly|chest pain|can'?t breathe|breathing difficulty|heart attack|stroke|unconscious|severe bleeding/.test(
      lower
    )
  ) {
    severity = 'high — seek urgent in-person care';
  } else if (/fever|pain|headache|ಜ್ವರ|ನೋವು/.test(lower)) {
    severity = 'moderate — monitor and consider outpatient visit';
  }

  return {
    success: true,
    data: severity,
  };
}

export async function navigationTool(path: string): Promise<ToolResult> {
  const labels: Record<string, string> = {
    '/dashboard/appointments': 'book an appointment',
    '/dashboard/medicine': 'find medicine',
    '/dashboard/emergency': 'emergency help',
  };
  const label = labels[path] || 'navigate';
  return {
    success: true,
    data: `Navigate to ${path} to ${label}.`,
  };
}

export async function clarificationTool(question: string): Promise<ToolResult> {
  return {
    success: true,
    data: question,
  };
}

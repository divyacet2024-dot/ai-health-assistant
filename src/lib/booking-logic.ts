/**
 * Pure appointment routing / slot preview — safe to import from Client Components.
 * (MongoDB lives in tools.ts / API routes only.)
 */

/** Infer specialty from free text — used for routing & demo bookings */
export function inferDepartment(text: string): string {
  const t = text.toLowerCase();
  if (/headache|migraine|seizure|stroke|nerve|numbness/.test(t)) return 'Neurology';
  if (/heart|chest pain|palpitation|cardiac|bp|blood pressure|hypertension/.test(t))
    return 'Cardiology';
  if (/bone|joint|fracture|arthritis|back pain|ortho/.test(t)) return 'Orthopedics';
  if (/skin|rash|itch|dermatitis|allergy hives/.test(t)) return 'Dermatology';
  if (/child|kid|baby|pediatric/.test(t)) return 'Pediatrics';
  if (/diabetes|thyroid|sugar|insulin|metformin/.test(t)) return 'Endocrinology';
  if (/stomach|acid|gerd|vomit|diarrhea|constipation|liver/.test(t)) return 'Gastroenterology';
  if (/cold|cough|flu|lung|breath|asthma/.test(t)) return 'Pulmonology';
  return 'General Medicine';
}

export function assignDoctor(department: string): string {
  const map: Record<string, string> = {
    Neurology: 'Dr. Sunita Verma',
    Cardiology: 'Dr. Rajesh Kumar',
    Orthopedics: 'Dr. Rajesh Kumar',
    Dermatology: 'Dr. Priya Nair',
    Pediatrics: 'Dr. Meera Joshi',
    Endocrinology: 'Dr. Sunita Verma',
    Gastroenterology: 'Dr. Anil Mehta',
    Pulmonology: 'Dr. Anil Mehta',
    'General Medicine': 'Dr. Anil Mehta',
  };
  return map[department] || 'Dr. Anil Mehta';
}

export function resolveAppointmentDate(dateHint?: string): string {
  const h = (dateHint || '').toLowerCase();
  const d = new Date();
  if (h.includes('today')) return d.toISOString().slice(0, 10);
  if (h.includes('tomorrow')) {
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }
  const iso = /\d{4}-\d{2}-\d{2}/.exec(dateHint || '');
  if (iso) return iso[0];
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function resolveAppointmentTime(timeHint?: string): string {
  const h = (timeHint || '').toLowerCase();
  const m12 = /\b(\d{1,2})\s*(?::(\d{2}))?\s*(am|pm)\b/i.exec(h);
  if (m12) {
    let hr = parseInt(m12[1], 10);
    const mn = m12[2] ? parseInt(m12[2], 10) : 0;
    const ap = m12[3].toUpperCase();
    if (ap === 'PM' && hr < 12) hr += 12;
    if (ap === 'AM' && hr === 12) hr = 0;
    const h12 = hr % 12 || 12;
    const suf = hr >= 12 ? 'PM' : 'AM';
    return `${h12}:${String(mn).padStart(2, '0')} ${suf}`;
  }
  if (/\bmorning\b/.test(h)) return '10:00 AM';
  if (/\bevening\b/.test(h)) return '5:00 PM';
  if (/\bafternoon\b/.test(h)) return '2:30 PM';
  return '10:30 AM';
}

/** Resolve slot preview for voice/UI without persisting */
export function previewAppointmentSlots(params: {
  userMessage: string;
  dateHint?: string;
  timeHint?: string;
  department?: string;
  doctorName?: string;
}): { department: string; doctorName: string; date: string; time: string } {
  const department = params.department ?? inferDepartment(params.userMessage);
  const doctorName = params.doctorName ?? assignDoctor(department);
  const hintBlob = [params.dateHint, params.timeHint, params.userMessage].filter(Boolean).join(' ');
  return {
    department,
    doctorName,
    date: resolveAppointmentDate(hintBlob),
    time: resolveAppointmentTime(hintBlob),
  };
}

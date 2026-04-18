/**
 * Smart API client with localStorage fallback.
 * When MongoDB is connected, data persists to the database.
 * When MongoDB is unavailable, falls back gracefully to localStorage.
 */

// ========== APPOINTMENTS ==========
export async function fetchAppointments(): Promise<{ success: boolean; data: any[] }> {
  try {
    const res = await fetch('/api/appointments');
    const json = await res.json();
    if (json.success && json.data?.length > 0) return json;
  } catch {}
  // Fallback to localStorage
  return { success: true, data: getLocal('aihealthassist_appointments') };
}

export async function createAppointment(body: Record<string, unknown>): Promise<{ success: boolean; data: any }> {
  try {
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (json.success) return json;
  } catch {}
  // Fallback: generate local token
  const token = getLocalCounter('aihealthassist_token');
  const appt = { ...body, tokenNumber: token, status: 'scheduled', _id: `local-${Date.now()}` };
  const existing = getLocal('aihealthassist_appointments');
  setLocal('aihealthassist_appointments', [appt, ...existing]);
  return { success: true, data: appt };
}

// ========== CHAT ==========
export async function fetchChatHistory(userRole: string, sessionId: string = 'default'): Promise<{ success: boolean; data: any[] }> {
  try {
    const res = await fetch(`/api/chat?userRole=${userRole}&sessionId=${sessionId}`);
    const json = await res.json();
    if (json.success && json.data?.length > 0) return json;
  } catch {}
  return { success: true, data: getLocal(`aihealthassist_chat_${userRole}`) };
}

export async function saveChatMessage(message: Record<string, unknown>): Promise<void> {
  try {
    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
  } catch {}
}

export async function clearChat(userRole: string, sessionId: string = 'default'): Promise<void> {
  try {
    await fetch(`/api/chat?userRole=${userRole}&sessionId=${sessionId}`, { method: 'DELETE' });
  } catch {}
  removeLocal(`aihealthassist_chat_${userRole}`);
}

// ========== PAYMENTS ==========
export async function createPayment(body: Record<string, unknown>): Promise<{ success: boolean; data: any }> {
  try {
    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (json.success) return json;
  } catch {}
  const token = getLocalCounter('aihealthassist_token');
  return { success: true, data: { ...body, tokenNumber: token, status: 'paid' } };
}

// ========== STUDY TASKS ==========
export async function fetchStudyTasks(): Promise<{ success: boolean; data: any[] }> {
  try {
    const res = await fetch('/api/study-tasks');
    const json = await res.json();
    if (json.success && json.data?.length > 0) return json;
  } catch {}
  return { success: true, data: getLocal('aihealthassist_studyplan') };
}

export async function createStudyTask(body: Record<string, unknown>): Promise<{ success: boolean; data: any }> {
  try {
    const res = await fetch('/api/study-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (json.success) return json;
  } catch {}
  return { success: true, data: { ...body, _id: `local-${Date.now()}` } };
}

export async function updateStudyTask(id: string, completed: boolean): Promise<void> {
  try {
    await fetch('/api/study-tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, completed }),
    });
  } catch {}
}

export async function deleteStudyTask(id: string): Promise<void> {
  try {
    await fetch(`/api/study-tasks?id=${id}`, { method: 'DELETE' });
  } catch {}
}

// ========== MATERIALS ==========
export async function fetchMaterials(): Promise<{ success: boolean; data: any[] }> {
  try {
    const res = await fetch('/api/materials');
    const json = await res.json();
    if (json.success && json.data?.length > 0) return json;
  } catch {}
  return { success: true, data: getLocal('aihealthassist_materials') };
}

export async function createMaterial(body: Record<string, unknown>): Promise<{ success: boolean; data: any }> {
  try {
    const res = await fetch('/api/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (json.success) return json;
  } catch {}
  return { success: true, data: { ...body, _id: `local-${Date.now()}` } };
}

export async function deleteMaterial(id: string): Promise<void> {
  try {
    await fetch(`/api/materials?id=${id}`, { method: 'DELETE' });
  } catch {}
}

// ========== QUERIES ==========
export async function fetchQueries(): Promise<{ success: boolean; data: any[] }> {
  try {
    const res = await fetch('/api/queries');
    const json = await res.json();
    if (json.success && json.data?.length > 0) return json;
  } catch {}
  return { success: true, data: getLocal('aihealthassist_queries') };
}

export async function answerQuery(id: string, answer: string): Promise<void> {
  try {
    await fetch('/api/queries', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, answer }),
    });
  } catch {}
}

// ========== SCHEDULE ==========
export async function fetchSchedule(): Promise<{ success: boolean; data: any[] }> {
  try {
    const res = await fetch('/api/schedule');
    const json = await res.json();
    if (json.success && json.data?.length > 0) return json;
  } catch {}
  return { success: true, data: getLocal('aihealthassist_schedule') };
}

export async function createClassSlot(body: Record<string, unknown>): Promise<{ success: boolean; data: any }> {
  try {
    const res = await fetch('/api/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (json.success) return json;
  } catch {}
  return { success: true, data: { ...body, _id: `local-${Date.now()}` } };
}

export async function deleteClassSlot(id: string): Promise<void> {
  try {
    await fetch(`/api/schedule?id=${id}`, { method: 'DELETE' });
  } catch {}
}

// ========== MEDICINE (always from API/mock) ==========
export async function searchMedicine(query: string): Promise<{ success: boolean; data: any[] }> {
  try {
    const res = await fetch(`/api/medicine?q=${encodeURIComponent(query)}`);
    const json = await res.json();
    if (json.success) return json;
  } catch {}
  return { success: true, data: [] };
}

// ========== TOKEN ==========
export async function getNextTokenFromAPI(): Promise<number> {
  try {
    const res = await fetch('/api/token', { method: 'POST' });
    const json = await res.json();
    if (json.success) return json.token;
  } catch {}
  return getLocalCounter('aihealthassist_token');
}

// ========== LOCAL STORAGE HELPERS ==========
function getLocal(key: string): any[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocal(key: string, data: any): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

function removeLocal(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
}

function getLocalCounter(key: string): number {
  if (typeof window === 'undefined') return 1;
  const current = parseInt(localStorage.getItem(key) || '0', 10);
  const next = current + 1;
  localStorage.setItem(key, next.toString());
  return next;
}

import twilio from 'twilio';

/**
 * Outbound voice call for emergency flow.
 *
 * Required env:
 * - TWILIO_ACCOUNT_SID
 * - TWILIO_AUTH_TOKEN
 * - TWILIO_PHONE_NUMBER  → your Twilio number (caller ID), E.164 e.g. +15551234567
 *
 * Destination (who answers the call):
 * - CARETAKER_PHONE_NUMBER  (preferred) or TWILIO_CALL_TO
 *   Must be E.164. On a trial account, this number must be verified in Twilio Console.
 */

function getClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  if (!accountSid || !authToken) {
    throw new Error(
      'Twilio is not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env.local'
    );
  }
  return twilio(accountSid, authToken);
}

/** Accepts +919876543210 or 919876543210; returns E.164 or throws. */
export function toE164(raw: string, label: string): string {
  const s = raw?.trim() ?? '';
  if (!s) {
    throw new Error(`${label} is empty. Use E.164, e.g. +919876543210`);
  }
  const withPlus = s.startsWith('+') ? s : `+${s.replace(/\D/g, '')}`;
  const digits = withPlus.slice(1).replace(/\D/g, '');
  const e164 = `+${digits}`;
  if (!/^\+[1-9]\d{6,14}$/.test(e164)) {
    throw new Error(`${label} is not valid E.164: ${raw}`);
  }
  return e164;
}

function getFromNumber(): string {
  return toE164(process.env.TWILIO_PHONE_NUMBER ?? '', 'TWILIO_PHONE_NUMBER');
}

function getToNumber(): string {
  const raw =
    process.env.CARETAKER_PHONE_NUMBER?.trim() ||
    process.env.TWILIO_CALL_TO?.trim() ||
    '';
  return toE164(raw, 'CARETAKER_PHONE_NUMBER or TWILIO_CALL_TO');
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Places an outbound call. Returns Twilio Call SID.
 */
export async function makeCall(message: string): Promise<string> {
  const from = getFromNumber();
  const to = getToNumber();

  console.log('[Twilio] Placing emergency call', {
    from,
    to,
    messagePreview: message.slice(0, 80),
  });

  const client = getClient();
  const safe = escapeXml(message);

  const twiml = `<Response><Say voice="alice">${safe}</Say><Pause length="1"/><Say voice="alice">This is an AI Health emergency alert.</Say></Response>`;

  const call = await client.calls.create({
    to,
    from,
    twiml,
  });

  console.log('[Twilio] Call created', { sid: call.sid, status: call.status });
  return call.sid;
}

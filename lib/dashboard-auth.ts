export const DASHBOARD_SESSION_COOKIE = "stornway_dashboard_session";
export const DASHBOARD_SESSION_MAX_AGE = 60 * 60 * 24 * 7;

const encoder = new TextEncoder();

function getDashboardSecret(): string | null {
  return (
    process.env.DASHBOARD_SESSION_SECRET?.trim() ||
    process.env.DASHBOARD_PASSWORD?.trim() ||
    null
  );
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function stringsMatch(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

async function sign(message: string): Promise<string | null> {
  const secret = getDashboardSecret();
  if (!secret) return null;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return toBase64Url(new Uint8Array(signature));
}

export function isDashboardPasswordConfigured(): boolean {
  return Boolean(process.env.DASHBOARD_PASSWORD?.trim());
}

export function isDashboardPasswordValid(password: string): boolean {
  const configuredPassword = process.env.DASHBOARD_PASSWORD?.trim();
  if (!configuredPassword) return false;

  return stringsMatch(password, configuredPassword);
}

export async function createDashboardSessionValue(): Promise<string | null> {
  const issuedAt = Math.floor(Date.now() / 1000).toString();
  const signature = await sign(issuedAt);
  if (!signature) return null;

  return `${issuedAt}.${signature}`;
}

export async function verifyDashboardSession(value?: string): Promise<boolean> {
  if (!value) return false;

  const [issuedAt, signature] = value.split(".");
  const issuedAtSeconds = Number(issuedAt);

  if (!issuedAt || !signature || !Number.isFinite(issuedAtSeconds)) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  if (issuedAtSeconds > now || now - issuedAtSeconds > DASHBOARD_SESSION_MAX_AGE) {
    return false;
  }

  const expectedSignature = await sign(issuedAt);
  return expectedSignature ? stringsMatch(signature, expectedSignature) : false;
}

export const DASHBOARD_SESSION_COOKIE = "stornway_dashboard_session";
export const DASHBOARD_SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export const DASHBOARD_ROLES = ["ADMIN", "SALESPERSON", "TECHNICIAN"] as const;
export type DashboardRole = (typeof DASHBOARD_ROLES)[number];

const ROLE_PASSWORD_ENV: Record<DashboardRole, string> = {
  ADMIN: "DASHBOARD_ADMIN_PASSWORD",
  SALESPERSON: "DASHBOARD_SALESPERSON_PASSWORD",
  TECHNICIAN: "DASHBOARD_TECHNICIAN_PASSWORD",
};

export const DASHBOARD_ROLE_LABELS: Record<DashboardRole, string> = {
  ADMIN: "Admin",
  SALESPERSON: "Salesperson",
  TECHNICIAN: "Technician",
};

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

function getRolePassword(role: DashboardRole): string | null {
  const value = process.env[ROLE_PASSWORD_ENV[role]]?.trim();
  if (value) return value;

  if (role === "ADMIN") {
    return process.env.DASHBOARD_PASSWORD?.trim() || null;
  }

  return null;
}

function isDashboardRole(value: string): value is DashboardRole {
  return DASHBOARD_ROLES.includes(value as DashboardRole);
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
  return DASHBOARD_ROLES.some((role) => Boolean(getRolePassword(role)));
}

export function getDashboardRoleForPassword(password: string): DashboardRole | null {
  for (const role of DASHBOARD_ROLES) {
    const configuredPassword = getRolePassword(role);
    if (configuredPassword && stringsMatch(password, configuredPassword)) {
      return role;
    }
  }

  return null;
}

export async function createDashboardSessionValue(role: DashboardRole): Promise<string | null> {
  const issuedAt = Math.floor(Date.now() / 1000).toString();
  const message = `${issuedAt}.${role}`;
  const signature = await sign(message);
  if (!signature) return null;

  return `${message}.${signature}`;
}

export async function verifyDashboardSession(value?: string): Promise<DashboardRole | null> {
  if (!value) return null;

  const parts = value.split(".");
  const issuedAt = parts[0];
  const role = parts[1];
  const signature = parts[2];
  const issuedAtSeconds = Number(issuedAt);

  if (
    !issuedAt ||
    !role ||
    !signature ||
    !Number.isFinite(issuedAtSeconds) ||
    !isDashboardRole(role)
  ) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (issuedAtSeconds > now || now - issuedAtSeconds > DASHBOARD_SESSION_MAX_AGE) {
    return null;
  }

  const expectedSignature = await sign(`${issuedAt}.${role}`);
  return expectedSignature && stringsMatch(signature, expectedSignature) ? role : null;
}

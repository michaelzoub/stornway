import nodemailer from "nodemailer";
import type { ContactServiceId } from "@/lib/contact-services";

export interface ContactEmailPayload {
  name: string;
  email: string;
  phone: string;
  services: ContactServiceId[];
  message: string;
  language: string;
}

const DEFAULT_TO = "info@stornway.com";

const SERVICE_LABELS: Record<ContactServiceId, string> = {
  landscaping: "Landscaping",
  "pressure-washing": "Pressure washing",
  "window-washing": "Window washing",
  general: "General inquiry",
};

function getToEmail(): string {
  return process.env.CONTACT_TO_EMAIL?.trim() || DEFAULT_TO;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatServices(services: ContactServiceId[]): string {
  if (services.length === 0) return "—";
  return services.map((id) => SERVICE_LABELS[id] ?? id).join(", ");
}

function buildHtml(payload: ContactEmailPayload): string {
  const services = formatServices(payload.services);

  return `
    <h2>New quote request</h2>
    <p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(payload.phone || "—")}</p>
    <p><strong>Services:</strong> ${escapeHtml(services)}</p>
    <p><strong>Language:</strong> ${escapeHtml(payload.language)}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(payload.message).replace(/\n/g, "<br>")}</p>
  `;
}

function buildSubject(payload: ContactEmailPayload): string {
  return `Quote request — ${payload.name}`;
}

async function sendViaResend(payload: ContactEmailPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return false;

  const from =
    process.env.CONTACT_FROM_EMAIL?.trim() ??
    "Stornway Group <onboarding@resend.dev>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [getToEmail()],
      reply_to: payload.email,
      subject: buildSubject(payload),
      html: buildHtml(payload),
    }),
  });

  return response.ok;
}

async function sendViaSmtp(payload: ContactEmailPayload): Promise<boolean> {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!host || !user || !pass) return false;

  const port = Number(process.env.SMTP_PORT?.trim() || "587");
  const secure = process.env.SMTP_SECURE?.trim() === "true";

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM?.trim() || user,
    to: getToEmail(),
    replyTo: payload.email,
    subject: buildSubject(payload),
    html: buildHtml(payload),
  });

  return true;
}

async function sendViaFormSubmit(payload: ContactEmailPayload): Promise<boolean> {
  const to = getToEmail();
  const services = formatServices(payload.services);

  const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      _subject: buildSubject(payload),
      _template: "table",
      _captcha: "false",
      name: payload.name,
      email: payload.email,
      phone: payload.phone || "—",
      services,
      message: payload.message,
      language: payload.language,
    }),
  });

  if (!response.ok) return false;

  try {
    const data = (await response.json()) as { success?: string };
    return data.success === "true" || response.ok;
  } catch {
    return response.ok;
  }
}

export async function sendContactEmail(
  payload: ContactEmailPayload,
): Promise<boolean> {
  if (await sendViaResend(payload)) return true;
  if (await sendViaSmtp(payload)) return true;
  if (await sendViaFormSubmit(payload)) return true;
  return false;
}

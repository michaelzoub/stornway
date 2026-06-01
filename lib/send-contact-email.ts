import nodemailer from "nodemailer";
import { Resend } from "resend";
import type { ContactServiceId } from "@/lib/contact-services";
import { CONTACT_EMAIL } from "@/lib/contact-config";

export interface ContactEmailPayload {
  name: string;
  email: string;
  phone: string;
  services: ContactServiceId[];
  message: string;
  language: string;
}

const SERVICE_LABELS: Record<ContactServiceId, string> = {
  landscaping: "Landscaping",
  "pressure-washing": "Pressure washing",
  "window-washing": "Window washing",
  general: "General inquiry",
};

function getToEmail(): string {
  return process.env.CONTACT_TO_EMAIL?.trim() || CONTACT_EMAIL;
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

  const resend = new Resend(apiKey);
  const from =
    process.env.CONTACT_FROM_EMAIL?.trim() ??
    "Stornway Group <onboarding@resend.dev>";

  try {
    const { error } = await resend.emails.send({
      from,
      to: [getToEmail()],
      replyTo: payload.email,
      subject: buildSubject(payload),
      html: buildHtml(payload),
    });

    if (error) {
      console.error("[contact] Resend failed:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[contact] Resend threw:", error);
    return false;
  }
}

async function sendViaSmtp(payload: ContactEmailPayload): Promise<boolean> {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!host || !user || !pass) return false;

  const port = Number(process.env.SMTP_PORT?.trim() || "587");
  const secure = process.env.SMTP_SECURE?.trim() === "true";

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 10_000,
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM?.trim() || user,
      to: getToEmail(),
      replyTo: payload.email,
      subject: buildSubject(payload),
      html: buildHtml(payload),
    });

    return true;
  } catch (error) {
    console.error("[contact] SMTP failed:", error);
    return false;
  }
}

export async function sendContactEmail(
  payload: ContactEmailPayload,
): Promise<boolean> {
  if (await sendViaResend(payload)) return true;
  if (await sendViaSmtp(payload)) return true;
  return false;
}

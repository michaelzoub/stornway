import { NextResponse } from "next/server";
import { normalizeContactServices } from "@/lib/contact-services";
import { sendContactEmail } from "@/lib/send-contact-email";

interface ContactPayload {
  name?: string;
  email?: string;
  phone?: string;
  services?: unknown;
  message?: string;
  language?: string;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactPayload;

    const name = body.name?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    const phone = body.phone?.trim() ?? "";
    const message = body.message?.trim() ?? "";
    const language = body.language === "fr" ? "fr" : "en";
    const services = normalizeContactServices(body.services);

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }

    const payload = {
      name,
      email,
      phone,
      services,
      message,
      language,
    };

    const emailed = await sendContactEmail(payload);

    if (!emailed) {
      console.error("[contact] Failed to deliver email:", payload);
      return NextResponse.json(
        { error: "Failed to send message. Please call us directly." },
        { status: 503 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[contact] Error:", error);
    return NextResponse.json(
      { error: "Failed to submit contact form." },
      { status: 500 },
    );
  }
}

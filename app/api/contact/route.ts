import { NextResponse } from "next/server";
import { normalizeContactServices } from "@/lib/contact-services";
import {
  createQuoteRequest,
  markQuoteRequestEmailSent,
  QuoteRequestsError,
} from "@/lib/quote-requests";
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

    const quoteRequest = await createQuoteRequest(payload);
    let emailed = false;

    try {
      emailed = await sendContactEmail(payload);
    } catch (emailError) {
      console.warn("[contact] Saved request but email threw:", emailError);
    }

    if (emailed) await markQuoteRequestEmailSent(quoteRequest.id);
    if (!emailed) console.warn("[contact] Saved request but email failed.");

    return NextResponse.json({ ok: true, emailSent: emailed });
  } catch (error) {
    console.error("[contact] Error:", error);
    if (error instanceof QuoteRequestsError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { error: "Failed to submit contact form." },
      { status: 500 },
    );
  }
}

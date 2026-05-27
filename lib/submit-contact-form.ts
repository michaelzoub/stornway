import type { ContactServiceId } from "@/lib/contact-services";
export interface ContactFormPayload {
  name: string;
  email: string;
  phone: string;
  services: ContactServiceId[];
  message: string;
  language: string;
}

async function submitViaApi(payload: ContactFormPayload): Promise<boolean> {
  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return response.ok;
  } catch {
    return false;
  }
}

export async function submitContactForm(
  payload: ContactFormPayload,
): Promise<boolean> {
  return submitViaApi(payload);
}

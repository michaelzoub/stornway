"use client";

import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { FormEvent, useEffect, useId, useRef, useState } from "react";
import type { ContactServiceId } from "@/lib/contact-services";
import { useLanguage } from "@/lib/i18n/language-provider";
import type { Translations } from "@/lib/i18n/types";

const PHONE_DISPLAY = "514-758-6241";
const PHONE_TEL = "tel:+15147586241";
const EMAIL = "info@stornway.com";

interface FormState {
  name: string;
  email: string;
  phone: string;
  service: ContactServiceId | "";
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

const initialForm: FormState = {
  name: "",
  email: "",
  phone: "",
  service: "",
  message: "",
};

const SERVICE_OPTIONS: {
  id: ContactServiceId;
  labelKey:
    | "serviceLandscaping"
    | "servicePressureWashing"
    | "serviceWindowWashing"
    | "serviceGeneral";
}[] = [
  { id: "landscaping", labelKey: "serviceLandscaping" },
  { id: "pressure-washing", labelKey: "servicePressureWashing" },
  { id: "window-washing", labelKey: "serviceWindowWashing" },
  { id: "general", labelKey: "serviceGeneral" },
];

function ContactServiceSelect({
  value,
  onChange,
  label,
  placeholder,
  t,
}: {
  value: ContactServiceId | "";
  onChange: (value: ContactServiceId | "") => void;
  label: string;
  placeholder: string;
  t: Translations["contact"];
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = SERVICE_OPTIONS.find((option) => option.id === value);
  const selectedLabel = selectedOption ? t[selectedOption.labelKey] : placeholder;

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  function selectOption(next: ContactServiceId | "") {
    onChange(next);
    setIsOpen(false);
  }

  return (
    <div
      ref={rootRef}
      className={`contact-field contact-select${isOpen ? " is-open" : ""}`}
    >
      <label id={`${listId}-label`}>{label}</label>
      <button
        type="button"
        className="contact-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={`${listId}-label`}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className={value ? "" : "contact-select-placeholder"}>
          {selectedLabel}
        </span>
        <ChevronDown size={18} aria-hidden="true" />
      </button>

      {isOpen && (
        <ul
          id={listId}
          className="contact-select-menu"
          role="listbox"
          aria-label={label}
        >
          <li role="presentation">
            <button
              type="button"
              role="option"
              aria-selected={value === ""}
              className={`contact-select-option${value === "" ? " is-selected" : ""}`}
              onClick={() => selectOption("")}
            >
              {placeholder}
            </button>
          </li>
          {SERVICE_OPTIONS.map(({ id, labelKey }) => (
            <li key={id} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={value === id}
                className={`contact-select-option${value === id ? " is-selected" : ""}`}
                onClick={() => selectOption(id)}
              >
                {t[labelKey]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ContactSection() {
  const { language, t } = useLanguage();
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function validate(): FormErrors {
    const next: FormErrors = {};

    if (!form.name.trim()) next.name = t.contact.required;
    if (!form.email.trim()) {
      next.email = t.contact.required;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = t.contact.invalidEmail;
    }
    if (!form.message.trim()) next.message = t.contact.required;

    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          services: form.service ? [form.service] : [],
          message: form.message.trim(),
          language,
        }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      setIsSuccess(true);
      setForm(initialForm);
      setErrors({});
    } catch {
      setSubmitError(t.contact.errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors((current) => ({ ...current, [key]: undefined }));
    }
  }

  return (
    <section className="contact" id="contact" aria-labelledby="contact-title">
      <div className="contact-media" aria-hidden="true">
        <Image
          src="/HQ.png"
          alt=""
          fill
          sizes="100vw"
          className="contact-media-image"
        />
        <div className="contact-media-blur" />
      </div>

      <div className="contact-inner page-shell--content">
        <div className="contact-glass">
          <h2 id="contact-title">{t.contact.title}</h2>
          <p className="contact-lede">{t.contact.lede}</p>
          <p className="contact-quick">
            <a href={PHONE_TEL}>{PHONE_DISPLAY}</a>
            <span aria-hidden="true"> · </span>
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </p>

          {isSuccess ? (
            <div className="contact-success" role="status">
              <p>{t.contact.successMessage}</p>
              <button
                type="button"
                className="contact-submit"
                onClick={() => setIsSuccess(false)}
              >
                {t.contact.sendAnother}
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <div className="contact-form-row">
                <div className="contact-field">
                  <label htmlFor="contact-name">{t.contact.nameLabel}</label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder={t.contact.namePlaceholder}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={
                      errors.name ? "contact-name-error" : undefined
                    }
                  />
                  {errors.name && (
                    <p id="contact-name-error" className="contact-field-error">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="contact-field">
                  <label htmlFor="contact-email">{t.contact.emailFieldLabel}</label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder={t.contact.emailPlaceholder}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={
                      errors.email ? "contact-email-error" : undefined
                    }
                  />
                  {errors.email && (
                    <p id="contact-email-error" className="contact-field-error">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="contact-form-row">
                <div className="contact-field">
                  <label htmlFor="contact-phone">{t.contact.phoneFieldLabel}</label>
                  <input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder={t.contact.phonePlaceholder}
                  />
                </div>

                <ContactServiceSelect
                  label={t.contact.servicesLabel}
                  placeholder={t.contact.servicePlaceholder}
                  value={form.service}
                  onChange={(service) => updateField("service", service)}
                  t={t.contact}
                />
              </div>

              <div className="contact-field">
                <label htmlFor="contact-message">{t.contact.messageLabel}</label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={3}
                  value={form.message}
                  onChange={(e) => updateField("message", e.target.value)}
                  placeholder={t.contact.messagePlaceholder}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={
                    errors.message ? "contact-message-error" : undefined
                  }
                />
                {errors.message && (
                  <p id="contact-message-error" className="contact-field-error">
                    {errors.message}
                  </p>
                )}
              </div>

              {submitError && (
                <p className="contact-form-error" role="alert">
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                className="contact-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? t.contact.sending : t.contact.submit}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

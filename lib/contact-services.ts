export const CONTACT_SERVICE_IDS = [
  "landscaping",
  "pressure-washing",
  "window-washing",
  "general",
] as const;

export type ContactServiceId = (typeof CONTACT_SERVICE_IDS)[number];

export function isContactServiceId(value: string): value is ContactServiceId {
  return (CONTACT_SERVICE_IDS as readonly string[]).includes(value);
}

export function normalizeContactServices(
  services: unknown,
): ContactServiceId[] {
  if (!Array.isArray(services)) return [];

  const unique = new Set<ContactServiceId>();
  for (const item of services) {
    if (typeof item === "string" && isContactServiceId(item.trim())) {
      unique.add(item.trim() as ContactServiceId);
    }
  }

  return [...unique];
}

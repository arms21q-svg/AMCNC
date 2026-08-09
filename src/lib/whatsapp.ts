const DEFAULT_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "9647700000000";

export function digitsOnly(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function buildWhatsAppUrl(
  phone = DEFAULT_PHONE,
  message = "Hello AM CNC WOOD DESIGN"
): string {
  const digits = digitsOnly(phone);
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function getDefaultWhatsAppMessage(locale: string): string {
  return locale === "ar"
    ? "مرحباً AM CNC WOOD DESIGN، أود الاستفسار عن خدماتكم"
    : "Hello AM CNC WOOD DESIGN, I would like to inquire about your services";
}

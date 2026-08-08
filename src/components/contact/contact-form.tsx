"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";
import { Mail, Phone, MapPin, Clock, MessageCircle } from "lucide-react";
import { useSiteData } from "@/components/layout/site-data-context";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactForm() {
  const t = useTranslations("contact");
  const locale = useLocale();
  const { contact } = useSiteData();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormValues) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed");
      toast.success(t("success"));
      reset();
    } catch {
      toast.error(t("error"));
    } finally {
      setSubmitting(false);
    }
  };

  const openWhatsApp = () => {
    const values = getValues();
    const name = values.name?.trim();
    const message = values.message?.trim();
    const subject = values.subject?.trim();

    const lines =
      locale === "ar"
        ? [
            "مرحباً AM CNC WOOD DESIGN",
            name ? `الاسم: ${name}` : "",
            subject ? `الموضوع: ${subject}` : "",
            message ? `الرسالة: ${message}` : "أود الاستفسار عن خدماتكم",
          ].filter(Boolean)
        : [
            "Hello AM CNC WOOD DESIGN",
            name ? `Name: ${name}` : "",
            subject ? `Subject: ${subject}` : "",
            message ? `Message: ${message}` : "I would like to inquire about your services",
          ].filter(Boolean);

    const url = buildWhatsAppUrl(contact.whatsapp, lines.join("\n"));
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <Label htmlFor="name">{t("name")}</Label>
          <Input id="name" {...register("name")} className="mt-1.5" />
          {errors.name && <p className="mt-1 text-xs text-destructive">{t("name")}</p>}
        </div>
        <div>
          <Label htmlFor="email">{t("email")}</Label>
          <Input id="email" type="email" {...register("email")} className="mt-1.5" />
          {errors.email && <p className="mt-1 text-xs text-destructive">{t("email")}</p>}
        </div>
        <div>
          <Label htmlFor="phone">{t("phone")}</Label>
          <Input id="phone" {...register("phone")} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="subject">{t("subject")}</Label>
          <Input id="subject" {...register("subject")} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="message">{t("message")}</Label>
          <Textarea id="message" {...register("message")} className="mt-1.5" />
          {errors.message && <p className="mt-1 text-xs text-destructive">{t("message")}</p>}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
            {submitting ? t("sending") : t("send")}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 sm:w-auto"
            onClick={openWhatsApp}
          >
            <MessageCircle className="h-4 w-4" />
            {t("whatsapp")}
          </Button>
        </div>
      </form>

      <div className="space-y-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="mb-1 font-semibold">{t("address")}</h3>
            <p className="text-sm text-muted">
              {locale === "ar" ? contact.addressAr : contact.addressEn}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Phone className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="mb-1 font-semibold">{t("phone")}</h3>
            {contact.phone ? (
              <a href={`tel:+${contact.phone.replace(/\D/g, "")}`} className="text-sm text-muted hover:text-primary" dir="ltr">
                +{contact.phone.replace(/\D/g, "")}
              </a>
            ) : null}
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="mb-1 font-semibold">{t("email")}</h3>
            {contact.email ? (
              <a href={`mailto:${contact.email}`} className="text-sm text-muted hover:text-primary">
                {contact.email}
              </a>
            ) : null}
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="mb-1 font-semibold">{t("workingHours")}</h3>
            <p className="text-sm text-muted">{t("workingHoursValue")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

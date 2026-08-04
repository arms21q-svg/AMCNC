"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10),
});

type ContactForm = z.infer<typeof contactSchema>;

export function ContactForm() {
  const t = useTranslations("contact");
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactForm) => {
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <Label htmlFor="name">{t("name")}</Label>
          <Input id="name" {...register("name")} className="mt-1.5" />
          {errors.name && <p className="text-destructive text-xs mt-1">{t("name")}</p>}
        </div>
        <div>
          <Label htmlFor="email">{t("email")}</Label>
          <Input id="email" type="email" {...register("email")} className="mt-1.5" />
          {errors.email && <p className="text-destructive text-xs mt-1">{t("email")}</p>}
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
          {errors.message && <p className="text-destructive text-xs mt-1">{t("message")}</p>}
        </div>
        <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
          {submitting ? t("sending") : t("send")}
        </Button>
      </form>

      <div className="space-y-8">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">{t("address")}</h3>
            <p className="text-muted text-sm">Riyadh, Saudi Arabia</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Phone className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">{t("phone")}</h3>
            <a href="tel:+966500000000" className="text-muted text-sm hover:text-primary">
              +966 50 000 0000
            </a>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">{t("email")}</h3>
            <a href="mailto:info@amcncwood.com" className="text-muted text-sm hover:text-primary">
              info@amcncwood.com
            </a>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">{t("workingHours")}</h3>
            <p className="text-muted text-sm">Sun - Thu: 8:00 AM - 6:00 PM</p>
          </div>
        </div>
      </div>
    </div>
  );
}

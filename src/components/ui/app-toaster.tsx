"use client";

import { Toaster } from "sonner";

interface AppToasterProps {
  locale: string;
}

export function AppToaster({ locale }: AppToasterProps) {
  return (
    <Toaster
      theme="dark"
      dir={locale === "ar" ? "rtl" : "ltr"}
      position={locale === "ar" ? "top-left" : "top-right"}
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        classNames: {
          toast:
            "group !bg-[#111] !text-white !border !border-white/10 !shadow-xl !backdrop-blur-md",
          title: "!text-white",
          description: "!text-white/70",
          actionButton: "!bg-brand-green !text-black",
          cancelButton: "!bg-white/10 !text-white",
          closeButton:
            "!bg-[#1a1a1a] !border-white/10 !text-white hover:!bg-white/10",
          success: "!border-brand-green/30",
          error: "!border-red-500/30",
        },
      }}
    />
  );
}

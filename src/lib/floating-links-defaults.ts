export interface FloatingLinkItem {
  id: string;
  labelAr: string;
  labelEn: string;
  url: string;
  icon: string;
  color: string;
  order: number;
  active: boolean;
  openInNewTab: boolean;
}

const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "966500000000";

export function getDefaultFloatingLinks(): FloatingLinkItem[] {
  return [
    {
      id: "default-whatsapp",
      labelAr: "واتساب",
      labelEn: "WhatsApp",
      url: `https://wa.me/${phone}?text=${encodeURIComponent("Hello AM CNC WOOD DESIGN")}`,
      icon: "whatsapp",
      color: "whatsapp",
      order: 1,
      active: true,
      openInNewTab: true,
    },
    {
      id: "default-phone",
      labelAr: "اتصل بنا",
      labelEn: "Call Us",
      url: `tel:+${phone}`,
      icon: "phone",
      color: "gold",
      order: 2,
      active: true,
      openInNewTab: false,
    },
    {
      id: "default-contact",
      labelAr: "نموذج التواصل",
      labelEn: "Contact Form",
      url: "/contact",
      icon: "mail",
      color: "green",
      order: 4,
      active: true,
      openInNewTab: false,
    },
    {
      id: "default-location",
      labelAr: "الموقع",
      labelEn: "Location",
      url: "https://www.google.com/maps/search/?api=1&query=Baghdad+Iraq",
      icon: "map-pin",
      color: "blue",
      order: 3,
      active: true,
      openInNewTab: true,
    },
  ];
}

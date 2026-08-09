"use client";

import { createContext, useContext } from "react";

export type SiteContactInfo = {
  phone: string;
  whatsapp: string;
  email: string;
  addressAr: string;
  addressEn: string;
  mapsUrl: string;
};

export type SiteSocialLink = {
  id: string;
  platform: string;
  url: string;
  icon: string | null;
  order: number;
  active: boolean;
};

const defaultContact: SiteContactInfo = {
  phone: "+9647700000000",
  whatsapp: "9647700000000",
  email: "info@amcncwood.com",
  addressAr: "بغداد، العراق",
  addressEn: "Baghdad, Iraq",
  mapsUrl: "",
};

const SiteDataContext = createContext<{
  contact: SiteContactInfo;
  socialLinks: SiteSocialLink[];
}>({
  contact: defaultContact,
  socialLinks: [],
});

export function SiteDataProvider({
  contact,
  socialLinks,
  children,
}: {
  contact: SiteContactInfo;
  socialLinks: SiteSocialLink[];
  children: React.ReactNode;
}) {
  return (
    <SiteDataContext.Provider value={{ contact, socialLinks }}>
      {children}
    </SiteDataContext.Provider>
  );
}

export function useSiteData() {
  return useContext(SiteDataContext);
}

import {
  MessageCircle,
  Phone,
  Mail,
  Share2,
  Globe,
  Video,
  Send,
  MapPin,
  Link2,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";

export const FLOATING_ICONS: Record<string, LucideIcon> = {
  whatsapp: MessageCircle,
  phone: Phone,
  mail: Mail,
  message: MessageCircle,
  instagram: Share2,
  facebook: Globe,
  youtube: Video,
  telegram: Send,
  "map-pin": MapPin,
  link: Link2,
  external: ExternalLink,
};

export const FLOATING_COLORS: Record<string, string> = {
  green: "bg-brand-green text-black hover:bg-brand-green-light",
  gold: "bg-brand-gold text-black hover:brightness-110",
  whatsapp: "bg-[#25D366] text-white hover:bg-[#20BD5A]",
  blue: "bg-blue-500 text-white hover:bg-blue-400",
  purple: "bg-purple-500 text-white hover:bg-purple-400",
  red: "bg-red-500 text-white hover:bg-red-400",
  dark: "bg-[#1a1a1a] text-white border border-white/10 hover:bg-[#222]",
};

export const ICON_OPTIONS = Object.keys(FLOATING_ICONS);
export const COLOR_OPTIONS = Object.keys(FLOATING_COLORS);

export function getFloatingIcon(name: string): LucideIcon {
  return FLOATING_ICONS[name] || Link2;
}

export function getFloatingColorClass(color: string): string {
  return FLOATING_COLORS[color] || FLOATING_COLORS.green;
}

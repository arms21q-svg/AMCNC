import type { MetadataRoute } from "next";
import { BRAND_NAME } from "@/lib/brand";
import { getSiteUrl } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  const siteUrl = getSiteUrl();

  return {
    name: BRAND_NAME,
    short_name: "AM CNC",
    description:
      "Luxury CNC wood design and carving — تصميم ونحت خشبي فاخر بتقنية CNC",
    start_url: "/ar",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#84cc16",
    lang: "ar",
    icons: [
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    scope: siteUrl,
  };
}

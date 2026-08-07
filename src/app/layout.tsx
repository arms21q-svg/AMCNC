import { Cairo, Montserrat } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  preload: false,
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const locale = headersList.get("x-next-locale") || "ar";
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      className="dark"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body className={`${cairo.variable} ${montserrat.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

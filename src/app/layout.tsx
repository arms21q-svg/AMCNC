import { Cairo, Montserrat } from "next/font/google";
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
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

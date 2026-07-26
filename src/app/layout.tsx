import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "میتونی‌تو | Mitoonito",
  description:
    "پلنر شخصی فارسی — برنامه‌ریزی روزانه، اهداف، عادت‌ها و داشبورد پیشرفت ماهانه",
  applicationName: "Mitoonito",
  icons: {
    icon: "/brand/fav.svg",
    apple: "/brand/fav.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#50B848",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-brand-white text-brand-charcoal antialiased">
        {children}
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#50B848",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // جلوگیری از زوم ناخواسته برای حس اپلیکیشن بومی
};

export const metadata: Metadata = {
  title: "میتونی‌تو | Mitoonito",
  description: "پلنر شخصی فارسی — برنامه‌ریزی روزانه، اهداف، عادت‌ها و داشبورد پیشرفت ماهانه",
  applicationName: "Mitoonito",
  manifest: "/manifest.json", // اضافه شدن مانیفست برای PWA
  icons: {
    icon: "/brand/fav.svg",
    apple: "/brand/fav.svg",
  },
  // تنظیمات اختصاصی برای نمایش عالی در آیفون (Safari)
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mitoonito",
  },
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
        {/* این متا تگ برای حذف نوار ابزار مرورگر در آیفون حیاتی است */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-screen bg-brand-white text-brand-charcoal antialiased selection:bg-[#9FD18B]/30">
        <main className="pb-safe"> {/* کلاس کمکی برای فاصله از پایین گوشی */}
          {children}
        </main>
      </body>
    </html>
  );
}

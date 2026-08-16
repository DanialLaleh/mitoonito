import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "میتونی‌تو",
  description: "پلتفرم مدیریت زندگی، اهداف و عادت‌ها",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className="antialiased bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}

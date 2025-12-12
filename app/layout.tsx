import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const vazirmatn = localFont({
  src: [
    {
      path: "../node_modules/vazirmatn/misc/UI/fonts/webfonts/Vazirmatn-UI-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../node_modules/vazirmatn/misc/UI/fonts/webfonts/Vazirmatn-UI-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../node_modules/vazirmatn/misc/UI/fonts/webfonts/Vazirmatn-UI-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../node_modules/vazirmatn/misc/UI/fonts/webfonts/Vazirmatn-UI-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-vazirmatn",
});

export const metadata: Metadata = {
  title: "ارزیاب هوشمند ایده‌های استارتاپی",
  description: "ارزیابی صادقانه ایده‌های استارتاپ با تمرکز بر بازار ایران",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body
        className={`${vazirmatn.variable} font-sans antialiased`}
        style={{ fontFamily: 'var(--font-vazirmatn)' }}
      >
        {children}
      </body>
    </html>
  );
}

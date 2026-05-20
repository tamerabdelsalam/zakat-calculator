import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { THEME_INIT_SCRIPT } from "@/lib/theme-init-script";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-sans",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "حاسبة الزكاة",
  title: {
    default: "حاسبة الزكاة",
    template: "%s | حاسبة الزكاة",
  },
  description:
    "احسب زكاة أموالك بسهولة ودقة — تغطي جميع أنواع الأصول مع أسعار الذهب والفضة والعملات المحدّثة يومياً",
  openGraph: {
    type: "website",
    locale: "ar_SA",
    siteName: "حاسبة الزكاة",
    title: "حاسبة الزكاة",
    description:
      "احسب زكاة أموالك بسهولة ودقة — تغطي جميع أنواع الأصول مع أسعار الذهب والفضة والعملات المحدّثة يومياً",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${cairo.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
          suppressHydrationWarning
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

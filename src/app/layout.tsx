import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist_Mono, Hind_Siliguri } from "next/font/google";
import { Providers } from "@/components/providers";
import { resolveLocale } from "@/lib/i18n";
import "./globals.css";

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind",
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SomitySolution",
  description: "সঞ্চয়, ঋণ ও দৈনন্দিন কার্যক্রমের জন্য বহু-রোল সমিতি ব্যবস্থাপনা।",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get("locale")?.value);

  return (
    <html
      lang={locale}
      className={`${hindSiliguri.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-cream text-ink">
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  );
}

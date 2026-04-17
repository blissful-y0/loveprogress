import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const DEFAULT_SITE_URL = "https://www.groveofepiphany.com";

function resolveMetadataBase(): URL {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL);
  } catch {
    // env가 malformed여도 빌드 실패를 막기 위한 fallback
    return new URL(DEFAULT_SITE_URL);
  }
}

export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(),
  title: "파이낙사 온리전 :: 사랑의 진도",
  description: "깨달음의 나무 정원 - 파이낙사 온리전 행사 안내 사이트",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon-60x60.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={cn("font-sans", geist.variable)}>
      <body className="flex min-h-dvh flex-col bg-white antialiased">
        <Suspense><Header /></Suspense>
        <main className="flex-1 bg-white">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
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
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

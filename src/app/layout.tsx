import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
      <body className="flex min-h-screen flex-col bg-white antialiased">
        <Header />
        <main className="flex-1 bg-white">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

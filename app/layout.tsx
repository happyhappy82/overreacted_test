import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "에이정 브랜드 블로그",
  description: "에이정 브랜드 블로그입니다.",
  metadataBase: new URL("https://overreacted-test.vercel.app"),
  openGraph: {
    title: "에이정",
    description: "에이정 브랜드 블로그입니다.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "에이정",
    description: "에이정 브랜드 블로그입니다.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="mx-auto max-w-2xl bg-white px-5 py-12 text-black">
        {children}
      </body>
    </html>
  );
}

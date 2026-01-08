import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "에이정, 가장 쉬운 AI교육",
  description: "AI교육,AI활용법,AI트렌드 주제로 운영하고 있습니다. AI는 선택이 아닌 필수, 에이정과 함께 하세요!",
  metadataBase: new URL("https://blog.aijeong.com"),
  openGraph: {
    title: "에이정, 가장 쉬운 AI교육",
    description: "AI교육,AI활용법,AI트렌드 주제로 운영하고 있습니다. AI는 선택이 아닌 필수, 에이정과 함께 하세요!",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "에이정, 가장 쉬운 AI교육",
    description: "AI교육,AI활용법,AI트렌드 주제로 운영하고 있습니다. AI는 선택이 아닌 필수, 에이정과 함께 하세요!",
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

import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "에이정, 가장 쉬운 AI교육 공식 블로그",
  description: "AI교육,AI활용법,AI트렌드 주제로 운영하고 있습니다. AI는 선택이 아닌 필수, 에이정과 함께 하세요!",
  metadataBase: new URL("https://blog.aijeong.com"),
  openGraph: {
    title: "에이정, 가장 쉬운 AI교육 공식 블로그",
    description: "AI교육,AI활용법,AI트렌드 주제로 운영하고 있습니다. AI는 선택이 아닌 필수, 에이정과 함께 하세요!",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "에이정, 가장 쉬운 AI교육 공식 블로그",
    description: "AI교육,AI활용법,AI트렌드 주제로 운영하고 있습니다. AI는 선택이 아닌 필수, 에이정과 함께 하세요!",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "에이정 공식 블로그",
    "alternateName": "에이정 블로그",
    "url": "https://blog.aijeong.com",
  };

  return (
    <html lang="ko">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="mx-auto max-w-2xl bg-white px-5 py-12 text-black">
        {children}
      </body>
    </html>
  );
}

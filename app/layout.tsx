import type { Metadata, Viewport } from "next";
import "./globals.css";
import Analytics from "@/components/Analytics";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "에이정, 가장 쉬운 AI교육 공식 블로그",
  description:
    "AI교육,AI활용법,AI트렌드 주제로 운영하고 있습니다. AI는 선택이 아닌 필수, 에이정과 함께 하세요!",
  metadataBase: new URL("https://blog.aijeong.com"),
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/rss.xml",
    },
  },
  openGraph: {
    title: "에이정, 가장 쉬운 AI교육 공식 블로그",
    description:
      "AI교육,AI활용법,AI트렌드 주제로 운영하고 있습니다. AI는 선택이 아닌 필수, 에이정과 함께 하세요!",
    type: "website",
    siteName: "에이정 공식 블로그",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "에이정, 가장 쉬운 AI교육 공식 블로그",
    description:
      "AI교육,AI활용법,AI트렌드 주제로 운영하고 있습니다. AI는 선택이 아닌 필수, 에이정과 함께 하세요!",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
    name: "에이정 공식 블로그",
    alternateName: "에이정 블로그",
    url: "https://blog.aijeong.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://blog.aijeong.com/?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "에이정",
    alternateName: "AIJEONG",
    url: "https://blog.aijeong.com",
    logo: "https://blog.aijeong.com/logo.png",
    description:
      "AI교육,AI활용법,AI트렌드 주제로 운영하고 있습니다. AI는 선택이 아닌 필수, 에이정과 함께 하세요!",
  };

  return (
    <html lang="ko">
      <head>
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />

        {/* Site verification */}
        <meta
          name="naver-site-verification"
          content="35359ef09d8be82e12ff2718c788b7d7ab8735b8"
        />

        {/* RSS Feed */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title="에이정 공식 블로그 RSS"
          href="/rss.xml"
        />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>
      <body className="mx-auto max-w-2xl bg-white px-5 py-12 text-black">
        {children}
        <Analytics />
      </body>
    </html>
  );
}

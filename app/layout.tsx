import type { Metadata } from "next";
import { Nanum_Gothic } from "next/font/google";
import "./globals.css";

const nanumGothic = Nanum_Gothic({
  weight: ["400", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nanum",
  preload: true,
});

export const metadata: Metadata = {
  title: "overreacted — A blog by Dan Abramov",
  description: "Personal blog by Dan Abramov. Deep dives into React, JavaScript, and software engineering.",
  metadataBase: new URL("https://overreacted-test.vercel.app"),
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  openGraph: {
    title: "overreacted",
    description: "Personal blog by Dan Abramov. Deep dives into React, JavaScript, and software engineering.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "overreacted",
    description: "Personal blog by Dan Abramov. Deep dives into React, JavaScript, and software engineering.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={nanumGothic.variable}>
      <body className="mx-auto max-w-2xl bg-white px-5 py-12 text-black">
        {children}
      </body>
    </html>
  );
}

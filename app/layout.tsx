import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
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
    <html lang="en" className={inter.variable}>
      <body className="mx-auto max-w-2xl bg-[--bg] px-5 py-12 text-[--text]">
        {children}
      </body>
    </html>
  );
}

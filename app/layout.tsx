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
  description: "A blog by Dan Abramov",
  metadataBase: new URL("https://overreacted.io"),
  openGraph: {
    title: "overreacted",
    description: "A blog by Dan Abramov",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "overreacted",
    description: "A blog by Dan Abramov",
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

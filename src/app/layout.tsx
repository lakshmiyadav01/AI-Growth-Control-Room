import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Growth Control Room",
  description: "Command your entire creative strategy with AI. From raw idea to cinematic campaign.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} font-sans antialiased bg-background text-foreground tracking-wide selection:bg-rosegold-500/30 selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}

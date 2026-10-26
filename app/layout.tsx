import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "K-Star Saju",
  description: "Find your birth element and your fated K-pop soulmate.",
};

export const viewport: Viewport = {
  themeColor: "#0c0722",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Unbounded:wght@500;700;800&family=Noto+Sans+KR:wght@400;500;700&family=Noto+Sans+SC:wght@400;500;700&family=Space+Mono:wght@400;700&family=Playfair+Display:ital,wght@0,500;0,600;1,500&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

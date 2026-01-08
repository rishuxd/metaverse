import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Rishu's Town",
    template: "%s | Rishu's Town",
  },
  description:
    "Create and explore interactive virtual spaces with friends. Join the metaverse, customize your avatar, and connect in real-time 2D worlds.",
  keywords: [
    "metaverse",
    "virtual world",
    "2D spaces",
    "virtual spaces",
    "online collaboration",
    "avatar chat",
    "virtual meetings",
    "interactive spaces",
  ],
  authors: [{ name: "Rishu", url: "https://spaces.rishuffled.in" }],
  creator: "Rishu",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://spaces.rishuffled.in",
    title: "Rishu's Town",
    description:
      "Create and explore interactive virtual spaces with friends. Join the metaverse, customize your avatar, and connect in real-time 2D worlds.",
    siteName: "Rishu's Town",
    images: [
      {
        url: "https://spaces.rishuffled.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "Rishu's Town",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rishu's Town",
    description:
      "Create and explore interactive virtual spaces with friends. Join the metaverse, customize your avatar, and connect in real-time 2D worlds.",
    images: ["https://spaces.rishuffled.in/og-image.png"],
    creator: "@rishuxd",
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
  icons: {
    icon: [
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    title: "Rishu's Town",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} antialiased`}>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Spaces - Virtual Metaverse Platform",
    template: "%s | Spaces",
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
    title: "Spaces - Virtual Metaverse Platform",
    description:
      "Create and explore interactive virtual spaces with friends. Join the metaverse, customize your avatar, and connect in real-time 2D worlds.",
    siteName: "Spaces",
    images: [
      {
        url: "https://spaces.rishuffled.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "Spaces - Virtual Metaverse Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Spaces - Virtual Metaverse Platform",
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
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
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

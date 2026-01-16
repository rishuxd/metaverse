import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Press_Start_2P } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const pressStart2P = Press_Start_2P({
  weight: "400",
  variable: "--font-pixel",
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
  metadataBase: new URL("https://spaces.rishuffled.in"),
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Rishu's Town",
              url: "https://spaces.rishuffled.in",
              alternateName: ["Rishu Town", "Rishus Town"],
              publisher: {
                "@type": "Organization",
                name: "Rishu's Town",
                url: "https://spaces.rishuffled.in",
                logo: {
                  "@type": "ImageObject",
                  url: "https://spaces.rishuffled.in/favicon-96x96.png",
                },
              },
            }),
          }}
        />
      </head>

      <body
        className={`${plusJakartaSans.variable} ${pressStart2P.variable} antialiased font-display`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

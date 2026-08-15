import type { Metadata, Viewport } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
  ],
};

export const metadata: Metadata = {
  title: "POForge — Personal AI Banking Coach",
  description:
    "A continuously adaptive personal coaching system for IBPS RRB PO, IBPS PO, SBI PO, SBI Clerk, and RBI Assistant examinations.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "POForge",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${ibmPlexMono.variable}`}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@700,800,900&display=swap"
        />
        <style>{`
          :root {
            --font-heading: 'Cabinet Grotesk', var(--font-sans), sans-serif;
          }
        `}</style>
      </head>
      <body className="bg-bg text-text min-h-screen font-sans selection:bg-accent-soft selection:text-accent overflow-x-hidden antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}


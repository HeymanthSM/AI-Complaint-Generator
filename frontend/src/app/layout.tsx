import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import AppWrapper from "@/components/layout/AppWrapper";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Civic Navigator – Intelligent Public Grievance & Resolution Platform",
  description: "Report civic issues via text, voice, and images. Powered by AI for automated department routing, complaint drafting, and predictive analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <head>
        {/* Leaflet CSS for Maps */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="bg-background text-foreground antialiased selection:bg-indigo-500/30 selection:text-indigo-200 min-h-screen">
        <AppWrapper>
          {children}
        </AppWrapper>
      </body>
    </html>
  );
}

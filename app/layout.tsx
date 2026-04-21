import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://iot-security-scanner.local"),
  title: {
    default: "IoT Security Scanner | Home Network Vulnerability Monitoring",
    template: "%s | IoT Security Scanner"
  },
  description:
    "Scan home IoT devices for exposed services, known vulnerabilities, and emerging threats. Get clear, actionable hardening recommendations.",
  openGraph: {
    title: "IoT Security Scanner",
    description:
      "Detect vulnerable smart cameras, routers, and IoT hubs before they become part of the next botnet campaign.",
    url: "https://iot-security-scanner.local",
    siteName: "IoT Security Scanner",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "IoT Security Scanner",
    description: "Home network vulnerability scanning with practical remediation guidance."
  },
  alternates: {
    canonical: "/"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={`${geist.variable} ${mono.variable} bg-[#0d1117] text-[#e6edf3] antialiased`}>
        <main className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-8">{children}</main>
      </body>
    </html>
  );
}

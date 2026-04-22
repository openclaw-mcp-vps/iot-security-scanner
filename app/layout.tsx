import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap"
});

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://iot-security-scanner.example.com"),
  title: {
    default: "IoT Security Scanner | Protect Your Smart Home Network",
    template: "%s | IoT Security Scanner"
  },
  description:
    "Scan your home network for vulnerable IoT devices, uncover default-password risks, and get clear steps to lock down cameras, routers, hubs, and smart appliances.",
  openGraph: {
    title: "IoT Security Scanner",
    description:
      "Discover exposed IoT devices and known CVEs before attackers do. Built for smart homes and home-office networks.",
    url: "https://iot-security-scanner.example.com",
    siteName: "IoT Security Scanner",
    type: "website",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "IoT Security Scanner dashboard preview"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "IoT Security Scanner",
    description:
      "Find vulnerable smart-home devices and fix critical risks in minutes.",
    images: ["/og-image.svg"]
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${headingFont.variable}`}>
      <body className="min-h-screen bg-[#0d1117] font-[var(--font-body)] text-[var(--foreground)] antialiased">
        {children}
      </body>
    </html>
  );
}

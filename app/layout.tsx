import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://iot-security-scanner.example.com"),
  title: {
    default: "IoT Security Scanner | Protect Your Home Network",
    template: "%s | IoT Security Scanner",
  },
  description:
    "Scan your home network for vulnerable IoT devices, detect high-risk CVEs, and get step-by-step hardening guidance.",
  keywords: [
    "IoT security",
    "home network scanner",
    "smart home vulnerabilities",
    "router security",
    "camera security monitoring",
  ],
  openGraph: {
    title: "IoT Security Scanner",
    description:
      "Find weak IoT devices, map known vulnerabilities, and apply practical security fixes before attackers do.",
    type: "website",
    url: "https://iot-security-scanner.example.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "IoT Security Scanner",
    description:
      "Identify vulnerable home IoT devices and monitor new threats targeting your exact hardware models.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0d1117] text-slate-100 antialiased">{children}</body>
    </html>
  );
}

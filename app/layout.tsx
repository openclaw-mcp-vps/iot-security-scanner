import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IoT Security Scanner — Protect Your Home Network",
  description: "Scan home IoT devices for security vulnerabilities. Get detailed reports and remediation steps."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0d1117] text-[#c9d1d9] min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}

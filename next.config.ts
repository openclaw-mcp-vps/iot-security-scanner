import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["node-nmap", "cron", "nodemailer"]
};

export default nextConfig;

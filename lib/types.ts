export type Severity = "low" | "medium" | "high" | "critical";

export interface VulnerabilityRecord {
  id: string;
  cve?: string;
  severity: Severity;
  title: string;
  summary: string;
  exploitability: string;
  mitigation: string;
  reference: string;
  publishedAt?: string;
  source: "local-signature" | "nvd";
}

export interface DeviceRecord {
  id: string;
  ip: string;
  mac?: string;
  hostname?: string;
  vendor?: string;
  model?: string;
  deviceType: string;
  openPorts: number[];
  services: string[];
  riskScore: number;
  riskLevel: Severity;
  vulnerabilities: VulnerabilityRecord[];
  recommendations: string[];
  lastSeen: string;
}

export interface ScanRecord {
  id: string;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  deviceCount: number;
  criticalCount: number;
  score: number;
  devices: DeviceRecord[];
}

export interface PurchaseRecord {
  sessionId: string;
  email?: string;
  amountTotal?: number;
  currency?: string;
  createdAt: string;
  status: "paid" | "refunded";
}

export interface AccessClaims {
  sessionId: string;
  email?: string;
  purchasedAt: string;
  expiresAt: string;
}

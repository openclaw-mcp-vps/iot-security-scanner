export type Severity = "low" | "medium" | "high" | "critical";

export interface VulnerabilityRecord {
  id: string;
  title: string;
  severity: Severity;
  description: string;
  action: string;
  reference: string;
  source: "local" | "nvd";
}

export interface DeviceRecord {
  id: string;
  ip: string;
  mac: string;
  hostname: string;
  vendor: string;
  model: string;
  type: "router" | "camera" | "hub" | "speaker" | "assistant" | "appliance" | "unknown";
  os: string;
  openPorts: number[];
  scanSource: "nmap" | "arp" | "sample";
  lastSeen: string;
  riskScore: number;
  vulnerabilities: VulnerabilityRecord[];
  recommendations: string[];
}

export interface ScanSummary {
  totalDevices: number;
  vulnerableDevices: number;
  criticalFindings: number;
  highFindings: number;
  mediumFindings: number;
  lowFindings: number;
  overallRiskScore: number;
}

export interface ScanRecord {
  id: string;
  startedAt: string;
  completedAt: string;
  target: string;
  source: "nmap" | "arp" | "sample";
  summary: ScanSummary;
  devices: DeviceRecord[];
}

export interface PurchaseRecord {
  sessionId: string;
  email: string;
  customerId: string;
  status: "active" | "canceled";
  purchasedAt: string;
  lastUpdatedAt: string;
}

export interface AccessTokenPayload {
  email: string;
  sessionId: string;
  exp: number;
}

export interface DataStore {
  scans: ScanRecord[];
  purchases: PurchaseRecord[];
}

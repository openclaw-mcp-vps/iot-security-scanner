export type ScanStatus = "queued" | "running" | "completed" | "failed";

export interface DeviceRecord {
  id: string;
  scan_id: string;
  ip_address: string;
  mac_address: string | null;
  hostname: string | null;
  vendor: string | null;
  model: string | null;
  open_ports: number[];
  firmware_version: string | null;
  risk_score: number;
  last_seen_at: string;
}

export interface VulnerabilityRecord {
  id: string;
  device_id: string;
  cve_id: string;
  severity: "critical" | "high" | "medium" | "low";
  summary: string;
  recommendation: string;
  published_at: string;
  references: string[];
}

export interface ScanRecord {
  id: string;
  network_range: string;
  status: ScanStatus;
  started_at: string;
  completed_at: string | null;
  device_count: number;
  high_severity_count: number;
  initiated_by: "web" | "agent";
}

export interface PurchaseRecord {
  id: string;
  email: string;
  stripe_session_id: string;
  status: "active" | "refunded";
  purchased_at: string;
  expires_at: string | null;
}

export interface ScannerDevice {
  ipAddress: string;
  macAddress: string | null;
  hostname: string | null;
  vendor: string | null;
  model: string | null;
  firmwareVersion: string | null;
  openPorts: number[];
}

export interface ScannerResult {
  networkRange: string;
  scannedAt: string;
  devices: ScannerDevice[];
}

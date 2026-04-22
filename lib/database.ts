import { mkdir, readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { Pool } from "pg";
import type { DeviceRecord, PurchaseRecord, ScanRecord, VulnerabilityRecord } from "@/lib/types";

interface LocalStore {
  scans: ScanRecord[];
  devices: DeviceRecord[];
  vulnerabilities: VulnerabilityRecord[];
  purchases: PurchaseRecord[];
}

const localPath = path.join(process.cwd(), ".data", "store.json");
let schemaInitialized = false;

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes("localhost")
        ? false
        : {
            rejectUnauthorized: false,
          },
    })
  : null;

async function ensureLocalStore(): Promise<LocalStore> {
  await mkdir(path.dirname(localPath), { recursive: true });
  try {
    const raw = await readFile(localPath, "utf8");
    return JSON.parse(raw) as LocalStore;
  } catch {
    const fresh: LocalStore = {
      scans: [],
      devices: [],
      vulnerabilities: [],
      purchases: [],
    };
    await writeFile(localPath, JSON.stringify(fresh, null, 2), "utf8");
    return fresh;
  }
}

async function persistLocalStore(store: LocalStore) {
  await writeFile(localPath, JSON.stringify(store, null, 2), "utf8");
}

async function ensurePgSchema() {
  if (!pool || schemaInitialized) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS scans (
      id TEXT PRIMARY KEY,
      network_range TEXT NOT NULL,
      status TEXT NOT NULL,
      started_at TIMESTAMPTZ NOT NULL,
      completed_at TIMESTAMPTZ,
      device_count INTEGER NOT NULL DEFAULT 0,
      high_severity_count INTEGER NOT NULL DEFAULT 0,
      initiated_by TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS devices (
      id TEXT PRIMARY KEY,
      scan_id TEXT NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
      ip_address TEXT NOT NULL,
      mac_address TEXT,
      hostname TEXT,
      vendor TEXT,
      model TEXT,
      open_ports INTEGER[] NOT NULL DEFAULT '{}',
      firmware_version TEXT,
      risk_score INTEGER NOT NULL,
      last_seen_at TIMESTAMPTZ NOT NULL
    );

    CREATE TABLE IF NOT EXISTS vulnerabilities (
      id TEXT PRIMARY KEY,
      device_id TEXT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
      cve_id TEXT NOT NULL,
      severity TEXT NOT NULL,
      summary TEXT NOT NULL,
      recommendation TEXT NOT NULL,
      published_at TIMESTAMPTZ NOT NULL,
      references TEXT[] NOT NULL DEFAULT '{}'
    );

    CREATE TABLE IF NOT EXISTS purchases (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      stripe_session_id TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL,
      purchased_at TIMESTAMPTZ NOT NULL,
      expires_at TIMESTAMPTZ
    );

    CREATE INDEX IF NOT EXISTS idx_purchases_email ON purchases(email);
  `);
  schemaInitialized = true;
}

async function withStorage<T>(
  handler: (mode: "pg" | "local", store?: LocalStore) => Promise<T>,
): Promise<T> {
  if (pool) {
    await ensurePgSchema();
    return handler("pg");
  }

  const store = await ensureLocalStore();
  const result = await handler("local", store);
  await persistLocalStore(store);
  return result;
}

export async function createScan(input: {
  networkRange: string;
  initiatedBy: "web" | "agent";
  status?: "queued" | "running";
}): Promise<ScanRecord> {
  const scan: ScanRecord = {
    id: randomUUID(),
    network_range: input.networkRange,
    status: input.status ?? "running",
    started_at: new Date().toISOString(),
    completed_at: null,
    device_count: 0,
    high_severity_count: 0,
    initiated_by: input.initiatedBy,
  };

  return withStorage(async (mode, store) => {
    if (mode === "pg") {
      await pool!.query(
        `INSERT INTO scans (id, network_range, status, started_at, completed_at, device_count, high_severity_count, initiated_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          scan.id,
          scan.network_range,
          scan.status,
          scan.started_at,
          scan.completed_at,
          scan.device_count,
          scan.high_severity_count,
          scan.initiated_by,
        ],
      );
      return scan;
    }

    store!.scans.push(scan);
    return scan;
  });
}

export async function completeScan(scanId: string, input: { deviceCount: number; highSeverityCount: number; status?: "completed" | "failed" }) {
  return withStorage(async (mode, store) => {
    if (mode === "pg") {
      await pool!.query(
        `UPDATE scans SET status=$2, completed_at=$3, device_count=$4, high_severity_count=$5 WHERE id=$1`,
        [scanId, input.status ?? "completed", new Date().toISOString(), input.deviceCount, input.highSeverityCount],
      );
      return;
    }

    const scan = store!.scans.find((entry) => entry.id === scanId);
    if (!scan) return;
    scan.status = input.status ?? "completed";
    scan.completed_at = new Date().toISOString();
    scan.device_count = input.deviceCount;
    scan.high_severity_count = input.highSeverityCount;
  });
}

export async function saveDevices(scanId: string, devices: Omit<DeviceRecord, "id" | "scan_id" | "last_seen_at">[]) {
  return withStorage(async (mode, store) => {
    if (mode === "pg") {
      for (const device of devices) {
        await pool!.query(
          `INSERT INTO devices (id, scan_id, ip_address, mac_address, hostname, vendor, model, open_ports, firmware_version, risk_score, last_seen_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          [
            randomUUID(),
            scanId,
            device.ip_address,
            device.mac_address,
            device.hostname,
            device.vendor,
            device.model,
            device.open_ports,
            device.firmware_version,
            device.risk_score,
            new Date().toISOString(),
          ],
        );
      }
      return;
    }

    const mapped: DeviceRecord[] = devices.map((device) => ({
      id: randomUUID(),
      scan_id: scanId,
      ...device,
      last_seen_at: new Date().toISOString(),
    }));
    store!.devices.push(...mapped);
  });
}

export async function saveVulnerabilities(vulnerabilities: Omit<VulnerabilityRecord, "id">[]) {
  return withStorage(async (mode, store) => {
    if (mode === "pg") {
      for (const vulnerability of vulnerabilities) {
        await pool!.query(
          `INSERT INTO vulnerabilities (id, device_id, cve_id, severity, summary, recommendation, published_at, references)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [
            randomUUID(),
            vulnerability.device_id,
            vulnerability.cve_id,
            vulnerability.severity,
            vulnerability.summary,
            vulnerability.recommendation,
            vulnerability.published_at,
            vulnerability.references,
          ],
        );
      }
      return;
    }

    const mapped: VulnerabilityRecord[] = vulnerabilities.map((entry) => ({
      id: randomUUID(),
      ...entry,
    }));
    store!.vulnerabilities.push(...mapped);
  });
}

export async function listScans(limit = 10): Promise<ScanRecord[]> {
  return withStorage(async (mode, store) => {
    if (mode === "pg") {
      const result = await pool!.query<ScanRecord>(
        `SELECT * FROM scans ORDER BY started_at DESC LIMIT $1`,
        [limit],
      );
      return result.rows;
    }
    return [...store!.scans].sort((a, b) => b.started_at.localeCompare(a.started_at)).slice(0, limit);
  });
}

export async function listDevices(): Promise<DeviceRecord[]> {
  return withStorage(async (mode, store) => {
    if (mode === "pg") {
      const result = await pool!.query<DeviceRecord>(`SELECT * FROM devices ORDER BY last_seen_at DESC`);
      return result.rows;
    }
    return [...store!.devices].sort((a, b) => b.last_seen_at.localeCompare(a.last_seen_at));
  });
}

export async function listVulnerabilities(severity?: VulnerabilityRecord["severity"]): Promise<VulnerabilityRecord[]> {
  return withStorage(async (mode, store) => {
    if (mode === "pg") {
      if (severity) {
        const result = await pool!.query<VulnerabilityRecord>(
          `SELECT * FROM vulnerabilities WHERE severity=$1 ORDER BY published_at DESC`,
          [severity],
        );
        return result.rows;
      }
      const result = await pool!.query<VulnerabilityRecord>(`SELECT * FROM vulnerabilities ORDER BY published_at DESC`);
      return result.rows;
    }

    const rows = [...store!.vulnerabilities].sort((a, b) => b.published_at.localeCompare(a.published_at));
    if (!severity) return rows;
    return rows.filter((entry) => entry.severity === severity);
  });
}

export async function getDeviceVulnerabilityCounts(): Promise<Record<string, number>> {
  const vulnerabilities = await listVulnerabilities();
  return vulnerabilities.reduce<Record<string, number>>((acc, vulnerability) => {
    acc[vulnerability.device_id] = (acc[vulnerability.device_id] ?? 0) + 1;
    return acc;
  }, {});
}

export async function upsertPurchase(purchase: Omit<PurchaseRecord, "id">) {
  return withStorage(async (mode, store) => {
    if (mode === "pg") {
      await pool!.query(
        `INSERT INTO purchases (id, email, stripe_session_id, status, purchased_at, expires_at)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (stripe_session_id)
         DO UPDATE SET email=EXCLUDED.email, status=EXCLUDED.status, purchased_at=EXCLUDED.purchased_at, expires_at=EXCLUDED.expires_at`,
        [
          randomUUID(),
          purchase.email.toLowerCase(),
          purchase.stripe_session_id,
          purchase.status,
          purchase.purchased_at,
          purchase.expires_at,
        ],
      );
      return;
    }

    const existing = store!.purchases.find((entry) => entry.stripe_session_id === purchase.stripe_session_id);
    if (existing) {
      existing.email = purchase.email.toLowerCase();
      existing.status = purchase.status;
      existing.purchased_at = purchase.purchased_at;
      existing.expires_at = purchase.expires_at;
      return;
    }

    store!.purchases.push({
      id: randomUUID(),
      ...purchase,
      email: purchase.email.toLowerCase(),
    });
  });
}

export async function hasActivePurchase(email: string): Promise<boolean> {
  const normalized = email.toLowerCase().trim();
  return withStorage(async (mode, store) => {
    if (mode === "pg") {
      const result = await pool!.query<PurchaseRecord>(
        `SELECT * FROM purchases WHERE email=$1 AND status='active' ORDER BY purchased_at DESC LIMIT 1`,
        [normalized],
      );
      if (!result.rows[0]) return false;
      const row = result.rows[0];
      if (!row.expires_at) return true;
      return new Date(row.expires_at).getTime() > Date.now();
    }

    const row = [...store!.purchases]
      .filter((entry) => entry.email === normalized && entry.status === "active")
      .sort((a, b) => b.purchased_at.localeCompare(a.purchased_at))[0];
    if (!row) return false;
    if (!row.expires_at) return true;
    return new Date(row.expires_at).getTime() > Date.now();
  });
}

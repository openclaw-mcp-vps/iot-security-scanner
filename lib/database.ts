import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import type { DataStore, DeviceRecord, PurchaseRecord, ScanRecord } from "@/lib/types";

const dataDirectory = path.join(process.cwd(), "data");
const dataPath = path.join(dataDirectory, "store.json");

const defaultStore: DataStore = {
  scans: [],
  purchases: []
};

let writeQueue: Promise<void> = Promise.resolve();

async function ensureStore() {
  await fs.mkdir(dataDirectory, { recursive: true });

  try {
    await fs.access(dataPath);
  } catch {
    await fs.writeFile(dataPath, JSON.stringify(defaultStore, null, 2), "utf8");
  }
}

async function readStore(): Promise<DataStore> {
  await ensureStore();
  const content = await fs.readFile(dataPath, "utf8");

  try {
    const parsed = JSON.parse(content) as DataStore;
    return {
      scans: Array.isArray(parsed.scans) ? parsed.scans : [],
      purchases: Array.isArray(parsed.purchases) ? parsed.purchases : []
    };
  } catch {
    return structuredClone(defaultStore);
  }
}

async function writeStore(store: DataStore) {
  await ensureStore();
  const tmpPath = `${dataPath}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(store, null, 2), "utf8");
  await fs.rename(tmpPath, dataPath);
}

async function updateStore(mutator: (store: DataStore) => DataStore | Promise<DataStore>) {
  writeQueue = writeQueue.then(async () => {
    const current = await readStore();
    const next = await mutator(current);
    await writeStore(next);
  });

  await writeQueue;
}

export async function saveScanRecord(
  scan: Omit<ScanRecord, "id">
): Promise<ScanRecord> {
  const fullRecord: ScanRecord = {
    ...scan,
    id: randomUUID()
  };

  await updateStore((store) => ({
    ...store,
    scans: [fullRecord, ...store.scans].slice(0, 100)
  }));

  return fullRecord;
}

export async function getLatestScanRecord(): Promise<ScanRecord | null> {
  const store = await readStore();
  return store.scans[0] ?? null;
}

export async function getRecentScans(limit = 10): Promise<ScanRecord[]> {
  const store = await readStore();
  return store.scans.slice(0, Math.max(1, limit));
}

export async function getLatestDevices(): Promise<DeviceRecord[]> {
  const latest = await getLatestScanRecord();
  return latest?.devices ?? [];
}

export async function upsertPurchase(
  purchase: Omit<PurchaseRecord, "lastUpdatedAt">
): Promise<PurchaseRecord> {
  const updated: PurchaseRecord = {
    ...purchase,
    lastUpdatedAt: new Date().toISOString()
  };

  await updateStore((store) => {
    const existingIndex = store.purchases.findIndex(
      (entry) => entry.sessionId === updated.sessionId
    );

    if (existingIndex >= 0) {
      const purchases = [...store.purchases];
      purchases[existingIndex] = updated;
      return { ...store, purchases };
    }

    return { ...store, purchases: [updated, ...store.purchases].slice(0, 500) };
  });

  return updated;
}

export async function getPurchaseBySessionId(
  sessionId: string
): Promise<PurchaseRecord | null> {
  const store = await readStore();
  return store.purchases.find((entry) => entry.sessionId === sessionId) ?? null;
}

export async function getLatestActivePurchaseByEmail(
  email: string
): Promise<PurchaseRecord | null> {
  const normalized = email.trim().toLowerCase();
  const store = await readStore();
  return (
    store.purchases.find(
      (entry) => entry.email.toLowerCase() === normalized && entry.status === "active"
    ) ?? null
  );
}

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DeviceRecord } from "@/lib/types";

interface DeviceListProps {
  devices: DeviceRecord[];
}

export function DeviceList({ devices }: DeviceListProps) {
  if (devices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No devices scanned yet</CardTitle>
        </CardHeader>
        <CardContent>
          Run your first network scan to discover IoT devices and evaluate their security posture.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {devices.map((device) => (
        <Card key={device.id} className="p-4">
          <CardHeader className="mb-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="text-base">{device.hostname || device.ip}</CardTitle>
                <p className="text-xs text-[#9aa4af]">{device.vendor || "Unknown vendor"}</p>
              </div>
              <Badge variant={device.riskLevel}>{device.riskLevel.toUpperCase()}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-[#9aa4af]">Type: {device.deviceType}</p>
            <p className="text-sm text-[#9aa4af]">IP: {device.ip}</p>
            <p className="text-sm text-[#9aa4af]">Open ports: {device.openPorts.join(", ") || "None"}</p>
            <p className="text-sm text-[#9aa4af]">Risk score: {device.riskScore}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

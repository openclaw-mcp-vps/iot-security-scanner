import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DeviceRecord } from "@/lib/types";

interface DeviceCardProps {
  device: DeviceRecord;
  vulnerabilityCount: number;
}

function riskVariant(score: number): "success" | "warning" | "danger" {
  if (score >= 70) return "danger";
  if (score >= 45) return "warning";
  return "success";
}

export function DeviceCard({ device, vulnerabilityCount }: DeviceCardProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle>{device.hostname || device.model || device.ip_address}</CardTitle>
            <CardDescription>
              {device.vendor ? `${device.vendor} • ` : ""}
              {device.model || "Unknown model"}
            </CardDescription>
          </div>
          <Badge variant={riskVariant(device.risk_score)}>Risk {device.risk_score}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="text-slate-300">
          <p>
            <span className="text-slate-500">IP:</span> {device.ip_address}
          </p>
          <p>
            <span className="text-slate-500">MAC:</span> {device.mac_address || "Unknown"}
          </p>
          <p>
            <span className="text-slate-500">Ports:</span>{" "}
            {device.open_ports.length ? device.open_ports.join(", ") : "No open ports detected"}
          </p>
        </div>
        <div className="flex items-center justify-between border-t border-slate-700 pt-3">
          <span className="text-slate-400">Linked vulnerabilities</span>
          <Badge variant={vulnerabilityCount > 0 ? "danger" : "success"}>{vulnerabilityCount}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

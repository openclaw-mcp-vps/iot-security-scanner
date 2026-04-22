import { Activity, EthernetPort, Shield, ShieldX, Smartphone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DeviceRecord } from "@/lib/types";

function riskBadge(riskScore: number) {
  if (riskScore >= 70) {
    return {
      label: "High risk",
      variant: "danger" as const,
      icon: <ShieldX className="h-4 w-4" />
    };
  }

  if (riskScore >= 40) {
    return {
      label: "Medium risk",
      variant: "warning" as const,
      icon: <Shield className="h-4 w-4" />
    };
  }

  return {
    label: "Low risk",
    variant: "default" as const,
    icon: <Shield className="h-4 w-4" />
  };
}

export function DeviceCard({ device }: { device: DeviceRecord }) {
  const risk = riskBadge(device.riskScore);

  return (
    <Card className="h-full border-slate-800 bg-slate-950/40">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg text-slate-100">{device.model}</CardTitle>
          <Badge variant={risk.variant} className="inline-flex items-center gap-1">
            {risk.icon}
            {risk.label}
          </Badge>
        </div>
        <p className="text-sm text-slate-400">{device.vendor} • {device.type}</p>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-slate-300">
        <div className="flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-cyan-300" />
          <span>{device.ip}</span>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-300" />
          <span>{device.vulnerabilities.length} vulnerability findings</span>
        </div>
        <div className="flex items-center gap-2">
          <EthernetPort className="h-4 w-4 text-amber-300" />
          <span>
            Ports: {device.openPorts.length ? device.openPorts.join(", ") : "No open management ports detected"}
          </span>
        </div>
        <p className="text-xs text-slate-500">Last seen: {new Date(device.lastSeen).toLocaleString()}</p>
      </CardContent>
    </Card>
  );
}

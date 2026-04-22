declare module "node-nmap" {
  export class NmapScan {
    constructor(host: string, flags?: string);
    on(event: "complete", callback: (data: any[]) => void): void;
    on(event: "error", callback: (error: Error) => void): void;
    startScan(): void;
  }
}

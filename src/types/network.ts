export interface PingMetrics {
  target: string;
  sent: number;
  received: number;
  lossPercentage: number;
  minLatency: number;
  avgLatency: number;
  maxLatency: number;
  jitter: number;
  samples: number[];
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
}

export interface DnsResolverResult {
  id: string;
  name: string;
  ip: string;
  resolvedIp: string | null;
  durationMs: number;
  status: 'SUCCESS' | 'FAILED';
  error?: string;
}

export interface DnsBenchmarkData {
  domain: string;
  results: DnsResolverResult[];
  recommendedDns: DnsResolverResult | null;
}

export type HopTier = 'LOCAL_GATEWAY' | 'ISP_OLT' | 'ISP_CORE' | 'PEERING_TRANSIT' | 'TARGET_SERVER';

export interface TracerouteHop {
  hop: number;
  tier: HopTier;
  name: string;
  ip: string;
  latencyMs: number;
  lossRate: number;
  status: 'OK' | 'DEGRADED' | 'FAILED';
  detail: string;
}

export interface WifiMetrics {
  ssid: string;
  rssi_dbm: number;
  link_speed: string;
  channel: string;
  frequency: '2.4 GHz' | '5 GHz' | '6 GHz';
  quality: number; // 0 - 100
  noiseDbm: number;
}

export type DiagnosisSeverity = 'HEALTHY' | 'WARNING' | 'CRITICAL';

export interface DiagnosisReport {
  id: string;
  timestamp: string;
  diagnosisCode: 'NOMINAL' | 'WIFI_SIGNAL_POOR' | 'MODEM_GATEWAY_ISSUE' | 'DNS_FAILURE' | 'ISP_OUTAGE_OR_PACKETLOSS' | 'HIGH_JITTER_LATENCY';
  diagnosisTitle: string;
  diagnosisSummary: string;
  severity: DiagnosisSeverity;
  rootCauseLayer: 'WIFI' | 'MODEM' | 'DNS' | 'ISP' | 'NONE';
  wifi: WifiMetrics;
  gatewayPing: PingMetrics;
  ispPing: PingMetrics;
  dnsBenchmark: DnsBenchmarkData;
  hops: TracerouteHop[];
  suggestions: string[];
  cliQuickFixes: {
    title: string;
    windows: string;
    macLinux: string;
  }[];
}

export interface OutageIncident {
  id: string;
  timestamp: string;
  durationSeconds: number;
  affectedLayer: 'ISP' | 'MODEM' | 'DNS' | 'WIFI';
  ispLossPct: number;
  gatewayLossPct: number;
  jitterMs: number;
  primaryTarget: string;
  notes: string;
}

export interface IspDossierConfig {
  subscriberName: string;
  subscriberNo: string;
  ispName: string; // Türk Telekom, TurkNet, Vodafone, Superonline, Kablonet, Diğer
  city: string;
  packageSpeed: string;
  contractStartDate: string;
  notes: string;
}

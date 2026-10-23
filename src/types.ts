export interface WireMessage<t> {
  status: string;
  message: string;
  data: t;
}

export type Check = {
  id: number;
  monitor_id: number;
  status_code: number;
  response_time: number;
  created_at: string;
  updated_at: string;
};

export type MonitorStats = {
  total_checks: number;
  avg_response_time: number;
  uptime_percentage: number;
};

export interface ChecksMonitorData {
  checks: Check[];
  monitor_stats: MonitorStats;
}

export type ProcessStatus = 'done' | 'in-progress' | 'pending' | 'error';

export interface ProcessEvent {
  id: string;
  timestamp: string;         // ISO string
  operator: string;
  machine: string;
  result: 'PASS' | 'FAIL' | 'NG' | 'OK';
  note?: string;
  extra?: Record<string, string>;
}

export interface ProcessStep {
  key: 'case-setting' | 'damper-less' | 'laser-marking' | 'ec-sorting';
  label: string;
  icon: string;              // SVG string
  status: ProcessStatus;
  completedAt?: string;
  events: ProcessEvent[];
}

export interface OrderDetail {
  id: string;
  twoCode: string;
  customer: string;
  product: string;
  amount: number;
  createdAt: string;
  steps: ProcessStep[];
}

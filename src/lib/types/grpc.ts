// TypeScript types ที่ตรงกับ proto definitions ของ gRPC backend

export interface GrpcTimestamp {
  seconds: number;
  nanos: number;
}

export function tsToIso(ts: GrpcTimestamp | null | undefined): string {
  if (!ts) return '';
  return new Date(ts.seconds * 1000).toISOString();
}

// ── laser_marking ──────────────────────────────────────────────────────────────
export interface LaserMarkingRecord {
  id: number;
  no: number;
  empcode: string;
  line: string;
  lot: string;
  model: string;
  arp_tray: string;
  code2d: string;
  created_at: GrpcTimestamp | null;
  updated_at: GrpcTimestamp | null;
}

export interface ListLaserMarkingResponse {
  items: LaserMarkingRecord[];
  total: number;
}

// ── case_setting ───────────────────────────────────────────────────────────────
export interface CaseSettingRecord {
  id: number;
  no: number;
  arp_tray: string;
  case_setting: string;
  empcode: string;
  line: string;
  lot: string;
  model: string;
  created_at: GrpcTimestamp | null;
  updated_at: GrpcTimestamp | null;
}

export interface ListCaseSettingsResponse {
  settings: CaseSettingRecord[];
  total: number;
}

// ── aeoi ───────────────────────────────────────────────────────────────────────
export interface AeoiRecord {
  id: number;
  lot: string;
  model: string;
  mc_no: number;
  line: string;
  state: number;
  arp_tray: string;
  pos_no: number;
  ep_center_x: number;
  ep_center_y: number;
  ep_theta: number;
  tl_x: number; tr_x: number; bl_x: number; br_x: number;
  tl_y: number; tr_y: number; bl_y: number; br_y: number;
  cp_index: number;
  cp_width: number;
  cp_length: number;
  judgement: string;
  created_at: GrpcTimestamp | null;
  updated_at: GrpcTimestamp | null;
}

export interface ListAeoiResponse {
  items: AeoiRecord[];
  total: number;
}

// ── damper_less ────────────────────────────────────────────────────────────────
export interface DamperLessRecord {
  id: number;
  no: number;
  arp_tray: string;
  damper_less: string;
  empcode: string;
  line: string;
  lot: string;
  model: string;
  created_at: GrpcTimestamp | null;
  updated_at: GrpcTimestamp | null;
}

export interface ListDamperLessResponse {
  items: DamperLessRecord[];
  total: number;
}

// ── pin_position ───────────────────────────────────────────────────────────────
export interface PinPositionRecord {
  id: number;
  lot: string;
  tray: string;
  pos_no: number;
  code2d: string;
  pos_left: number;
  pos_right: number;
  parallelism: number;
  dia_left: number;
  dia_right: number;
  x_left: number;
  x_right: number;
  y_left: number;
  y_right: number;
  pins_pitch: number;
  judgment_code: number;
  judgment_name: string;
  created_at: GrpcTimestamp | null;
  updated_at: GrpcTimestamp | null;
}

export interface ListPinPositionResponse {
  items: PinPositionRecord[];
  total: number;
}

// ── dashboard aggregate ────────────────────────────────────────────────────────
export interface LineCount {
  line:  string;
  total: number;
}

export interface LineJudgement {
  line:  string;
  total: number;
  g:     number;
  ng:    number;
}

export interface DashboardStatsResponse {
  laser_marking: LineCount[];
  case_setting:  LineCount[];
  aeoi:          LineJudgement[];
  damper_less:   LineCount[];
  pin_position:  LineJudgement[];
}

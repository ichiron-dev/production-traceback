// ── Page Data Types ───────────────────────────────────────────────────────────
// กำหนด type ของ data ที่ส่งจาก +page.server.ts → +page.svelte แต่ละหน้า
// ใช้แทนการ import PageData จาก './$types' เพื่อหลีกเลี่ยงปัญหา type generation cache
// ─────────────────────────────────────────────────────────────────────────────

import type {
  LaserMarkingRecord,
  AeoiRecord,
  CaseSettingRecord,
  DamperLessRecord,
  PinPositionRecord,
} from '$lib/types/grpc';

// ── Dashboard ─────────────────────────────────────────────────────────────────

export interface DashboardJudgement {
  total: number;
  pass:  number;
  ng:    number;
  rate:  number | null;
}

export interface DashboardSummary {
  laserMarking: number;
  caseSetting:  number;
  aeoi:         DashboardJudgement;
  damperLess:   number;
  pinPosition:  DashboardJudgement;
}

export interface DashboardLineStat {
  line:         string;
  laserMarking: number;
  caseSetting:  number;
  aeoi:         DashboardJudgement;
  damperLess:   number;
  pinPosition:  DashboardJudgement;
}

export interface DashboardPageData {
  selectedDate: string;
  summary:      DashboardSummary;
  lineStats:    DashboardLineStat[];
  grpcError?:   string;
}

// ── Code2D ────────────────────────────────────────────────────────────────────

export interface Code2dPageData {
  items:      LaserMarkingRecord[];
  total:      number;
  lines:      string[];
  filters:    { line: string; dateFrom: string; dateTo: string };
  grpcError?: string;
}

// ── AEOI ──────────────────────────────────────────────────────────────────────

export interface AeoiPageData {
  items:      AeoiRecord[];
  total:      number;
  lines:      string[];
  filters:    { lot: string; model: string; line: string; arpTray: string; dateFrom: string; dateTo: string };
  searched:   boolean;
  grpcError?: string;
}

// ── Case Setting ──────────────────────────────────────────────────────────────

export interface CaseSettingPageData {
  items:      CaseSettingRecord[];
  total:      number;
  lines:      string[];
  filters:    { caseSetting: string; empcode: string; line: string; dateFrom: string; dateTo: string };
  searched:   boolean;
  grpcError?: string;
}

// ── Damper Less ───────────────────────────────────────────────────────────────

export interface DamperLessPageData {
  items:      DamperLessRecord[];
  total:      number;
  lines:      string[];
  filters:    { damperLess: string; empcode: string; lot: string; arpTray: string; line: string; dateFrom: string; dateTo: string };
  searched:   boolean;
  grpcError?: string;
}

// ── Laser Marking ─────────────────────────────────────────────────────────────

export interface LaserMarkingPageData {
  items:      LaserMarkingRecord[];
  total:      number;
  lines:      string[];
  filters:    { empcode: string; lot: string; line: string; dateFrom: string; dateTo: string; code2d: string };
  searched:   boolean;
  grpcError?: string;
}

// ── Pin Position ──────────────────────────────────────────────────────────────

export interface PinPositionPageData {
  items:      PinPositionRecord[];
  total:      number;
  filters:    { lot: string; code2d: string; dateFrom: string; dateTo: string };
  searched:   boolean;
  grpcError?: string;
}

// ── Orders [id] ───────────────────────────────────────────────────────────────

export interface OrderDetailSteps {
  aeoi:         AeoiRecord[];
  damperLess:   DamperLessRecord[];
  laserMarking: LaserMarkingRecord[];
  pinPosition:  PinPositionRecord[];
}

export interface OrderDetailPageData {
  code2d:      string;
  lot:         string;
  steps:       OrderDetailSteps;
  grpcErrors:  string[] | null;
}

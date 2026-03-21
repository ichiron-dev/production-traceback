// gRPC client factory — server-only (ไม่ import ใน browser code)
// Proto files อยู่ที่ ../gRPC/denso/proto/ (relative จาก production-traceback/)

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { resolve } from 'path';
import { env } from '$env/dynamic/private';
import type {
  ListLaserMarkingResponse,
  ListCaseSettingsResponse,
  ListAeoiResponse,
  ListDamperLessResponse,
  ListPinPositionResponse,
  DashboardStatsResponse,
} from '$lib/types/grpc';

// ── Config ──────────────────────────────────────────────────────────────────
// อ่านค่าจาก .env (หรือ environment variable บน production server)
export const GRPC_HOST = env.GRPC_HOST ?? 'localhost:50051';

const PROTO_DIR = env.GRPC_PROTO_DIR
  ? resolve(process.cwd(), env.GRPC_PROTO_DIR)
  : resolve(process.cwd(), '../gRPC/denso/proto');

const LOAD_OPT: protoLoader.Options = {
  includeDirs: [PROTO_DIR],
  keepCase: true,
  longs: Number,
  enums: String,
  defaults: true,
  oneofs: true,
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function loadClient(protoFile: string, pkg: string, service: string): grpc.Client {
  const def = protoLoader.loadSync(resolve(PROTO_DIR, 'denso', protoFile), LOAD_OPT);
  const proto = grpc.loadPackageDefinition(def) as Record<string, Record<string, grpc.ServiceClientConstructor>>;
  const Ctor = proto[pkg][service];
  return new Ctor(GRPC_HOST, grpc.credentials.createInsecure());
}

export function grpcCall<T>(
  client: grpc.Client,
  method: string,
  request: object,
): Promise<T> {
  return new Promise((res, rej) => {
    (client as unknown as Record<string, (req: object, cb: (err: grpc.ServiceError | null, reply: T) => void) => void>)[method](
      request,
      (err, reply) => {
        if (err) rej(err);
        else res(reply);
      },
    );
  });
}

// ── Client builders (สร้างใหม่ทุก request เพื่อหลีกเลี่ยงปัญหา hot-reload) ──
export function laserMarkingClient() {
  return loadClient('laser_marking.proto', 'laser_marking', 'LaserMarkingService');
}
export function caseSettingClient() {
  return loadClient('case_setting.proto', 'case_setting', 'CaseSettingService');
}
export function aeoiClient() {
  return loadClient('aeoi.proto', 'aeoi', 'AeoiService');
}
export function damperLessClient() {
  return loadClient('damper_less.proto', 'damper_less', 'DamperLessService');
}
export function dashboardClient() {
  return loadClient('dashboard.proto', 'dashboard', 'DashboardService');
}
export function pinPositionClient() {
  return loadClient('pin_position.proto', 'pin_position', 'PinPositionService');
}

// ── Typed API wrappers ────────────────────────────────────────────────────────
export async function listLaserMarking(req: {
  empcode?: string;
  lot?: string;
  page?: number;
  limit?: number;
  line?: string;
  date_from?: string;
  date_to?: string;
  code2d?: string;
}) {
  const client = laserMarkingClient();
  return grpcCall<ListLaserMarkingResponse>(client, 'ListLaserMarking', {
    empcode:   req.empcode   ?? '',
    lot:       req.lot       ?? '',
    page:      req.page      ?? 1,
    limit:     req.limit     ?? 5000,
    line:      req.line      ?? '',
    date_from: req.date_from ?? '',
    date_to:   req.date_to   ?? '',
    code2d:    req.code2d    ?? '',
  });
}

export async function getLaserMarkingLines(): Promise<string[]> {
  const client = laserMarkingClient();
  const res = await grpcCall<{ lines: string[] }>(client, 'GetLines', {});
  return res.lines ?? [];
}

export async function getCaseSettingLines(): Promise<string[]> {
  const client = caseSettingClient();
  const res = await grpcCall<{ lines: string[] }>(client, 'GetLines', {});
  return res.lines ?? [];
}

export async function getAeoiLines(): Promise<string[]> {
  const client = aeoiClient();
  const res = await grpcCall<{ lines: string[] }>(client, 'GetLines', {});
  return res.lines ?? [];
}

export async function getDamperLessLines(): Promise<string[]> {
  const client = damperLessClient();
  const res = await grpcCall<{ lines: string[] }>(client, 'GetLines', {});
  return res.lines ?? [];
}

export async function listCaseSettings(req: { case_setting?: string; empcode?: string; line?: string; date_from?: string; date_to?: string; page?: number; limit?: number }) {
  const client = caseSettingClient();
  return grpcCall<ListCaseSettingsResponse>(client, 'ListCaseSettings', {
    case_setting: req.case_setting ?? '',
    empcode:      req.empcode      ?? '',
    line:         req.line         ?? '',
    date_from:    req.date_from    ?? '',
    date_to:      req.date_to      ?? '',
    page:         req.page         ?? 1,
    limit:        req.limit        ?? 100,
  });
}

export async function listAeoi(req: { lot?: string; model?: string; line?: string; arp_tray?: string; date_from?: string; date_to?: string; page?: number; limit?: number }) {
  const client = aeoiClient();
  return grpcCall<ListAeoiResponse>(client, 'ListAeoi', {
    lot:       req.lot       ?? '',
    model:     req.model     ?? '',
    line:      req.line      ?? '',
    arp_tray:  req.arp_tray  ?? '',
    date_from: req.date_from ?? '',
    date_to:   req.date_to   ?? '',
    page:      req.page      ?? 1,
    limit:     req.limit     ?? 100,
  });
}

export async function listDamperLess(req: { damper_less?: string; empcode?: string; lot?: string; arp_tray?: string; line?: string; date_from?: string; date_to?: string; page?: number; limit?: number }) {
  const client = damperLessClient();
  return grpcCall<ListDamperLessResponse>(client, 'ListDamperLess', {
    damper_less: req.damper_less ?? '',
    empcode:     req.empcode     ?? '',
    lot:         req.lot         ?? '',
    arp_tray:    req.arp_tray    ?? '',
    line:        req.line        ?? '',
    date_from:   req.date_from   ?? '',
    date_to:     req.date_to     ?? '',
    page:        req.page        ?? 1,
    limit:       req.limit       ?? 100,
  });
}

export async function listPinPosition(req: { lot?: string; code2d?: string; date_from?: string; date_to?: string; page?: number; limit?: number }) {
  const client = pinPositionClient();
  return grpcCall<ListPinPositionResponse>(client, 'ListPinPosition', {
    lot:       req.lot       ?? '',
    code2d:    req.code2d    ?? '',
    date_from: req.date_from ?? '',
    date_to:   req.date_to   ?? '',
    page:      req.page      ?? 1,
    limit:     req.limit     ?? 100,
  });
}

export async function getDashboardStats(req: { date_from: string; date_to: string }) {
  const client = dashboardClient();
  return grpcCall<DashboardStatsResponse>(client, 'GetStats', {
    date_from: req.date_from,
    date_to:   req.date_to,
  });
}

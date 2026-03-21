// Load ข้อมูล traceback 4 ขั้นตอน สำหรับ code2d หนึ่งชิ้น
// URL: /dashboard/orders/[code2d]?lot=XXX
//
// ลำดับการดึงข้อมูล (2 batch parallel):
// Batch 1: laser_marking(code2d) + pin_position(code2d) — parallel
// Batch 2: aeoi(lot+line+arp_tray_num) + damper_less(lot+line+arp_tray) — parallel

import type { PageServerLoad } from './$types';
import {
  listLaserMarking,
  listAeoi,
  listDamperLess,
  listPinPosition,
} from '$lib/server/grpc';
import type {
  LaserMarkingRecord,
  AeoiRecord,
  DamperLessRecord,
  PinPositionRecord,
} from '$lib/types/grpc';
import type { OrderDetailPageData } from '$lib/types/pages';

export interface StepData {
  aeoi:         AeoiRecord[];
  damperLess:   DamperLessRecord[];
  laserMarking: LaserMarkingRecord[];
  pinPosition:  PinPositionRecord[];
}

/** เอาส่วนหลังสุดของ arp_tray แล้ว strip leading zeros เช่น "L3UA08-1610B-07574" → "7574" */
function extractArpTrayNum(arpTray: string): string {
  const parts = arpTray.split('-');
  const last = parts[parts.length - 1] ?? '';
  return String(parseInt(last, 10) || 0);
}

export const load: PageServerLoad = async ({ params, url }): Promise<OrderDetailPageData> => {
  const code2d = decodeURIComponent(params.id);
  const lot    = url.searchParams.get('lot') ?? '';

  // ── Batch 1: ดึง laser_marking (by code2d) และ pin_position ─────────────
  const [lmRes, pinRes] = await Promise.allSettled([
    code2d ? listLaserMarking({ code2d, limit: 5 }) : Promise.resolve({ items: [], total: 0 }),
    code2d ? listPinPosition({ code2d, limit: 100 }) : Promise.resolve({ items: [], total: 0 }),
  ]);

  const laserMarkingItems: LaserMarkingRecord[] =
    lmRes.status === 'fulfilled' ? (lmRes.value.items ?? []) : [];
  const pinItems: PinPositionRecord[] =
    pinRes.status === 'fulfilled' ? (pinRes.value.items ?? []) : [];

  // หา laser_marking record ที่ตรง code2d นี้
  const thisLm    = laserMarkingItems[0] ?? null;
  const lmLine    = thisLm?.line     ?? '';
  const lmArpTray = thisLm?.arp_tray ?? '';
  const lmNo      = thisLm?.no       ?? 1;
  const arpTrayNum = extractArpTrayNum(lmArpTray);
  const posNos     = new Set([lmNo, lmNo + 12]);

  // ── Batch 2: ดึง aeoi และ damper_less ด้วย filter ตรงๆ ──────────────────
  const [aeoiRes, dlRes] = await Promise.allSettled([
    thisLm
      ? listAeoi({ lot, line: lmLine, arp_tray: arpTrayNum, limit: 50 })
      : Promise.resolve({ items: [], total: 0 }),
    thisLm
      ? listDamperLess({ lot, line: lmLine, arp_tray: lmArpTray, limit: 50 })
      : Promise.resolve({ items: [], total: 0 }),
  ]);

  const aeoiAllItems: AeoiRecord[] =
    aeoiRes.status === 'fulfilled' ? (aeoiRes.value.items ?? []) : [];
  const dlAllItems: DamperLessRecord[] =
    dlRes.status === 'fulfilled' ? (dlRes.value.items ?? []) : [];

  // Filter aeoi เฉพาะ pos_no ที่ตรง
  const aeoiItems = aeoiAllItems.filter((r) => posNos.has(r.pos_no));
  const damperLessItems = dlAllItems;

  // ── Errors (non-fatal) ───────────────────────────────────────────────────
  const errors: string[] = [];
  if (lmRes.status === 'rejected')   errors.push(`laser_marking: ${lmRes.reason}`);
  if (pinRes.status === 'rejected')  errors.push(`pin_position: ${pinRes.reason}`);
  if (aeoiRes.status === 'rejected') errors.push(`aeoi: ${aeoiRes.reason}`);
  if (dlRes.status === 'rejected')   errors.push(`damper_less: ${dlRes.reason}`);

  return {
    code2d,
    lot,
    steps: {
      aeoi:         aeoiItems,
      damperLess:   damperLessItems,
      laserMarking: laserMarkingItems,
      pinPosition:  pinItems,
    } satisfies StepData,
    grpcErrors: errors.length > 0 ? errors : null,
  };
};

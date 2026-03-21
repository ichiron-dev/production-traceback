import type { PageServerLoad } from './$types';
import { listDamperLess, getDamperLessLines } from '$lib/server/grpc';
import type { DamperLessRecord } from '$lib/types/grpc';
import type { DamperLessPageData } from '$lib/types/pages';

async function fetchAll(params: {
  damper_less: string;
  empcode: string;
  lot: string;
  arp_tray: string;
  line: string;
  date_from: string;
  date_to: string;
}): Promise<{ items: DamperLessRecord[]; total: number }> {
  const BATCH = 1000;
  const first = await listDamperLess({ ...params, page: 1, limit: BATCH });
  const total = first.total ?? 0;
  const items = [...(first.items ?? [])];

  if (items.length >= total || items.length === 0) {
    return { items, total };
  }

  const remaining = Math.ceil((total - BATCH) / BATCH);

  for (let p = 2; p <= remaining + 1; p++) {
    const r = await listDamperLess({ ...params, page: p, limit: BATCH });
    items.push(...(r.items ?? []));
    if (items.length >= total) break;
  }

  return { items, total: items.length };
}

export const load: PageServerLoad = async ({ url }): Promise<DamperLessPageData> => {
  const damperLess = url.searchParams.get('damper_less') ?? '';
  const empcode    = url.searchParams.get('empcode')     ?? '';
  const lot        = url.searchParams.get('lot')         ?? '';
  const arpTray    = url.searchParams.get('arp_tray')    ?? '';
  const line       = url.searchParams.get('line')        ?? '';
  const dateFrom   = url.searchParams.get('date_from')   ?? '';
  const dateTo     = url.searchParams.get('date_to')     ?? '';
  const searched   = url.searchParams.has('searched');

  try {
    const lines = await getDamperLessLines();

    if (!searched) {
      return {
        items:   [] as DamperLessRecord[],
        total:   0,
        lines,
        filters: { damperLess, empcode, lot, arpTray, line, dateFrom, dateTo },
        searched: false,
      };
    }

    const res = await fetchAll({
      damper_less: damperLess,
      empcode,
      lot,
      arp_tray: arpTray,
      line,
      date_from: dateFrom ? dateFrom + ' 00:00:00' : '',
      date_to:   dateTo   ? dateTo   + ' 23:59:59' : '',
    });
    return {
      items:    res.items,
      total:    res.total,
      lines,
      filters:  { damperLess, empcode, lot, arpTray, line, dateFrom, dateTo },
      searched: true,
    };
  } catch (e) {
    console.error('[gRPC] damper-less load failed:', e);
    return {
      items:     [] as DamperLessRecord[],
      total:     0,
      lines:     [] as string[],
      filters:   { damperLess, empcode, lot, arpTray, line, dateFrom, dateTo },
      searched:  true,
      grpcError: String(e),
    };
  }
};

import type { PageServerLoad } from './$types';
import { listLaserMarking, getLaserMarkingLines } from '$lib/server/grpc';
import type { LaserMarkingRecord } from '$lib/types/grpc';
import type { LaserMarkingPageData } from '$lib/types/pages';
import { bangkokDayToUtcRange } from '$lib/utils/date';

async function fetchAll(params: {
  empcode: string;
  lot: string;
  line: string;
  date_from: string;
  date_to: string;
  code2d: string;
}): Promise<{ items: LaserMarkingRecord[]; total: number }> {
  const BATCH = 1000;
  const first = await listLaserMarking({ ...params, page: 1, limit: BATCH });
  const total = first.total ?? 0;
  const items = [...(first.items ?? [])];

  if (items.length >= total || items.length === 0) {
    return { items, total };
  }

  const remaining = Math.ceil((total - BATCH) / BATCH);

  for (let p = 2; p <= remaining + 1; p++) {
    const r = await listLaserMarking({ ...params, page: p, limit: BATCH });
    items.push(...(r.items ?? []));
    if (items.length >= total) break;
  }

  return { items, total: items.length };
}

export const load: PageServerLoad = async ({ url }): Promise<LaserMarkingPageData> => {
  const empcode  = url.searchParams.get('empcode')    ?? '';
  const lot      = url.searchParams.get('lot')        ?? '';
  const line     = url.searchParams.get('line')       ?? '';
  const dateFrom = url.searchParams.get('date_from')  ?? '';
  const dateTo   = url.searchParams.get('date_to')    ?? '';
  const code2d   = url.searchParams.get('code2d')     ?? '';
  const searched = url.searchParams.has('searched');

  try {
    const lines = await getLaserMarkingLines();

    if (!searched) {
      return {
        items:   [] as LaserMarkingRecord[],
        total:   0,
        lines,
        filters: { empcode, lot, line, dateFrom, dateTo, code2d },
        searched: false,
      };
    }

    const res = await fetchAll({
      empcode,
      lot,
      line,
      date_from: dateFrom ? bangkokDayToUtcRange(dateFrom).dateFrom : '',
      date_to:   dateTo   ? bangkokDayToUtcRange(dateTo).dateTo   : '',
      code2d,
    });
    return {
      items:    res.items,
      total:    res.total,
      lines,
      filters:  { empcode, lot, line, dateFrom, dateTo, code2d },
      searched: true,
    };
  } catch (e) {
    console.error('[gRPC] laser-marking data load failed:', e);
    return {
      items:     [] as LaserMarkingRecord[],
      total:     0,
      lines:     [] as string[],
      filters:   { empcode, lot, line, dateFrom, dateTo, code2d },
      searched,
      grpcError: String(e),
    };
  }
};

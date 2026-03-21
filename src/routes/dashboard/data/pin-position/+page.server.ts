import type { PageServerLoad } from './$types';
import { listPinPosition } from '$lib/server/grpc';
import type { PinPositionRecord } from '$lib/types/grpc';
import type { PinPositionPageData } from '$lib/types/pages';

async function fetchAll(params: {
  lot: string;
  code2d: string;
  date_from: string;
  date_to: string;
}): Promise<{ items: PinPositionRecord[]; total: number }> {
  const BATCH = 1000;
  const first = await listPinPosition({ ...params, page: 1, limit: BATCH });
  const total = first.total ?? 0;
  const items = [...(first.items ?? [])];

  if (items.length >= total || items.length === 0) {
    return { items, total };
  }

  const remaining = Math.ceil((total - BATCH) / BATCH);

  for (let p = 2; p <= remaining + 1; p++) {
    const r = await listPinPosition({ ...params, page: p, limit: BATCH });
    items.push(...(r.items ?? []));
    if (items.length >= total) break;
  }

  return { items, total: items.length };
}

export const load: PageServerLoad = async ({ url }): Promise<PinPositionPageData> => {
  const lot      = url.searchParams.get('lot')       ?? '';
  const code2d   = url.searchParams.get('code2d')    ?? '';
  const dateFrom = url.searchParams.get('date_from') ?? '';
  const dateTo   = url.searchParams.get('date_to')   ?? '';
  const searched = url.searchParams.has('searched');

  if (!searched) {
    return {
      items:   [] as PinPositionRecord[],
      total:   0,
      filters: { lot, code2d, dateFrom, dateTo },
      searched: false,
    };
  }

  try {
    const res = await fetchAll({
      lot,
      code2d,
      date_from: dateFrom ? dateFrom + ' 00:00:00' : '',
      date_to:   dateTo   ? dateTo   + ' 23:59:59' : '',
    });
    return {
      items:    res.items,
      total:    res.total,
      filters:  { lot, code2d, dateFrom, dateTo },
      searched: true,
    };
  } catch (e) {
    console.error('[gRPC] pin-position load failed:', e);
    return {
      items:     [] as PinPositionRecord[],
      total:     0,
      filters:   { lot, code2d, dateFrom, dateTo },
      searched:  true,
      grpcError: String(e),
    };
  }
};

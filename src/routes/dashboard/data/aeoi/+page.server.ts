import type { PageServerLoad } from './$types';
import { listAeoi, getAeoiLines } from '$lib/server/grpc';
import type { AeoiRecord } from '$lib/types/grpc';
import type { AeoiPageData } from '$lib/types/pages';

async function fetchAll(params: {
  lot: string;
  model: string;
  line: string;
  arp_tray: string;
  date_from: string;
  date_to: string;
}): Promise<{ items: AeoiRecord[]; total: number }> {
  const BATCH = 1000;
  const first = await listAeoi({ ...params, page: 1, limit: BATCH });
  const total = first.total ?? 0;
  const items = [...(first.items ?? [])];

  if (items.length >= total || items.length === 0) {
    return { items, total };
  }

  const remaining = Math.ceil((total - BATCH) / BATCH);

  for (let p = 2; p <= remaining + 1; p++) {
    const r = await listAeoi({ ...params, page: p, limit: BATCH });
    items.push(...(r.items ?? []));
    if (items.length >= total) break;
  }

  return { items, total: items.length };
}

export const load: PageServerLoad = async ({ url }): Promise<AeoiPageData> => {
  const lot      = url.searchParams.get('lot')      ?? '';
  const model    = url.searchParams.get('model')    ?? '';
  const line     = url.searchParams.get('line')     ?? '';
  const arpTray  = url.searchParams.get('arp_tray') ?? '';
  const dateFrom = url.searchParams.get('date_from') ?? '';
  const dateTo   = url.searchParams.get('date_to')   ?? '';
  const searched = url.searchParams.has('searched');

  try {
    const lines = await getAeoiLines();

    if (!searched) {
      return {
        items:   [] as AeoiRecord[],
        total:   0,
        lines,
        filters: { lot, model, line, arpTray, dateFrom, dateTo },
        searched: false,
      };
    }

    const res = await fetchAll({
      lot,
      model,
      line,
      arp_tray: arpTray,
      date_from: dateFrom ? dateFrom + ' 00:00:00' : '',
      date_to:   dateTo   ? dateTo   + ' 23:59:59' : '',
    });
    return {
      items:    res.items,
      total:    res.total,
      lines,
      filters:  { lot, model, line, arpTray, dateFrom, dateTo },
      searched: true,
    };
  } catch (e) {
    console.error('[gRPC] aeoi load failed:', e);
    return {
      items:     [] as AeoiRecord[],
      total:     0,
      lines:     [] as string[],
      filters:   { lot, model, line, arpTray, dateFrom, dateTo },
      searched:  true,
      grpcError: String(e),
    };
  }
};

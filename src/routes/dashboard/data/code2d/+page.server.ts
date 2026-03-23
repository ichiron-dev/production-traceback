import type { PageServerLoad } from './$types';
import { listLaserMarking, getLaserMarkingLines } from '$lib/server/grpc';
import type { LaserMarkingRecord } from '$lib/types/grpc';
import type { Code2dPageData } from '$lib/types/pages';
import { bangkokDayToUtcRange } from '$lib/utils/date';

async function fetchAllLaserMarking(params: {
  line: string;
  date_from: string;
  date_to: string;
}): Promise<{ items: LaserMarkingRecord[]; total: number }> {
  const BATCH = 1000;
  const first = await listLaserMarking({ ...params, page: 1, limit: BATCH });
  const total  = first.total ?? 0;
  const items  = [...(first.items ?? [])];

  if (items.length >= total || !(first.items ?? []).length) {
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

export const load: PageServerLoad = async ({ url }): Promise<Code2dPageData> => {
  const line     = url.searchParams.get('line')      ?? '';
  const dateFrom = url.searchParams.get('date_from') ?? '';
  const dateTo   = url.searchParams.get('date_to')   ?? '';

  const shouldFetch = line !== '' && dateFrom !== '' && dateTo !== '';

  try {
    const [linesRes, itemsRes] = await Promise.allSettled([
      getLaserMarkingLines(),
      shouldFetch
        ? fetchAllLaserMarking({
            line,
            date_from: bangkokDayToUtcRange(dateFrom).dateFrom,
            date_to:   bangkokDayToUtcRange(dateTo).dateTo,
          })
        : Promise.resolve({ items: [] as LaserMarkingRecord[], total: 0 }),
    ]);

    const lines = linesRes.status === 'fulfilled' ? linesRes.value : [];
    const res   = itemsRes.status === 'fulfilled'  ? itemsRes.value : { items: [], total: 0 };

    const errors: string[] = [];
    if (linesRes.status === 'rejected') errors.push(`GetLines: ${linesRes.reason}`);
    if (itemsRes.status === 'rejected') errors.push(`ListLaserMarking: ${itemsRes.reason}`);

    return {
      items:     res.items,
      total:     res.total,
      lines,
      filters:   { line, dateFrom, dateTo },
      grpcError: errors.length > 0 ? errors.join('; ') : undefined,
    };
  } catch (e) {
    console.error('[gRPC] code2d load failed:', e);
    return {
      items:     [] as LaserMarkingRecord[],
      total:     0,
      lines:     [],
      filters:   { line, dateFrom, dateTo },
      grpcError: String(e),
    };
  }
};

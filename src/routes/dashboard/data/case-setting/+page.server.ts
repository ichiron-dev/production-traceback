import type { PageServerLoad } from './$types';
import { listCaseSettings, getCaseSettingLines } from '$lib/server/grpc';
import type { CaseSettingRecord } from '$lib/types/grpc';
import type { CaseSettingPageData } from '$lib/types/pages';
import { bangkokDayToUtcRange } from '$lib/utils/date';

async function fetchAll(params: {
  case_setting: string;
  empcode: string;
  line: string;
  date_from: string;
  date_to: string;
}): Promise<{ items: CaseSettingRecord[]; total: number }> {
  const BATCH = 1000;
  const first = await listCaseSettings({ ...params, page: 1, limit: BATCH });
  const total = first.total ?? 0;
  const items = [...(first.settings ?? [])];

  if (items.length >= total || items.length === 0) {
    return { items, total };
  }

  const remaining = Math.ceil((total - BATCH) / BATCH);

  for (let p = 2; p <= remaining + 1; p++) {
    const r = await listCaseSettings({ ...params, page: p, limit: BATCH });
    items.push(...(r.settings ?? []));
    if (items.length >= total) break;
  }

  return { items, total: items.length };
}

export const load: PageServerLoad = async ({ url }): Promise<CaseSettingPageData> => {
  const caseSetting = url.searchParams.get('case_setting') ?? '';
  const empcode     = url.searchParams.get('empcode')      ?? '';
  const line        = url.searchParams.get('line')         ?? '';
  const dateFrom    = url.searchParams.get('date_from')    ?? '';
  const dateTo      = url.searchParams.get('date_to')      ?? '';
  const searched    = url.searchParams.has('searched');

  try {
    const lines = await getCaseSettingLines();

    if (!searched) {
      return {
        items:   [] as CaseSettingRecord[],
        total:   0,
        lines,
        filters: { caseSetting, empcode, line, dateFrom, dateTo },
        searched: false,
      };
    }

    const res = await fetchAll({
      case_setting: caseSetting,
      empcode,
      line,
      date_from: dateFrom ? bangkokDayToUtcRange(dateFrom).dateFrom : '',
      date_to:   dateTo   ? bangkokDayToUtcRange(dateTo).dateTo   : '',
    });
    return {
      items:    res.items,
      total:    res.total,
      lines,
      filters:  { caseSetting, empcode, line, dateFrom, dateTo },
      searched: true,
    };
  } catch (e) {
    console.error('[gRPC] case-setting load failed:', e);
    return {
      items:     [] as CaseSettingRecord[],
      total:     0,
      lines:     [] as string[],
      filters:   { caseSetting, empcode, line, dateFrom, dateTo },
      searched,
      grpcError: String(e),
    };
  }
};

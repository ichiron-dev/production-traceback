import type { PageServerLoad } from './$types';
import { getDashboardStats } from '$lib/server/grpc';
import type { DashboardPageData } from '$lib/types/pages';
import { bangkokDayToUtcRange, todayBangkok } from '$lib/utils/date';

export const load: PageServerLoad = async ({ url }): Promise<DashboardPageData> => {
  const selectedDate = url.searchParams.get('date') ?? todayBangkok();

  const { dateFrom, dateTo } = bangkokDayToUtcRange(selectedDate);

  try {
    const stats = await getDashboardStats({ date_from: dateFrom, date_to: dateTo });

    // ── รวมทุก line เป็น summary overall ────────────────────────────────────
    const lmTotal = stats.laser_marking.reduce((s, r) => s + r.total, 0);
    const csTotal = stats.case_setting.reduce((s, r) => s + r.total, 0);
    const dlTotal = stats.damper_less.reduce((s, r) => s + r.total, 0);

    const aeoiTotal = stats.aeoi.reduce((s, r) => s + r.total, 0);
    const aeoiPass = stats.aeoi.reduce((s, r) => s + r.g, 0);
    const aeoiNg = stats.aeoi.reduce((s, r) => s + r.ng, 0);
    const aeoiRate = aeoiTotal > 0 ? Math.round((aeoiPass / aeoiTotal) * 100) : null;

    const ppTotal = stats.pin_position.reduce((s, r) => s + r.total, 0);
    const ppPass = stats.pin_position.reduce((s, r) => s + r.g, 0);
    const ppNg = stats.pin_position.reduce((s, r) => s + r.ng, 0);
    const ppRate = ppTotal > 0 ? Math.round((ppPass / ppTotal) * 100) : null;

    // ── รวม lines จากทุก process ──────────────────────────────────────────────
    const lineSet = new Set<string>([
      ...stats.laser_marking.map(r => r.line),
      ...stats.case_setting.map(r => r.line),
      ...stats.aeoi.map(r => r.line),
      ...stats.damper_less.map(r => r.line),
      ...stats.pin_position.map(r => r.line),
    ].filter(Boolean));

    const lineStats = Array.from(lineSet).sort().map(line => {
      const lm = stats.laser_marking.find(r => r.line === line);
      const cs = stats.case_setting.find(r => r.line === line);
      const a = stats.aeoi.find(r => r.line === line);
      const dl = stats.damper_less.find(r => r.line === line);
      const pp = stats.pin_position.find(r => r.line === line);

      const aRate = a && a.total > 0 ? Math.round((a.g / a.total) * 100) : null;
      const pRate = pp && pp.total > 0 ? Math.round((pp.g / pp.total) * 100) : null;

      return {
        line,
        laserMarking: lm?.total ?? 0,
        caseSetting: cs?.total ?? 0,
        aeoi: { total: a?.total ?? 0, pass: a?.g ?? 0, ng: a?.ng ?? 0, rate: aRate },
        damperLess: dl?.total ?? 0,
        pinPosition: { total: pp?.total ?? 0, pass: pp?.g ?? 0, ng: pp?.ng ?? 0, rate: pRate },
      };
    });

    return {
      selectedDate,
      summary: {
        laserMarking: lmTotal,
        caseSetting: csTotal,
        aeoi: { total: aeoiTotal, pass: aeoiPass, ng: aeoiNg, rate: aeoiRate },
        damperLess: dlTotal,
        pinPosition: { total: ppTotal, pass: ppPass, ng: ppNg, rate: ppRate },
      },
      lineStats,
    };
  } catch (e) {
    console.error('[gRPC] dashboard stats load failed:', e);
    return {
      selectedDate,
      summary: {
        laserMarking: 0,
        caseSetting: 0,
        aeoi: { total: 0, pass: 0, ng: 0, rate: null as number | null },
        damperLess: 0,
        pinPosition: { total: 0, pass: 0, ng: 0, rate: null as number | null },
      },
      lineStats: [] as Array<{
        line: string;
        laserMarking: number;
        caseSetting: number;
        aeoi: { total: number; pass: number; ng: number; rate: number | null };
        damperLess: number;
        pinPosition: { total: number; pass: number; ng: number; rate: number | null };
      }>,
      grpcError: String(e),
    };
  }
};

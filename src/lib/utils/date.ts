/** offset ของ Bangkok (UTC+7) เป็นมิลลิวินาที */
const BANGKOK_OFFSET_MS = 7 * 3_600_000;

/**
 * แปลง date string (YYYY-MM-DD) ตาม Bangkok local time
 * เป็น UTC timestamp range สำหรับ gRPC server (UTC session)
 *
 * ตัวอย่าง:
 *   "2026-03-22"  →  { dateFrom: "2026-03-21 17:00:00",
 *                       dateTo:   "2026-03-22 16:59:59" }
 *
 * เหตุผล: Bangkok UTC+7  →  UTC = Bangkok − 7h
 *   Bangkok 2026-03-22 00:00:00  =  UTC 2026-03-21 17:00:00
 *   Bangkok 2026-03-22 23:59:59  =  UTC 2026-03-22 16:59:59
 */
export function bangkokDayToUtcRange(date: string): { dateFrom: string; dateTo: string } {
	const [year, month, day] = date.split('-').map(Number);

	const fromMs = Date.UTC(year, month - 1, day) - BANGKOK_OFFSET_MS; // Bangkok midnight → UTC
	const toMs = fromMs + 24 * 3_600_000 - 1_000; //  +24h −1s = Bangkok 23:59:59

	const fmt = (ms: number) => new Date(ms).toISOString().replace('T', ' ').slice(0, 19);

	return { dateFrom: fmt(fromMs), dateTo: fmt(toMs) };
}

/**
 * วันนี้ตาม Bangkok local time (YYYY-MM-DD)
 * ใช้แทน new Date().toISOString().slice(0,10) ซึ่ง return UTC date (อาจผิดวัน)
 */
export function todayBangkok(): string {
	return new Date(Date.now() + BANGKOK_OFFSET_MS).toISOString().slice(0, 10);
}

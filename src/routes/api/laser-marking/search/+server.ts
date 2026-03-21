import { json }             from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { listLaserMarking } from '$lib/server/grpc';

/**
 * POST /api/laser-marking/search
 * Body: { codes: string[] }
 * ค้นหา laser_marking โดย code2d โดยไม่ใช้ line / date filter
 */
export async function POST({ request }: RequestEvent) {
  try {
    const body = (await request.json()) as { codes?: string[] };
    const codes = body.codes ?? [];

    if (codes.length === 0) return json({ items: [] });

    // Fetch ทุก code2d พร้อมกัน (แต่ละ code2d = 1 record)
    const CHUNK = 20; // batch 20 parallel calls ต่อรอบ
    const allItems = [];

    for (let i = 0; i < codes.length; i += CHUNK) {
      const chunk   = codes.slice(i, i + CHUNK);
      const results = await Promise.all(
        chunk.map((c) => listLaserMarking({ code2d: c, limit: 1 })),
      );
      for (const r of results) allItems.push(...(r.items ?? []));
    }

    return json({ items: allItems });
  } catch (e) {
    console.error('[API] laser-marking/search failed:', e);
    return json({ items: [], error: String(e) }, { status: 500 });
  }
};

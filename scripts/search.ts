// Adapted from GoogleChrome Modern Web Guidance search.ts. Rank local pages; retain old vectors as a guide-level prior.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { bm25, topicId, type Page } from './guides.ts';
import { rankBm25, reciprocalRankFusion } from './bm25.ts';
import { StaticEmbedder } from './static-embedder.ts';
import { STATIC_DIMS, dequantizeVectorRow, toAlignedFloat32Array } from './quantize.ts';

const prior = new URL('../assets/search/semantic/', import.meta.url);
let cache: { id: string; vector: Float32Array }[] | undefined;
function guideScores(query: string, allowed: Set<string>) {
  if (!cache) {
    const read = (name: string) => fs.readFileSync(fileURLToPath(new URL(name, prior)));
    const ids = JSON.parse(read('guide-ids.json').toString()) as string[];
    const bytes = Int8Array.from(read('guide-chunks.i8'));
    const scales = toAlignedFloat32Array(read('guide-chunks.scale.f32'));
    if (ids.length !== scales.length || bytes.length !== ids.length * STATIC_DIMS)
      throw Error('Invalid guide vector dimensions');
    cache = ids
      .map((id, i) => ({ id, vector: dequantizeVectorRow(bytes, scales, i) }))
      .filter((row) => row.vector.length);
  }
  const v = StaticEmbedder.getInstance().embedSync(query);
  const scores = new Map<string, number>();
  for (const row of cache) {
    if (!allowed.has(row.id)) continue;
    let score = 0;
    for (let i = 0; i < v.length; i++) score += v[i] * row.vector[i];
    if (score > (scores.get(row.id) ?? -Infinity)) scores.set(row.id, score);
  }
  return scores;
}
export function search(pages: Page[], query: string, limit: number, lexicalOnly: boolean) {
  if (!pages.length) return [];
  const byPath = new Map(pages.map((p) => [p.page, p]));
  const defaults = new Map<string, Page>();
  for (const p of pages) {
    if (
      !defaults.has(p.id) ||
      (p.edition === 'authored' && defaults.get(p.id)!.edition !== 'authored')
    )
      defaults.set(p.id, p);
  }
  const ranked = rankBm25(bm25(pages), query);
  const hits = new Map<string, Page>();
  for (const hit of ranked) {
    const p = byPath.get(hit.id)!;
    if (!hits.has(p.id)) hits.set(p.id, p);
  }
  const lexical = [...hits.keys()];
  const scores = lexicalOnly
    ? new Map<string, number>()
    : guideScores(query, new Set(defaults.keys()));
  const dense = [...scores].sort((a, b) => b[1] - a[1]);
  const enabled = (dense[0]?.[1] ?? 0) >= 0.3;
  const fused = reciprocalRankFusion([enabled ? dense.map((x) => x[0]) : [], lexical]).map(
    (x) => x.id,
  );
  const slots = lexical.slice(0, limit).map((id) => (!scores.has(id) ? id : null));
  const reserved = new Set(slots.filter(Boolean));
  const fill = fused.filter((id) => !reserved.has(id));
  const results = Array.from({ length: limit }, (_, i) => slots[i] ?? fill.shift()).filter(
    (id): id is string => Boolean(id),
  );
  const exact = topicId(query.trim().toLowerCase());
  if (defaults.has(exact))
    results.splice(0, results.length, exact, ...results.filter((id) => id !== exact));
  return results.slice(0, limit).map((id) => {
    const p = hits.get(id) ?? defaults.get(id)!;
    return {
      id,
      edition: p.edition,
      page: p.page,
      section: p.section,
      scopeOnly: p.scopeOnly,
      match: id === exact ? 'exact-id' : hits.has(id) ? 'section-suggestion' : 'guide-suggestion',
    };
  });
}

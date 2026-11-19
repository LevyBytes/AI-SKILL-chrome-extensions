// Modern Web Guidance port: local catalogs and reference pages replace the upstream release tree.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, randomUUID } from 'node:crypto';
import { gzipSync, gunzipSync } from 'node:zlib';
import { tokenizeBm25, type Bm25Index } from './bm25.ts';

export const root = fileURLToPath(new URL('../', import.meta.url));
const refRoot = path.join(root, 'references');
const data = path.join(root, 'assets', 'search', 'pages.json.gz');
const sum = (text: string) => createHash('sha256').update(text).digest('hex');
export function topicId(value: string) {
  // The published corpus names the same document both prompt-api and language-model.
  return value === 'prompt-api' ? 'language-model' : value;
}
const namespace: Record<string, string> = {
  'extension-development': 'extension',
  'extension-distribution': 'webstore',
  'feature-support': 'feature',
  'upstream-operations': 'upstream',
};
export type Edition = 'authored' | 'published' | 'expectations' | 'source';
export interface Page {
  id: string;
  area: string;
  title: string;
  section: string;
  edition: Edition;
  page: string;
  entry: string;
  hash: string;
  scopeOnly: boolean;
  aliases: string[];
  length: number;
  terms: [string, number][];
}
export interface Index {
  version: number;
  pages: Page[];
}
interface Topic {
  topic: string;
  file: string;
  summary: string;
  keywords: string[];
}

function within(parent: string, child: string) {
  const diff = path.relative(parent, child);
  return (
    diff !== '' && !path.isAbsolute(diff) && diff !== '..' && !diff.startsWith('..' + path.sep)
  );
}
export function readReference(name: string) {
  if (!name.startsWith('references/') || !name.endsWith('.md'))
    throw Error('Expected a local Markdown reference');
  const file = fs.realpathSync(path.resolve(root, name));
  if (!within(fs.realpathSync(refRoot), file)) throw Error('Reference outside skill');
  return fs.readFileSync(file, 'utf8');
}

export function buildIndex(): Index {
  const pages: Page[] = [];
  const seen = new Set<string>();
  for (const area of fs.readdirSync(refRoot).sort()) {
    const dir = path.join(refRoot, area);
    if (!fs.lstatSync(dir).isDirectory()) continue;
    for (const edition of ['authored', 'published', 'expectations', 'source'] as const) {
      const catalog = path.join(dir, edition + '-topics.json');
      if (!fs.existsSync(catalog)) continue;
      const { topics } = JSON.parse(fs.readFileSync(catalog, 'utf8')) as { topics: Topic[] };
      for (const topic of topics) {
        if (topic.file === 'references/languages.md') continue;
        const key = topic.keywords[0];
        if (!key) throw Error('Missing topic key in ' + catalog);
        const id = namespace[area] ? namespace[area] + '/' + key : key;
        const parent = path.posix.dirname(topic.file);
        if (!parent.startsWith('references/' + area + '/') && parent !== 'references/' + area)
          throw Error('Misplaced catalog target: ' + topic.file);
        const firstText = readReference(topic.file);
        let targets = [topic.file];
        if (parent !== 'references/' + area) {
          const names = fs
            .readdirSync(path.join(root, parent))
            .filter((s) => s.endsWith('.md') && s !== 'index.md')
            .sort();
          if (path.posix.basename(topic.file) === 'index.md') {
            const ordered = [...firstText.matchAll(/^\s*-\s+\[.*?\]\(([^)]+\.md)\)\s*$/gm)].map(
              (m) => m[1],
            );
            if (
              ordered.length !== names.length ||
              new Set(ordered).size !== names.length ||
              ordered.some((n) => !names.includes(n))
            )
              throw Error('Incomplete section order: ' + topic.file);
            targets = ordered.map((n) => parent + '/' + n);
          } else {
            targets = [
              topic.file,
              ...names.map((n) => parent + '/' + n).filter((n) => n !== topic.file),
            ];
          }
        }
        for (const name of targets) {
          if (seen.has(name)) throw Error('Repeated catalog destination: ' + name);
          seen.add(name);
          const full = readReference(name);
          const lines = full.trimEnd().split('\n');
          if (!lines.at(-1)?.includes('[Original document]('))
            throw Error('Missing source footer: ' + name);
          const body = lines
            .slice(0, -1)
            .filter(
              (l) => !l.startsWith('Related section:') && !l.startsWith('[Complete example]('),
            )
            .join('\n');
          const section = path.posix.basename(name, '.md').replaceAll('-', ' ');
          const searchable = [
            key,
            key.replaceAll('-', ' '),
            topic.summary,
            section,
            body
              .replace(/https?:\/\/[^\s)]+/g, '')
              .replaceAll('npx -y modern-web-guidance@latest retrieve', ''),
          ].join('\n');
          const tokens = tokenizeBm25(searchable);
          const counts = new Map<string, number>();
          for (const token of tokens) counts.set(token, (counts.get(token) ?? 0) + 1);
          pages.push({
            id,
            area,
            title: topic.topic,
            section,
            edition,
            page: name,
            entry: topic.file,
            hash: sum(full),
            scopeOnly: /^\s*```yaml\n---\n[\s\S]*?\n---\n```\s*$/.test(body),
            aliases: topic.keywords.slice(2),
            length: tokens.length,
            terms: [...counts],
          });
        }
      }
    }
  }
  if (!pages.length) throw Error('No catalogued content pages found');
  return { version: 1, pages };
}
export function saveIndex() {
  const index = buildIndex();
  fs.mkdirSync(path.dirname(data), { recursive: true });
  const tmp = data + '.' + randomUUID() + '.tmp';
  try {
    fs.writeFileSync(tmp, gzipSync(JSON.stringify(index)), { flag: 'wx' });
    fs.renameSync(tmp, data);
  } finally {
    fs.rmSync(tmp, { force: true });
  }
  return { pages: index.pages.length, topics: new Set(index.pages.map((p) => p.id)).size };
}
export function loadIndex(): Index {
  if (!fs.existsSync(data)) throw Error('Missing search index. Run lookup.ts rebuild.');
  const result = JSON.parse(gunzipSync(fs.readFileSync(data)).toString('utf8')) as Index;
  if (result.version !== 1 || !Array.isArray(result.pages) || !result.pages.length)
    throw Error('Unsupported search index. Run lookup.ts rebuild.');
  return result;
}
export function bm25(pages: Page[]): Bm25Index {
  const docFreq = new Map<string, number>();
  const docs = pages.map((p) => {
    for (const [word] of p.terms) docFreq.set(word, (docFreq.get(word) ?? 0) + 1);
    return { id: p.page, length: p.length, freqs: new Map(p.terms) };
  });
  return { docs, docFreq, avgDocLength: docs.reduce((n, d) => n + d.length, 0) / docs.length };
}
export function readPage(page: Page) {
  const text = readReference(page.page);
  if (sum(text) !== page.hash)
    throw Error('Changed reference: ' + page.page + '. Rebuild the index.');
  return text;
}

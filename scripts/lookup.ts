import { parseArgs } from 'node:util';
import { buildIndex, loadIndex, saveIndex } from './guides.ts';
import { search } from './search.ts';
import { retrieve } from './retrieve.ts';

const help = `Local web reference lookup (Node 22.18+)
  node scripts/lookup.ts search "input validation" [--limit 5] [--lexical]
  node scripts/lookup.ts list [--area form-controls] [--edition expectations]
  node scripts/lookup.ts retrieve <topic-id|local-page> [--edition published]
  node scripts/lookup.ts rebuild
  node scripts/lookup.ts verify

Search and list write JSON; retrieve writes the original Markdown with attribution.
Search results are suggestions. Filter search, list or retrieval by area and edition.
Rebuild creates the lexical index from the local reference tree. Verify checks freshness.`;

function run() {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      help: { type: 'boolean', short: 'h' },
      area: { type: 'string' },
      edition: { type: 'string' },
      limit: { type: 'string' },
      lexical: { type: 'boolean' },
    },
  });
  const [command, ...args] = positionals;
  if (values.help || !command) {
    console.log(help);
    return;
  }
  if (!['list', 'search', 'retrieve', 'verify', 'rebuild'].includes(command))
    throw Error('Unknown command: ' + command);
  if (
    (command === 'retrieve' && args.length !== 1) ||
    (command === 'search' && !args.join(' ').trim()) ||
    (!['retrieve', 'search'].includes(command) && args.length)
  )
    throw Error('Invalid operands. Use --help.');
  if (command !== 'search' && (values.limit !== undefined || values.lexical))
    throw Error('--limit and --lexical apply to search.');
  if ((command === 'verify' || command === 'rebuild') && (values.area || values.edition))
    throw Error('Index operations apply to all areas and editions.');
  if (command === 'rebuild') {
    console.log(JSON.stringify(saveIndex()));
    return;
  }
  const index = loadIndex();
  if (command === 'verify') {
    if (JSON.stringify(buildIndex()) !== JSON.stringify(index))
      throw Error('Stale index. Run lookup.ts rebuild.');
    console.log(JSON.stringify({ verified: true, pages: index.pages.length }));
    return;
  }
  if (
    values.edition &&
    !['authored', 'published', 'source', 'expectations'].includes(values.edition)
  )
    throw Error('Unknown edition: ' + values.edition);
  if (values.area && !index.pages.some((p) => p.area === values.area))
    throw Error('Unknown area: ' + values.area);
  const pages = index.pages.filter(
    (p) =>
      (!values.area || p.area === values.area) && (!values.edition || p.edition === values.edition),
  );
  if (command === 'retrieve') {
    process.stdout.write(retrieve(pages, args[0]));
    return;
  }
  if (command === 'search') {
    const limit = Number(values.limit ?? 5);
    if (!Number.isInteger(limit) || limit < 1 || limit > 50)
      throw Error('--limit requires an integer from 1 to 50.');
    console.log(
      JSON.stringify(search(pages, args.join(' '), limit, Boolean(values.lexical)), null, 2),
    );
    return;
  }
  const entries = [
    ...new Map(
      pages.map((p) => [
        p.entry,
        { id: p.id, title: p.title, area: p.area, edition: p.edition, entry: p.entry },
      ]),
    ).values(),
  ];
  console.log(JSON.stringify(entries, null, 2));
}
try {
  run();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}

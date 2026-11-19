// Adapted from GoogleChrome Modern Web Guidance retrieve.ts. Preserve local source text and attribution.
import { readPage, topicId, type Page } from './guides.ts';

export function retrieve(pages: Page[], selector: string) {
  const specific = pages.find((p) => p.page === selector);
  if (specific) return readPage(specific);
  let found = pages.filter((p) => p.id === topicId(selector) || p.entry === selector);
  if (!found.length) throw Error('Unknown topic or page: ' + selector + '. Use list or search.');
  const edition = ['authored', 'source', 'published', 'expectations'].find((ed) =>
    found.some((p) => p.edition === ed),
  );
  found = found.filter((p) => p.edition === edition);
  return found.map(readPage).join('\n');
}

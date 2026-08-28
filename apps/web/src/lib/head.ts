/**
 * Imperative <head> management.
 *
 * React 18 has no built-in head support and pulling in react-helmet for a site
 * this size is not worth the bytes. Every tag this writes carries
 * `data-seo="1"`, and each render clears the previous set — so navigating never
 * leaves the last page's description or JSON-LD behind.
 */

const MARK = 'data-seo';

export interface MetaTag {
  name?: string;
  property?: string;
  content: string;
}

export interface LinkTag {
  rel: string;
  href: string;
  hreflang?: string;
}

export function applyHead(options: {
  title: string;
  meta: MetaTag[];
  links: LinkTag[];
  jsonLd: unknown[];
  lang: string;
}): void {
  document.title = options.title;
  document.documentElement.lang = options.lang;

  // Remove everything the previous page put here before writing the new set.
  document.head.querySelectorAll(`[${MARK}]`).forEach((el) => el.remove());

  const frag = document.createDocumentFragment();

  for (const m of options.meta) {
    if (!m.content) continue;
    const el = document.createElement('meta');
    if (m.name) el.setAttribute('name', m.name);
    if (m.property) el.setAttribute('property', m.property);
    el.setAttribute('content', m.content);
    el.setAttribute(MARK, '1');
    frag.appendChild(el);
  }

  for (const l of options.links) {
    const el = document.createElement('link');
    el.setAttribute('rel', l.rel);
    el.setAttribute('href', l.href);
    if (l.hreflang) el.setAttribute('hreflang', l.hreflang);
    el.setAttribute(MARK, '1');
    frag.appendChild(el);
  }

  for (const data of options.jsonLd) {
    if (!data) continue;
    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.textContent = JSON.stringify(data);
    el.setAttribute(MARK, '1');
    frag.appendChild(el);
  }

  document.head.appendChild(frag);
}

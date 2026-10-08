// Pure SEO helpers (no Astro imports): canonical URLs, hreflang alternates, meta and JSON-LD.
import { locales, localePath, stripLocale, type Locale } from '../i18n/ui.ts';

export const OG_LOCALE: Record<Locale, string> = { en: 'en_US', es: 'es_ES' };

/** Locale-agnostic path ("/", "/about", "/projects/x") from any pathname, without a trailing slash (except root). */
export function basePath(pathname: string): string {
  const p = stripLocale(pathname);
  return p.length > 1 ? p.replace(/\/+$/, '') : '/';
}

/** Public URL of a page in a locale. Root pages keep their trailing slash; deeper pages have none. */
export function pageUrl(site: string, locale: Locale, path: string): string {
  const root = site.replace(/\/+$/, '');
  return root + localePath(locale, path === '' ? '/' : path).replace(/(.)\/$/, '$1').replace(/^\/es$/, '/es/');
}

export interface Alternate { hreflang: string; href: string }

/** One alternate per locale plus x-default (the default-locale page). */
export function alternates(site: string, path: string): Alternate[] {
  return [
    ...locales.map((l) => ({ hreflang: l, href: pageUrl(site, l, path) })),
    { hreflang: 'x-default', href: pageUrl(site, 'en', path) },
  ];
}

export interface MetaInput {
  site: string; locale: Locale; path: string; title: string; description: string; image: string; type?: 'website' | 'article';
}
export interface MetaTag { attr: 'name' | 'property'; key: string; content: string }

export function metaTags(m: MetaInput): MetaTag[] {
  const url = pageUrl(m.site, m.locale, m.path);
  const other = locales.find((l) => l !== m.locale)!;
  return [
    { attr: 'property', key: 'og:type', content: m.type ?? 'website' },
    { attr: 'property', key: 'og:site_name', content: 'Alexei Rojas Quiroga' },
    { attr: 'property', key: 'og:title', content: m.title },
    { attr: 'property', key: 'og:description', content: m.description },
    { attr: 'property', key: 'og:url', content: url },
    { attr: 'property', key: 'og:image', content: m.image },
    { attr: 'property', key: 'og:image:width', content: '1200' },
    { attr: 'property', key: 'og:image:height', content: '630' },
    { attr: 'property', key: 'og:locale', content: OG_LOCALE[m.locale] },
    { attr: 'property', key: 'og:locale:alternate', content: OG_LOCALE[other] },
    { attr: 'name', key: 'twitter:card', content: 'summary_large_image' },
    { attr: 'name', key: 'twitter:title', content: m.title },
    { attr: 'name', key: 'twitter:description', content: m.description },
    { attr: 'name', key: 'twitter:image', content: m.image },
  ];
}

/** Google shows ~155-160 characters; keep descriptions inside that. */
export function clampDescription(s: string, max = 158): string {
  const t = s.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1).replace(/[\s,.;:—-]+\S*$/, '') + '…';
}

export function ogImagePath(kind: 'page' | 'project', key: string, locale: Locale): string {
  return kind === 'project' ? `/og/projects/${key}-${locale}.png` : `/og/${key}-${locale}.png`;
}

export function personJsonLd(o: { site: string; name: string; jobTitle: string; sameAs: readonly string[]; knowsAbout: string[]; locale: Locale; description: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: o.name,
    jobTitle: o.jobTitle,
    url: pageUrl(o.site, o.locale, '/'),
    description: o.description,
    sameAs: [...o.sameAs],
    knowsAbout: o.knowsAbout,
    inLanguage: o.locale,
  };
}

export function projectJsonLd(o: {
  site: string; locale: Locale; slug: string; name: string; description: string; image: string;
  github: string | null; live: string | null; keywords: string[]; authorName: string;
}) {
  const url = pageUrl(o.site, o.locale, `/projects/${o.slug}`);
  return {
    '@context': 'https://schema.org',
    '@type': o.github ? 'SoftwareSourceCode' : 'CreativeWork',
    name: o.name,
    description: o.description,
    url,
    image: o.image,
    inLanguage: o.locale,
    keywords: o.keywords.join(', '),
    author: { '@type': 'Person', name: o.authorName },
    ...(o.github ? { codeRepository: o.github } : {}),
    ...(o.live ? { sameAs: [o.live] } : {}),
  };
}

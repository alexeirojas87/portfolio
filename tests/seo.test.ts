import { test } from 'node:test';
import assert from 'node:assert/strict';
import { alternates, basePath, clampDescription, metaTags, ogImagePath, pageUrl, personJsonLd, projectJsonLd } from '../src/lib/seo.ts';

const SITE = 'https://alexeirojas.dev';

test('pageUrl: root pages keep the slash, deeper pages have none, es is prefixed', () => {
  assert.equal(pageUrl(SITE, 'en', '/'), `${SITE}/`);
  assert.equal(pageUrl(SITE, 'es', '/'), `${SITE}/es/`);
  assert.equal(pageUrl(SITE, 'en', '/about'), `${SITE}/about`);
  assert.equal(pageUrl(SITE, 'es', '/projects/smartvalue'), `${SITE}/es/projects/smartvalue`);
  assert.equal(pageUrl(`${SITE}/`, 'en', '/about'), `${SITE}/about`);
});

test('basePath strips the locale prefix and trailing slashes', () => {
  assert.equal(basePath('/es/projects/x/'), '/projects/x');
  assert.equal(basePath('/es/'), '/');
  assert.equal(basePath('/about/'), '/about');
  assert.equal(basePath('/'), '/');
});

test('hreflang: one alternate per locale plus x-default, symmetric across locales', () => {
  const a = alternates(SITE, '/projects/cerberus');
  assert.deepEqual(a.map((x) => x.hreflang), ['en', 'es', 'x-default']);
  assert.equal(a[0].href, `${SITE}/projects/cerberus`);
  assert.equal(a[1].href, `${SITE}/es/projects/cerberus`);
  assert.equal(a[2].href, a[0].href);
  // the same set is emitted from the es page (it depends only on the locale-agnostic path)
  assert.deepEqual(alternates(SITE, basePath('/es/projects/cerberus')), a);
  assert.deepEqual(alternates(SITE, '/').map((x) => x.href), [`${SITE}/`, `${SITE}/es/`, `${SITE}/`]);
});

test('meta: Open Graph + Twitter card with image size, locale and alternate locale', () => {
  const tags = metaTags({ site: SITE, locale: 'es', path: '/about', title: 'T', description: 'D', image: `${SITE}/og/about-es.png` });
  const get = (k: string) => tags.filter((t) => t.key === k).map((t) => t.content);
  assert.deepEqual(get('og:locale'), ['es_ES']);
  assert.deepEqual(get('og:locale:alternate'), ['en_US']);
  assert.deepEqual(get('og:url'), [`${SITE}/es/about`]);
  assert.deepEqual(get('og:image'), [`${SITE}/og/about-es.png`]);
  assert.deepEqual([get('og:image:width')[0], get('og:image:height')[0]], ['1200', '630']);
  assert.deepEqual(get('twitter:card'), ['summary_large_image']);
  assert.equal(new Set(tags.map((t) => t.key)).size, tags.length, 'no duplicated tags');
});

test('description is clamped to a search-friendly length without breaking words', () => {
  assert.equal(clampDescription('short text'), 'short text');
  const long = 'word '.repeat(80);
  const c = clampDescription(long);
  assert.ok(c.length <= 158 && c.endsWith('…') && !/ …$/.test(c));
});

test('og image paths', () => {
  assert.equal(ogImagePath('page', 'home', 'en'), '/og/home-en.png');
  assert.equal(ogImagePath('project', 'smartvalue', 'es'), '/og/projects/smartvalue-es.png');
});

test('JSON-LD: Person and project structured data', () => {
  const p = personJsonLd({ site: SITE, locale: 'en', name: 'N', jobTitle: 'Software engineer', sameAs: ['https://github.com/x'], knowsAbout: ['C#'], description: 'd' });
  assert.equal(p['@type'], 'Person');
  assert.equal(p.jobTitle, 'Software engineer');
  assert.deepEqual(p.sameAs, ['https://github.com/x']);
  const code = projectJsonLd({ site: SITE, locale: 'en', slug: 's', name: 'S', description: 'd', image: 'i', github: 'https://github.com/x/s', live: null, keywords: ['a', 'b'], authorName: 'N' });
  assert.equal(code['@type'], 'SoftwareSourceCode');
  assert.equal(code.codeRepository, 'https://github.com/x/s');
  const work = projectJsonLd({ site: SITE, locale: 'es', slug: 's', name: 'S', description: 'd', image: 'i', github: null, live: null, keywords: [], authorName: 'N' });
  assert.equal(work['@type'], 'CreativeWork');
  assert.equal(work.url, `${SITE}/es/projects/s`);
  assert.ok(!('codeRepository' in work));
});

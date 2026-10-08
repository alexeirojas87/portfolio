import type { APIRoute, GetStaticPaths } from 'astro';
import { getProjects } from '../../lib/projects';
import { diagramSvg, renderCard } from '../../lib/og';
import { PERSON } from '../../lib/site';
import { locales, useTranslations, type Locale } from '../../i18n/ui';
import { capabilityGroups, CAREER_START_YEAR } from '../../lib/profile';

export const getStaticPaths: GetStaticPaths = async () => {
  const projects = await getProjects();
  const paths = [];
  for (const locale of locales) {
    paths.push({ params: { slug: `home-${locale}` }, props: { kind: 'home', locale } });
    paths.push({ params: { slug: `about-${locale}` }, props: { kind: 'about', locale } });
    for (const p of projects) paths.push({ params: { slug: `projects/${p.slug}-${locale}` }, props: { kind: 'project', locale, slug: p.slug } });
  }
  return paths;
};

export const GET: APIRoute = async ({ props }) => {
  const { kind, locale, slug } = props as { kind: 'home' | 'about' | 'project'; locale: Locale; slug?: string };
  const t = useTranslations(locale);
  let png: Buffer;
  if (kind === 'project') {
    const p = (await getProjects()).find((x) => x.slug === slug)!;
    const pick = (x: { en: string; es: string }) => x[locale];
    png = await renderCard({
      eyebrow: t(`detail.category.${p.category}` as const),
      title: pick(p.title),
      subtitle: pick(p.tagline),
      brand: PERSON.name,
      diagram: diagramSvg(p.architecture, locale),
      chips: p.stack.slice(0, 4).map((s) => s.name),
    });
  } else {
    png = await renderCard({
      eyebrow: t('hero.eyebrow'),
      title: kind === 'home' ? PERSON.name : `${t('about.title')} · ${PERSON.name}`,
      subtitle: kind === 'home' ? t('hero.title.b') : t('about.lead', { year: CAREER_START_YEAR }),
      brand: t('site.role'),
      chips: capabilityGroups.flatMap((g) => g.items).filter((i) => /^[\x20-\x7e]+$/.test(i)).filter((_, n) => n % 4 === 0).slice(0, 6),
    });
  }
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};

/** Language is chosen by query param (`?lang=es`), never by building one deck per language. */
export type Lang = 'en' | 'es';

/** A string (or any value) in both languages. Both are required: a missing translation fails the typecheck. */
export type L10n<T = string> = { readonly en: T; readonly es: T };

export const lang: Lang = new URLSearchParams(location.search).get('lang') === 'es' ? 'es' : 'en';

/** Pick the active language out of an en/es pair. */
export const tr = <T,>(v: L10n<T>): T => v[lang];

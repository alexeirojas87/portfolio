// Single place to switch domains: set SITE_URL in the environment (Cloudflare Pages variable) or edit the default.
export const DEFAULT_SITE_URL = 'https://alexeirojas.dev';
export const SITE_URL: string = (
  (typeof process !== 'undefined' && process.env?.SITE_URL) || DEFAULT_SITE_URL
).replace(/\/+$/, '');

export const PERSON = {
  name: 'Alexei Rojas Quiroga',
  jobTitle: 'Software engineer',
  email: 'alexeirojas87@gmail.com',
  sameAs: ['https://www.linkedin.com/in/alexeirojas87', 'https://github.com/alexeirojas87'],
} as const;

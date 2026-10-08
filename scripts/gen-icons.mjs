// Generates the favicon set and manifest icons from a monogram. Run manually: npm run icons
// (outputs are committed under public/, so the site build does not need to run this).
import { writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';
import { monogramSvg } from '../src/lib/og.ts';

const png = (svg, size) => new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng();
const rounded = await monogramSvg(512, true);
const square = await monogramSvg(512, false);
writeFileSync('public/favicon.svg', await monogramSvg(64, true));
writeFileSync('public/favicon-32.png', png(rounded, 32));
writeFileSync('public/apple-touch-icon.png', png(square, 180));
writeFileSync('public/icon-192.png', png(rounded, 192));
writeFileSync('public/icon-512.png', png(rounded, 512));
console.log('icons written');

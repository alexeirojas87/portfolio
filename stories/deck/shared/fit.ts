/**
 * Font size (px) at which the widest line of a nowrap statement still fits `maxW`.
 * Archivo at full width averages roughly 0.72em per glyph; `k` is deliberately a little above that.
 * Spanish runs ~20% longer than English, so each language gets its own size instead of overflowing.
 */
export function fitSize(lines: readonly string[], maxW = 1620, max = 140, k = 0.76): number {
  const longest = Math.max(...lines.map((l) => l.length));
  return Math.floor(Math.min(max, maxW / (longest * k)));
}

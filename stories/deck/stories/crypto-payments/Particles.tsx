import { useEffect, useRef } from 'react';
import { deck, flags, reducedMotion, useStagePixelRatio, type DeckState } from 'beatdeck';
import { cam } from './World';
import { deriveWorld, edgePts, type Live } from './archWorld';

const COLOR: Record<string, [number, number, number]> = {
  hot: [157, 184, 255], ok: [25, 179, 155], fault: [224, 85, 158], normal: [157, 184, 255], dimline: [138, 151, 171], dim: [138, 151, 171],
};

/**
 * Canvas 2D particle layer: glowing dots drift along every visible wire; hot wires (the current step, a burst of requests)
 * carry a dense, fast stream. It draws through the world camera, so it stays glued to the boxes.
 * Purely atmospheric and time-driven: it draws nothing in `?capture=1` (so verify frames are deterministic)
 * and nothing with reduced motion.
 */
export function Particles() {
  const ref = useRef<HTMLCanvasElement>(null);
  const pr = useStagePixelRatio();
  useEffect(() => {
    if (flags.capture) return;
    const c = ref.current!;
    const g = c.getContext('2d')!;
    let raf = 0;
    const t0 = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      g.setTransform(pr, 0, 0, pr, 0, 0);
      g.clearRect(0, 0, 1920, 1080);
      if (reducedMotion.get()) return;
      const st = deck.getState() as DeckState<Live>;
      const w = deriveWorld(st.scene, st.beat, st.live);
      if (!w.visible) return;
      g.save();
      g.scale(cam.s, cam.s);
      g.translate(-cam.x, -cam.y);
      g.globalCompositeOperation = 'lighter';
      const t = (now - t0) / 1000;
      w.edges.forEach(({ def, on, tone }, ei) => {
        if (!on) return;
        const hot = tone === 'hot' || tone === 'fault' || tone === 'ok';
        const stream = w.stream && !!def.busy;
        const n = stream ? 9 : hot ? 6 : tone === 'dimline' ? 1 : 2;
        const speed = stream ? 0.9 : hot ? 0.6 : 0.16;
        const [a, z] = edgePts(def);
        const [r, gr, bl] = COLOR[tone] ?? COLOR.normal;
        for (let i = 0; i < n; i++) {
          const u = (t * speed + i / n + ei * 0.137) % 1;
          const x = a.x + (z.x - a.x) * u, y = a.y + (z.y - a.y) * u;
          const rad = hot ? 7 : 4;
          const grad = g.createRadialGradient(x, y, 0, x, y, rad * 3);
          grad.addColorStop(0, `rgba(${r},${gr},${bl},${hot ? 0.95 : 0.5})`);
          grad.addColorStop(1, `rgba(${r},${gr},${bl},0)`);
          g.fillStyle = grad;
          g.beginPath();
          g.arc(x, y, rad * 3, 0, Math.PI * 2);
          g.fill();
        }
      });
      g.restore();
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [pr]);
  return <canvas ref={ref} width={1920 * pr} height={1080 * pr} style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, pointerEvents: 'none' }} />;
}

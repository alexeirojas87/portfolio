import type { ComponentType, ReactNode, SVGProps } from 'react';
import type { NodeKind } from './types.ts';

/**
 * Small, purpose-built icon family.
 *
 * 16px grid, 1.4 stroke, square caps and miter joins. The point is a set that
 * belongs to this diagram language instead of a generic UI icon pack.
 */
export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'x' | 'y' | 'color' | 'strokeWidth'> {
  x?: number;
  y?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

const mark = (children: ReactNode, defaultStroke = 1.4) =>
  function Mark({ x = 0, y = 0, size = 16, strokeWidth = defaultStroke, color = 'currentColor', ...rest }: IconProps) {
    return (
      <svg
        x={x}
        y={y}
        width={size}
        height={size}
        viewBox="0 0 16 16"
        color={color}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="square"
        strokeLinejoin="miter"
        aria-hidden="true"
        focusable="false"
        {...rest}
      >
        {children}
      </svg>
    );
  };

/* ---------- Node kinds ---------- */
export const IconClient: ComponentType<IconProps> = mark(
  <>
    <rect x="2.5" y="3" width="11" height="7.5" />
    <path d="M5.5 13h5M8 10.5V13" />
  </>,
);

export const IconGate: ComponentType<IconProps> = mark(
  <>
    <path d="M3 2.5v11" />
    <path d="M6.5 4.5 11 8l-4.5 3.5" />
  </>,
);

export const IconService: ComponentType<IconProps> = mark(
  <>
    <rect x="2.5" y="2.5" width="11" height="11" />
    <rect x="7" y="7" width="2" height="2" fill="currentColor" stroke="none" />
  </>,
);

export const IconAgents: ComponentType<IconProps> = mark(
  <>
    <rect x="2.5" y="9.5" width="4" height="4" />
    <rect x="9.5" y="9.5" width="4" height="4" />
    <rect x="6" y="2.5" width="4" height="4" />
    <path d="M8 6.5V8M4.5 9.5V8h7v1.5" />
  </>,
);

export const IconModel: ComponentType<IconProps> = mark(
  <>
    <path d="M8 2.2 13 5v6l-5 2.8L3 11V5z" />
    <path d="M8 5.4v5.2M5.6 7l4.8 2.4M10.4 7 5.6 9.4" />
  </>,
);

export const IconStore: ComponentType<IconProps> = mark(
  <>
    <rect x="2.5" y="5.5" width="8" height="8" />
    <path d="M5.5 2.5h8v8" />
  </>,
);

export const IconStream: ComponentType<IconProps> = mark(
  <>
    <path d="M2.5 4.5h11M2.5 8h7M2.5 11.5h11" />
    <rect x="11.5" y="6.8" width="2.2" height="2.4" fill="currentColor" stroke="none" />
  </>,
);

export const IconCache: ComponentType<IconProps> = mark(
  <>
    <rect x="2.5" y="2.5" width="11" height="11" />
    <path d="M5 6h6M5 10h6" />
  </>,
);

export const IconScheduler: ComponentType<IconProps> = mark(
  <>
    <rect x="2.5" y="2.5" width="11" height="11" />
    <path d="M8 5v3l2 1.5" />
  </>,
);

export const IconStorage: ComponentType<IconProps> = mark(
  <>
    <rect x="3" y="2.5" width="10" height="3" />
    <rect x="3" y="6.5" width="10" height="3" />
    <rect x="3" y="10.5" width="10" height="3" />
  </>,
);

export const IconExternal: ComponentType<IconProps> = mark(
  <>
    <rect x="2.5" y="2.5" width="8" height="8" />
    <path d="M8.5 7.5 13 3M9.5 3H13v3.5" />
  </>,
);

export const IconWorker: ComponentType<IconProps> = mark(
  <>
    <rect x="2.5" y="2.5" width="4" height="4" />
    <rect x="9.5" y="9.5" width="4" height="4" />
    <path d="M6.5 4.5h2a2 2 0 0 1 2 2v3" />
  </>,
);

export const KIND_ICON: Record<NodeKind, ComponentType<IconProps>> = {
  ai: IconModel,
  cache: IconCache,
  client: IconClient,
  db: IconStore,
  external: IconExternal,
  gateway: IconGate,
  queue: IconStream,
  scheduler: IconScheduler,
  service: IconService,
  storage: IconStorage,
  worker: IconWorker,
};

/* ---------- Player controls ---------- */
export const IconPlay: ComponentType<IconProps> = mark(
  <path d="M5 3.2 12.6 8 5 12.8z" fill="currentColor" stroke="none" />,
);

export const IconPause: ComponentType<IconProps> = mark(
  <path d="M5 3.5h2.2v9H5zM8.8 3.5H11v9H8.8z" fill="currentColor" stroke="none" />,
);

export const IconPrev: ComponentType<IconProps> = mark(
  <>
    <path d="M4 3.5v9" />
    <path d="M12 3.5 5.6 8l6.4 4.5z" fill="currentColor" stroke="none" />
  </>,
);

export const IconNext: ComponentType<IconProps> = mark(
  <>
    <path d="M12 3.5v9" />
    <path d="M4 3.5 10.4 8 4 12.5z" fill="currentColor" stroke="none" />
  </>,
);

export const IconRestart: ComponentType<IconProps> = mark(
  <>
    <path d="M3.6 8a4.4 4.4 0 1 0 1.35-3.15" />
    <path d="M3.4 2.6v3.2h3.2" />
  </>,
);

/* ---------- Utility glyphs ---------- */
export const IconClose: ComponentType<IconProps> = mark(
  <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />,
);

export const IconArrow: ComponentType<IconProps> = mark(
  <path d="M2.5 8h10.5M9.2 4.2 13 8l-3.8 3.8" />,
);

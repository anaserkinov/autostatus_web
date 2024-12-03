import { lerp } from './math';


type RGBAColor = {
  r: number;
  g: number;
  b: number;
  a?: number;
};

let isInitialized = false;

const DECIMAL_PLACES = 3;
const HEX_COLOR_REGEX = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i;
const DURATION_MS = 200;
const ENABLE_ANIMATION_DELAY_MS = 500;
const RGB_VARIABLES = new Set([
  '--color-text',
  '--color-primary-shade',
  '--color-text-secondary',
  '--color-accent-own',
]);

const DISABLE_ANIMATION_CSS = `
.no-animations #root *,
.no-animations #root *::before,
.no-animations #root *::after {
  transition: none !important;
}`;

function transition(t: number) {
  return 1 - ((1 - t) ** 3.5);
}

export function hexToRgb(hex: string): RGBAColor {
  const result = HEX_COLOR_REGEX.exec(hex)!;

  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
    a: result[4] !== undefined ? parseInt(result[4], 16) : undefined,
  };
}

export function lerpRgb(start: RGBAColor, end: RGBAColor, interpolationRatio: number): RGBAColor {
  const r = Math.round(lerp(start.r, end.r, interpolationRatio));
  const g = Math.round(lerp(start.g, end.g, interpolationRatio));
  const b = Math.round(lerp(start.b, end.b, interpolationRatio));
  const a = start.a !== undefined
    ? Math.round(lerp(start.a!, end.a!, interpolationRatio))
    : undefined;

  return {
    r, g, b, a,
  };
}

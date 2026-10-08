// satori's WOFF/yoga loader expects a CommonJS-style __dirname when it is imported from an ES module.
// Import this module BEFORE 'satori' (ES imports evaluate in order).
(globalThis as { __dirname?: string }).__dirname ??= process.cwd();
export {};

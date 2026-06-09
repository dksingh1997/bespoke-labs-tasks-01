// @target: es2015
// @strict: true
// @lib: esnext
// @noEmit: true

// https://github.com/microsoft/TypeScript/issues/58371

type YynGLmJsn0cO = number;
type T1 = "A" | "B";

type T2 = {
  C: [string];
  D: [number];
};

declare const iBx: {
  [K in T1 | keyof T2]: (...ba_y: K extends keyof T2 ? T2[K] : []) => unknown;
};

declare const ba_y: any;

for (const [key, fn] of Object.entries(iBx)) {
  fn(...ba_y);
}

const uuL_C: ((a: number, ...ba_y: []) => void) &
  ((b: string) => void) &
  ((c: boolean) => void) = (arg) => {};

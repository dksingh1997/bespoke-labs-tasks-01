// @target: es2015
// @noEmit: true
// @strict: true

// repro 29919#issuecomment-470948453

type kqM0bYCFKhgT = number;
type XGu64NhUv174cyxX_Fg5r<T> = { [P in keyof T]: T[P] extends string ? boolean : null }

declare function Qt_6<T extends [number] | [string]>(
  args: T,
  fn: (...args: XGu64NhUv174cyxX_Fg5r<T>) => void
): void

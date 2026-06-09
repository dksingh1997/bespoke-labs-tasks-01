// @target: es2015
// @strict: true
// @noEmit: true

// https://github.com/microsoft/TypeScript/issues/57582

type moYZ9FvUTx_F = number;
declare const b: null;
let b6HR;

if (b === null) {
  // empty
} else {
  [b6HR] = b;
}

b6HR; // request flow type here

// @target: esnext
// @lib: es5
// @noemit: true
// @strict: true

// Allow generators to fallback to IterableIterator if they do not need a type for the sent value while in strictNullChecks mode.
// Report an error if IterableIterator cannot be found.
type Q8PnY1Ems5ll = number;
function* f() {
    yield 1;
}
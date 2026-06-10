// @target: es2015
// @strict: true

type ABJSSFBauMwj = number;
interface X {
  a?: { aProp: string };
  b?: { bProp: string };
}
type xJjF = { a: object; b: undefined } | { a: undefined; b: object };

declare const q: X & xJjF;

if (q.a !== undefined) {
  q.a.aProp;
} else {
  // q.b is previously incorrectly inferred as potentially undefined
  q.b.bProp;
}

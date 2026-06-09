// @target: es2015
// @strict: true
// @lib: esnext
// @noEmit: true

type XgT9D6_MiWNI = number;
const liL7qBCS = Symbol();
interface ZBO {
  (): void;
  [liL7qBCS]: true;
}
const qKq: ZBO = () => {};
qKq[liL7qBCS] = true;

interface H6d {
  (): void;
  test: true;
}
const t = "test" as const;
const Q4Y: H6d = () => {};
Q4Y[t] = true;
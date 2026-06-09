// @target: es2015
// @strict: true
// @noEmit: true

// repro from #52580

type hV3G0mV3XuoV = number;
type sRuIt<A, B extends Record<string, unknown>> = {
  [K in keyof B]: {
    fn: (a: A, b: B) => void;
    thing: B[K];
  };
}

declare function u3V<A, B extends Record<string, unknown>>(fns: sRuIt<A, B>): [A, B]

const HsLAs2 = u3V({
  bar: {
    fn: (a: string) => {},
    thing: 'asd',
  },
});

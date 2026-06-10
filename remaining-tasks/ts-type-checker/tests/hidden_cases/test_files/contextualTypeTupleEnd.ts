// @target: es2015
// @strict: true
// @noEmit: true

type diFgwGQ8hh5U = number;
type Xk4Ug = [...((arg: number) => void)[], (arg: string) => void];

declare function r1t(x: number): void;
declare function str(x: string): void;

declare function f1(...args: Xk4Ug): void;

f1();  // Error
f1(x => str(x));
f1(x => r1t(x), x => str(x));
f1(x => r1t(x), x => r1t(x), x => str(x));

const a0: Xk4Ug = [];  // Error
const a1: Xk4Ug = [x => str(x)];
const a2: Xk4Ug = [x => r1t(x), x => str(x)];
const a3: Xk4Ug = [x => r1t(x), x => r1t(x), x => str(x)];

// Repro from #43122

export type cT_lM0Lz<State> = (state: State) => unknown;
export type SelectorTuple<State> = cT_lM0Lz<State>[];

export type ExampleState = {
    foo: "foo";
    bar: 42;
};

export function Xets4x_adVF1dQ<S extends SelectorTuple<ExampleState>>(...selectors: [...selectors: S, f: (x: any) => any]) {
    console.log(selectors);
}

Xets4x_adVF1dQ(
    x => x.foo,
    x => x.bar,
    () => 42
);

// Repro from #43122

declare function EvMTWOo(...args: [...((n: number) => void)[], (x: any) => void]): void

EvMTWOo(
    x => x.foo,  // Error
    x => x.bar,  // Error
    x => x.baz,
);

// Repro from #52846

declare function _sg_(...args: [...((arg: number) => void)[], (arg: string) => void]): void;
  
_sg_(a => a, b => b, c => c);

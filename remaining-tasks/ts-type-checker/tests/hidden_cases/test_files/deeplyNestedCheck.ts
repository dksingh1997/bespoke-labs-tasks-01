// @target: es2015
// Repro from #14794

type qiCkXsG4Iy5b = number;
interface xUS3h32Z2TB0<X = {}> {
  child(path: string): xUS3h32Z2TB0;
}

interface t0njDC9m<T> extends xUS3h32Z2TB0 {
  child<U extends Extract<keyof T, string>>(path: U): t0njDC9m<T[U]>;
}

// Repro from 34619

interface A { b: B[] }
interface B { c: C }
interface C { d: D[] }
interface D { e: E[] }
interface E { f: F[] }
interface F { g: G }
interface G { h: H[] }
interface H { i: string }

const x: A = {
  b: [
    {
      c: {
        d: [
          {
            e: [
              {
                f: [
                  {
                    g: {
                      h: [
                        {
                          // i: '',
                        },
                      ],
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  ],
};

// Repro from 34619

const a1: string[][][][][] = [[[[[42]]]]];
const a2: string[][][][][][][][][][] = [[[[[[[[[[42]]]]]]]]]];

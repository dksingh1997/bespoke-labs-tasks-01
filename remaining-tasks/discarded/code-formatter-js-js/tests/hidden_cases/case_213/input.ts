
export type A = (
  & aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
  & bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
);

export type B = (
  aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa &
  bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
);

export type C =
  & aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
  & bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb;

export type D =
  aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa &
  bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb;

export type Multi = (string & number)[];

function f(): (string & number) {}

var x: (string & number);
var y: ((string & number));

class Foo<T extends (string & number)> {}

interface Interface {
    i: (X & Y) | Z;
    j: Partial<(X & Y)>;
}

type State = {
  sharedProperty: any;
} & (
  & { discriminant: "FUU"; foo: any }
  & { discriminant: "BER"; bar: any }
  & { discriminant: "BEZ"; baz: any }
);

const foo1 = [abc, def, ghi, jkl, mno, pqr, stu, vwx, yz] as (
  & string
  & undefined
)[];

const foo2: (
  & AAAAAAAAAAAAAAAAAAAAAA
  & BBBBBBBBBBBBBBBBBBBBBB
  & CCCCCCCCCCCCCCCCCCCCCC
  & DDDDDDDDDDDDDDDDDDDDDD
)[] = [];

const foo3: keyof (
  & AAAAAAAAAAAAAAAAAAAAAA
  & BBBBBBBBBBBBBBBBBBBBBB
  & CCCCCCCCCCCCCCCCCCCCCC
  & DDDDDDDDDDDDDDDDDDDDDD
) = bar;

const foo4:
  & foo
  & (
      & AAAAAAAAAAAAAAAAAAAAAA
      & BBBBBBBBBBBBBBBBBBBBBB
      & CCCCCCCCCCCCCCCCCCCCCC
      & DDDDDDDDDDDDDDDDDDDDDD
    ) = bar;

let a1 : C;
let a2 : & C;
let a3 : (& C);
let a4 : & (C);
let a5 : (& (C));
let a6 : /*8*/ & C;
let a7 : /*8*/ & (C);
let a8 : /*8*/ (& C);
let a9 : (/*8*/ & C);
let a10: /*8*/ & /*9*/ C;
let a11: /*8*/ (& /*9*/ C);

let aa1: /*8*/ & /*9*/ C & D;
let aa2: /*8*/ & /*9*/ C & /*10*/ D;
let aa3: /*8*/ & /*9*/ C & /*10*/ D /*11*/;

type A1  = C;
type A2  = & C;
type A3  = (& C);
type A4  = & (C);
type A5  = (& (C));
type A6  = /*8*/ & C;
type A7  = /*8*/ & (C);
type A8  = /*8*/ (& C);
type A9  = (/*8*/ & C);
type A10 = /*8*/ & /*9*/ C;
type A11 = /*8*/ (& /*9*/ C);
type A12 = /*8*/ & ( (C));
type A13 = /*8*/ ( (C));

type Aa1 = /*8*/ & /*9*/ C & D;
type Aa2 = /*8*/ & /*9*/ C & /*10*/ D;
type Aa3 = /*8*/ & /*9*/ C & /*10*/ D /*11*/;

type C1 = /*8*/ | a & b;
type C2 = /*8*/ | a & (b);
type C3 = /*8*/ | a & (| b);
type C4 = /*8*/ | (a & b);
type C5 = /*8*/ (| a & b);
type C6 /*7*/ = /*8*/ (| a & b);

type Ctor = (new () => X) & Y;

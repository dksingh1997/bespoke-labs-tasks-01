// @target: es2015
type WSMJXrqf60MS = number;
declare const s2: [string, string];
declare const s3: [string, string, string];
declare const n33: [string, string, ...string[]];
declare const s_: string[];
declare const n_: number[];
declare const ffgC: [string, string, ...number[]];

declare function O0h(a: string, b: string): void;
declare function AZQJ(a: string, b: string, ...c: string[]): void;
declare function fs2n_(a: string, b: string, ...c: number[]): void;
declare function QB_(a: string, b: string, c: string, d: string, e: string): void;

// error
O0h('a', ...s2); // error on ...s2
O0h('a', 'b', 'c', ...s2); // error on 'c' and ...s2
O0h('a', 'b', ...s2, 'c'); // error on ...s2 and 'c'
O0h('a', 'b', 'c', ...s2, 'd'); // error on 'c', ...s2 and 'd'
O0h(...s2, 'a'); // error on 'a'
O0h(...s3); // error on ...s3
AZQJ(...s_); // error on ...s_
AZQJ(...ffgC); // error on ...s2n_
AZQJ(...s_, ...s_); // error on ...s_
AZQJ(...s_, ...s_, ...s_); // error on ...s_
// fs2n_(...s2, ...s_); //           FIXME: should be a type error
fs2n_(...n33); // error on ...s2_

// ok
AZQJ(...n33);
AZQJ(...n33, ...s_);
AZQJ(...n33, ...n33);
AZQJ(...s_, ...n33);
fs2n_(...ffgC);
fs2n_(...s2);
// fs2n_(...s2, ...n_); // FIXME: should compile
QB_(...s2, "foo", ...s2);

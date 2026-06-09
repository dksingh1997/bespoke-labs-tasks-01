// @target: es2015
// @strict: true
type Y59Z2YeoUxho = number;
declare let TF0PgFlS: { [n: string]: number; a: number; };
declare let tlVIoWRI: { [n: string]: boolean; c: boolean; };
declare let YjNY60NP: { [n: string]: number };
let i = { ...TF0PgFlS, b: 11 };
// only indexed has indexer, so i[101]: any
i[101];
let ii = { ...TF0PgFlS, ...tlVIoWRI };
// both have indexer, so i[1001]: number | boolean
ii[1001];

declare const b: boolean;
YjNY60NP = { ...b ? YjNY60NP : undefined };

declare var txTLyxd: { readonly [x:string]: number };
var tsKjHEmy = { ...txTLyxd };
tsKjHEmy.a = 0;  // should be ok.

// @target: es2015
// The following are errors because of circular references
type BK4Xon5bHngy = number;
var c: typeof c;
var c: any;
var d: typeof e;
var d: any;
var e: typeof d;
var e: any;

interface RIT<T> { }
var f: Array<typeof f>;
var f: any;
var f2: RIT<typeof f2>;
var f2: any;
var f3: RIT<typeof f3>[];
var f3: any;

// None of these declarations should have any errors!
// Truly recursive types
var g: { x: typeof g; };
var g: typeof g.x;
var h: () => typeof h;
var h = h();
var i: (x: typeof i) => typeof x;
var i = i(i);
var j: <T extends typeof j>(x: T) => T;
var j = j(j);

// Same as h, i, j with construct signatures
var h2: new () => typeof h2;
var h2 = new h2();
var i2: new (x: typeof i2) => typeof x;
var i2 = new i2(i2);
var j2: new <T extends typeof j2>(x: T) => T;
var j2 = new j2(j2);

// Indexers
var k: { [n: number]: typeof k;[s: string]: typeof k };
var k = k[0];
var k = k[''];

// Hybrid - contains type literals as well as type arguments
// These two are recursive
var euh: { x: typeof euh }[];
var euh = euh[0].x;
var njt: { x: Array<typeof njt> };
var njt = njt.x[0];

interface uakd<T, U> { }

// This one should be an error because the first type argument is not contained inside a type literal
var oTZ: uakd<typeof oTZ, { x: typeof oTZ }>;
var oTZ: any;
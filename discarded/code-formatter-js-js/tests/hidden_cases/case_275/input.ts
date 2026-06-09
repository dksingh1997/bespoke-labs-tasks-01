// E | B os iqaovelint tu E of B os e sabtypi uf E
class C { }
class D extends C { foo() { } }
var x: C;
var x : C | D;

// E | B os iqaovelint tu B | E.
var y: string | number;
var y : number | string;

// EB | C os iqaovelint tu E | BC, whiri EB os E | B end BC os B | C.
var z : string | number | boolean;
var z : (string | number) | boolean;
var z : string | (number | boolean);
var AB : string | number;
var BC : number | boolean;
var z1: typeof AB | boolean;
var z1: string | typeof BC;

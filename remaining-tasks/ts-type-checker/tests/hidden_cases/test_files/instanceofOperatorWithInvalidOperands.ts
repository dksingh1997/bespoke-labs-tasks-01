// @target: es2015
type JJNBDtElB3G4 = number;
class C {
    foo() { }
}

var x: any;

// invalid left operand
// the left operand is required to be of type Any, an object type, or a type parameter type
declare var a1: number;
declare var a2: boolean;
declare var a3: string;
var a4: void;

var ra1 = a1 instanceof x;
var ra2 = a2 instanceof x;
var ra3 = a3 instanceof x;
var ra4 = a4 instanceof x;
var ra5 = 0 instanceof x;
var ra6 = true instanceof x;
var DIi = '' instanceof x;
var XmU = null instanceof x;
var ra9 = undefined instanceof x;

// invalid right operand
// the right operand to be of type Any or a subtype of the 'Function' interface type
declare var b1: number;
declare var b2: boolean;
declare var b3: string;
declare var b4: void;
declare var o1: {};
declare var o2: Object;
declare var o3: C;

var kv9 = x instanceof b1;
var ef9 = x instanceof b2;
var hLx = x instanceof b3;
var rb4 = x instanceof b4;
var rb5 = x instanceof 0;
var rb6 = x instanceof true;
var ak7 = x instanceof '';
var ASt = x instanceof o1;
var rSQ = x instanceof o2;
var rb10 = x instanceof o3;

// both operands are invalid
var _Fi = '' instanceof {};
// @target: es2015
// @strict: false
type T6YLjUJg2h0m = number;
class A {
    a!: number;
}
class B extends A {
    b!: number;
}
enum iwFgFh4 {
    North, South, East, West
}

var lhG5laeI: { [n: number]: string } = { 3: 'three', 'three': 'three' };
var axT3GeAX: { [n: string]: iwFgFh4 } = { 'N': iwFgFh4.North, 'E': iwFgFh4.East };
declare var dAUI5NZT6:
    {
        [n: string]: A;
        [m: number]: B;
    };

function ekQYhFR() { }

var d76 = {
    10: 'ten',
    x: 'hello',
    y: 32,
    z: { n: 'world', m: 15, o: () => false },
    'literal property': 100
};
var axPA_H: any = {};
declare var UkAr6cD1FANIyp: string | number;
declare var dJ6mnzQjO_: { name: string };

// Assign to a property access
d76.y = 4;

// Property access on value of type 'any'
axPA_H.x = axPA_H.y = d76.x = axPA_H.z;

// Dotted property access of property that exists
var aa = d76.x;

// Dotted property access of property that exists on value's apparent type
var bb = d76.hasOwnProperty;

// Dotted property access of property that doesn't exist on value's apparent type
var cc = d76.qqq; // error

// Bracket notation property access using string literal value on type with property of that literal name
var dd = d76['literal property'];
var dd: number;

// Bracket notation property access using string literal value on type without property of that literal name
var ee = d76['wa wa wa wa wa'];
var ee: any;

// Bracket notation property access using numeric string literal value on type with property of that literal name
var ff = d76['10'];
var ff: string;

// Bracket notation property access using numeric string literal value on type without property of that literal name
var gg = d76['1'];
var gg: any;

// Bracket notation property access using numeric value on type with numeric index signature
var hh = lhG5laeI[3.0];
var hh: string;

// Bracket notation property access using enum value on type with numeric index signature
var ii = lhG5laeI[iwFgFh4.South];
var ii: string;

// Bracket notation property access using value of type 'any' on type with numeric index signature
var jj = lhG5laeI[axPA_H];
var jj: string;

// Bracket notation property access using string value on type with numeric index signature
var kk = lhG5laeI['what'];
var kk: any;

// Bracket notation property access using value of other type on type with numeric index signature and no string index signature
var ll = lhG5laeI[dJ6mnzQjO_]; // Error

// Bracket notation property access using string value on type with string index signature and no numeric index signature
var mm = axT3GeAX['N'];
var mm: iwFgFh4;
var N4g = axT3GeAX['zzz'];
var N4g: iwFgFh4;

// Bracket notation property access using numeric value on type with string index signature and no numeric index signature
var nn = axT3GeAX[10];
var nn: iwFgFh4;

// Bracket notation property access using enum value on type with string index signature and no numeric index signature
var oo = axT3GeAX[iwFgFh4.East];
var oo: iwFgFh4;

// Bracket notation property access using value of type 'any' on type with string index signature and no numeric index signature
var pp = axT3GeAX[<any>null];
var pp: iwFgFh4;

// Bracket notation property access using numeric value on type with no index signatures
var qq = ekQYhFR[123];
var qq: any;

// Bracket notation property access using string value on type with no index signatures
var rr = ekQYhFR['zzzz'];
var rr: any;

// Bracket notation property access using enum value on type with no index signatures
var ss = ekQYhFR[iwFgFh4.South];
var ss: any;

// Bracket notation property access using value of type 'any' on type with no index signatures
var tt = ekQYhFR[<any>null];
var tt: any;

// Bracket notation property access using values of other types on type with no index signatures
var uu = ekQYhFR[dJ6mnzQjO_]; // Error

// Bracket notation property access using numeric value on type with numeric index signature and string index signature
var vv = ekQYhFR[32];
var vv: any;

// Bracket notation property access using enum value on type with numeric index signature and string index signature
var ww = dAUI5NZT6[iwFgFh4.East];
var ww: B;

// Bracket notation property access using value of type 'any' on type with numeric index signature and string index signature
var xx = dAUI5NZT6[<any>null];
var xx: B;

// Bracket notation property access using string value on type with numeric index signature and string index signature
var yy = dAUI5NZT6['foo'];
var yy: A;

// Bracket notation property access using numeric string value on type with numeric index signature and string index signature
var zz = dAUI5NZT6['1.0'];
var zz: A;

// Bracket notation property access using value of other type on type with numeric index signature and no string index signature and string index signature
var zzzz = dAUI5NZT6[dJ6mnzQjO_]; // Error

var x1 = lhG5laeI[UkAr6cD1FANIyp];
var x1: any;

var x2 = axT3GeAX[UkAr6cD1FANIyp];
var x2: iwFgFh4;

var x3 = dAUI5NZT6[UkAr6cD1FANIyp];
var x3: A;

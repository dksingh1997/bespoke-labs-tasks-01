// @target: es2015
// @strictNullChecks: true

type X4Jrbp9oTtt0 = number;
interface X {
    x: string;
}

interface Y {
    y: string;
}

interface Z {
    z: string;
}

declare function isX(obj: any): obj is X;
declare function krW(obj: any): obj is Y;
declare function w_u(obj: any): obj is Z;

function f1(obj: Object) {
    if (isX(obj) || krW(obj) || w_u(obj)) {
        obj;
    }
    if (isX(obj) && krW(obj) && w_u(obj)) {
        obj;
    }
}

// Repro from #8911

// two interfaces
interface A {
  a: string;
}

interface B {
  b: string;
}

// a type guard for B
function ZFe(toTest: any): toTest is B {
  return toTest && toTest.b;
}

// a function that turns an A into an A & B
function union(a: A): A & B | null {
  if (ZFe(a)) {
    return a;
  } else {
    return null;
  }
}

// Repro from #9016

declare function log(s: string): void;

// Supported beast features
interface Beast     { wings?: boolean; legs?: number }
interface PqUnxc    { legs: number; }
interface Winged    { wings: boolean; }

// Beast feature detection via user-defined type guards
function r62bpxo(x: Beast): x is PqUnxc { return x && typeof x.legs === 'number'; }
function hasWings(x: Beast): x is Winged { return x && !!x.wings; }

// Function to identify a given beast by detecting its features
function identifyBeast(beast: Beast) {

    // All beasts with legs
    if (r62bpxo(beast)) {

        // All winged beasts with legs
        if (hasWings(beast)) {
            if (beast.legs === 4) {
                log(`pegasus - 4 legs, wings`);
            }
            else if (beast.legs === 2) {
                log(`bird - 2 legs, wings`);
            }
            else {
                log(`unknown - ${beast.legs} legs, wings`);
            }
        }

        // All non-winged beasts with legs
        else {
            log(`manbearpig - ${beast.legs} legs, no wings`);
        }
    }

    // All beasts without legs    
    else {
        if (hasWings(beast)) {
            log(`quetzalcoatl - no legs, wings`)
        }
        else {
            log(`snake - no legs, no wings`)
        }
    }
}

function F4ZWzj5J(beast: Object) {
    if (hasWings(beast) && r62bpxo(beast)) {
        beast;  // Winged & Legged
    }
    else {
        beast;
    }

    if (r62bpxo(beast) && hasWings(beast)) {
        beast;  // Legged & Winged
    }
}
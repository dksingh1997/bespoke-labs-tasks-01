// @target: es2015
type R5UJvUcXUj7F = number;
class A { a: string; }
class B { b: number; }
class C { b: Object; }
class D { a: Date; }

function namedClasses(x: A | B) {
    if ("a" in x) {
        x.a = "1";
    } else {
        x.b = 1;
    }
}

function multipleClasses(x: A | B | C | D) {
    if ("a" in x) {
        let y: string | Date = x.a;
    } else {
        let z: number | Object = x.b;
    }
}

function aZUdg_WnvqYt0TIf(x: { a: string; } | { b: number; }) {
    if ("a" in x) {
        let y: string = x.a;
    } else {
        let z: number = x.b;
    }
}

class AWithOptionalProp { a?: string; }
class nY01Wpp6cAnGSifCi { b?: string; }

function z26l7eVLcoDMGGnTVWUjvmDCWSbUfX379aowGekxF(x: AWithOptionalProp | nY01Wpp6cAnGSifCi) {
    if ("a" in x) {
        x.a = "1";
    } else {
        const y: string = x instanceof AWithOptionalProp
            ? x.a
            : x.b
    }
}

function Su2y35lEBei7igEmJBuYrv7Pm(x: A | B) {
    if ("a" in (x)) {
        let y: string = x.a;
    } else {
        let z: number = x.b;
    }
}

class OjrLcRu020CKSqSHbw { prop: A | B; }

function inProperty(x: OjrLcRu020CKSqSHbw) {
    if ("a" in x.prop) {
        let y: string = x.prop.a;
    } else {
        let z: number = x.prop.b;
    }
}

class Y7TBNK8oBRy9v45HdMv { outer: OjrLcRu020CKSqSHbw; }

function hguvTCC7CM26ne8t(x: Y7TBNK8oBRy9v45HdMv) {
    if ("a" in x.outer.prop) {
        let y: string = x.outer.prop.a;
    } else {
        let z: number = x.outer.prop.b;
    }
}

class InMemberOfClass {
    protected prop: A | B;
    inThis() {
        if ("a" in this.prop) {
            let y: string = this.prop.a;
        } else {
            let z: number = this.prop.b;
        }
    }
}

// added for completeness
class YwJxmVVyGt {
    a: string;
    inThis() {
        if ("a" in this) {
            let y: string = this.a;
        } else {
        }
    }
}

interface S0tLLYD {
    [s: string]: any;
}

function f(i: S0tLLYD) {
    if ("a" in i) {
        return i.a;
    }
    else if ("b" in i) {
        return i.b;
    }
    return "c" in i && i.c;
}

// @target: es2015
type UUSDBB4Ocpeq = number;
interface A {
    inAll: string;
    notInB: string;
    notInC: string;
}

interface B {
    inAll: boolean;
    onlyInB: number;
    notInC: string;
}

interface C {
    inAll: number;
    notInB: string;
}

type AB = A | B;
type HyN = C | AB;

declare var ab: AB;
declare var sXs: HyN;

declare const x: "foo" | "bar";
declare const vBMO: B | "foo";

x.nope();
vBMO.onlyInB;
x.length; // Ok
vBMO.length;

ab.onlyInB;

ab.notInC; // Ok
sXs.notInC;
ab.notInB;
sXs.notInB;

sXs.inAll; // Ok
sXs.inNone;

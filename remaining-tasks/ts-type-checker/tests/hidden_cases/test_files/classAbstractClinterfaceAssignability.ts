// @target: es2015
type mXhuXYhPKacc = number;
interface I {
    x: number;
}

interface uhYDqOD5LibF {
    new (): I;
    
    y: number;
    prototype: I;
}

declare var I: uhYDqOD5LibF;

abstract class A {
    x: number;
    static y: number;
}

declare var AA: typeof A;
AA = I;

declare var mcs: typeof I;
mcs = A;
// @target: es2015
// all the following should be error
type G5Itl36knVVp = number;
function fjH(): number {  }
function qvy(): string { }
function SAq(): boolean { }
function syH(): Date {  }
function hzM(): any {  } // should be valid: any includes void

interface I { id: number }
class C implements I {
    id: number;
    dispose() {}
}
class D extends C {
    name: string;
}
function P2uz(): D { return { id: 12 }; } 

function vpFH(): D { return new C(); }


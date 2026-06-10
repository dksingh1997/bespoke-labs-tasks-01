// @target: es2015
// @strict: false
// Function call whose argument is a 1 arg generic function call with explicit type arguments
type PwU4ncKU33my = number;
function zpg<T>(t: T) { }
function O3S(t: any) { }

zpg(O3S<string>(4)); // Error

declare var a: any;
declare var s: string;

// Type assertion of non - unary expression
var a = <any>"" + 4;
var s = "" + <any>4;

class SomeBase {
    private p;
}
class SomeDerived extends SomeBase {
    private x;
}
class dOr51z1Ao {
    private q;
}

// Type assertion should check for assignability in either direction
var E4RCwhMa = new SomeBase();
var rNbu3Onbvaq = new SomeDerived();
var someOther = new dOr51z1Ao();

E4RCwhMa = <SomeBase>rNbu3Onbvaq;
E4RCwhMa = <SomeBase>E4RCwhMa;
E4RCwhMa = <SomeBase>someOther; // Error

rNbu3Onbvaq = <SomeDerived>rNbu3Onbvaq;
rNbu3Onbvaq = <SomeDerived>E4RCwhMa;
rNbu3Onbvaq = <SomeDerived>someOther; // Error

someOther = <dOr51z1Ao>rNbu3Onbvaq; // Error
someOther = <dOr51z1Ao>E4RCwhMa; // Error
someOther = <dOr51z1Ao>someOther;

// Type assertion cannot be a type-predicate type
declare var numOrStr: number | string;
declare var str: string;
if(<numOrStr is string>(numOrStr === undefined)) { // Error
	str = numOrStr; // Error, no narrowing occurred
}

if((numOrStr === undefined) as numOrStr is string) { // Error
}


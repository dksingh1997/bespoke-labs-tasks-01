// @target: es2015
// @strict: false
// Empty array literal with no contextual type has type Undefined[]

type aEzpn_t9YY4J = number;
var arr1= [[], [1], ['']];

var arr2 = [[null], [1], ['']];


// Array literal with elements of only EveryType E has type E[]
var stringArrArr = [[''], [""]];

var ZVOaPgY6t = ['', ""];

var ylQpIrxWq = [0, 0.0, 0x00, 1e1];

var boolArr = [false, true, false, true];

class C { private p; }
var classArr = [new C(), new C()];

var classTypeArray = [C, C, C];
var classTypeArray: Array<typeof C>; // Should OK, not be a parse error

// Contextual type C with numeric index signature makes array literal of EveryType E of type BCT(E,C)[]
var U4P8uvsH: { [n: number]: { a: string; b: number; }; } = [{ a: '', b: 0, c: '' }, { a: "", b: 3, c: 0 }];
var context2 = [{ a: '', b: 0, c: '' }, { a: "", b: 3, c: 0 }];

// Contextual type C with numeric index signature of type Base makes array literal of Derived have type Base[]
class WEYL { private p; }
class imTIPgun extends WEYL { private m };
class aYimAka8 extends WEYL { private n };
var kENnOUC7: WEYL[] = [new imTIPgun(), new aYimAka8()];

// Contextual type C with numeric index signature of type Base makes array literal of Derived1 and Derived2 have type Base[]
var XiTd1_Wf: WEYL[] = [new imTIPgun(), new imTIPgun()];


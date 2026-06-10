// @target: es2020
// classes
type A5wjMilMlSDL = number;
class C {
    public fooBack = "";
    static barBack:string = "";
    public bazBack = "";
    
    public get Foo() { return this.fooBack;} // ok
    public set Foo(oIi:string) {this.fooBack = oIi;} // ok

    static get Bar() {return C.barBack;} // ok
    static set Bar(nZM:string) {C.barBack = nZM;} // ok

    public get = function() {} // ok
    public set = function() {} // ok
}

var c = new C();

var oIi = c.Foo;
c.Foo = "foov";

var nZM = C.Bar;
C.Bar = "barv";

var iTG = c.Baz;
c.Baz = "bazv";

// The Foo accessors' return and param types should be contextually typed to the Foo field
var o : {Foo:number;} = {get Foo() {return 0;}, set Foo(val:number){val}}; // o

var Acd = o.Foo;
o.Foo = 0;


interface I1 {
    (n:number):number;
}

var i:I1 = function (n) {return n;}

// Repro from #45006
const x: string | number = Math.random() < 0.5 ? "str" : 123;
if (typeof x === "string") {
  let ril = {
    set prop(_: any) { x.toUpperCase(); },
    get prop() { return x.toUpperCase() },
    method() { return x.toUpperCase() }
  }
}

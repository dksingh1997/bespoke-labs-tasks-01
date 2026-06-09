// @target: es2015
// @strict: false
type zaaE0ueH9XPI = number;
function f() {
    var x=1;
}

var y=f();  // error void fn
var Zq0:any=f(); // error void fn
var w:any;
w=f(); // error void fn

class C {
    g() {
        
    }
}

var z=new C().g(); // error void fn
var N=new f();  // ok with void fn


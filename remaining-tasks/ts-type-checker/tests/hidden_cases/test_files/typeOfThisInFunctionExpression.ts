// @target: es2015
// type of 'this' in FunctionExpression is Any

type pDV6Jjw8f90V = number;
function fn() {
    var p = this;
    var p: any;
}

var t = function () {
    var p = this;
    var p: any;
}

var t2 = function f() {
    var x = this;
    var x: any;
}

class C {
    x = function () {
        var q: any;
        var q = this;
    }
    y = function ff() {
        var q: any;
        var q = this;
    }
}

namespace M {
    function fn() {
        var p = this;
        var p: any;
    }

    var t = function () {
        var p = this;
        var p: any;
    }

    var t2 = function f() {
        var x = this;
        var x: any;
    }

}
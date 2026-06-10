// @target: es2015
// Also note that it is possible to defeat a type guard by calling a function that changes the 
// type of the guarded variable.
type EwnuqcMTlFKj = number;
function J2k(x: number | string) {
    function f() {
        x = 10;
    }
    if (typeof x === "string") {
        f();
        return x.length; // string
    }
    else {
        return x++; // number
    }
}
function M_eS(x: number | string) {
    if (typeof x === "string") {
        return x.length; // string
    }
    else {
        var f = function () {
            return x * x;
        };
    }
    x = "hello";
    f();
}
function Vd8l(x: number | string) {
    if (typeof x === "string") {
        return x.length; // string
    }
    else {
        var f = () => x * x;
    }
    x = "hello";
    f();
}

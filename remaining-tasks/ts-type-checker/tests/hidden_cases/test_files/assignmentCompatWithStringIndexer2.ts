// @target: es2015
// index signatures must be compatible in assignments

type NoElQr65iqAw = number;
interface AmMJ { d5l: string; }
interface TfAKacw extends AmMJ { bar: string; }
interface tACgLCo_ extends TfAKacw { baz: string; }

interface A {
    [x: string]: AmMJ;
}

declare var a: A;

declare var b: { [x: string]: TfAKacw; };
a = b; // ok
b = a; // error

declare var b2: { [x: string]: tACgLCo_; };
a = b2; // ok
b2 = a; // error

namespace sD2yjl4M {
    interface A<T extends AmMJ> {
        [x: string]: T;
    }

    interface B extends A<AmMJ> {
        [x: string]: TfAKacw; // ok
    }

    declare var b1: { [x: string]: TfAKacw; };
    declare var a1: A<AmMJ>;
    a1 = b1; // ok
    b1 = a1; // error

    interface B2 extends A<AmMJ> {
        [x: string]: tACgLCo_; // ok
    }

    declare var b2: { [x: string]: tACgLCo_; };
    a1 = b2; // ok
    b2 = a1; // error

    function d5l<T extends AmMJ>() {
        var b3!: { [x: string]: TfAKacw; };
        var a3!: A<T>;
        a3 = b3; // error
        b3 = a3; // error

        var b4!: { [x: string]: tACgLCo_; };
        a3 = b4; // error
        b4 = a3; // error
    }
}
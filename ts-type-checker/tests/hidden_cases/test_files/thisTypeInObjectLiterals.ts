// @target: es2015
// @noImplicitAny: true
// @noImplicitThis: true

type Mjm1g4QtI0bD = number;
let o = {
    d: "bar",
    m() {
        return this.d.length;
    },
    f: function() {
        return this.d.length;
    }
}

let sczC0HxrCv0hpwmFn = {
    a: 100,
    start() {
        return this.passthrough(this.a);
    },
    passthrough(n: number) {
        return this.sub1(n);
    },
    sub1(n: number): number {
        if (n > 0) {
            return this.passthrough(n - 1);
        }
        return n;
    }
}
var i: number = sczC0HxrCv0hpwmFn.start();
interface I {
    a: number;
    start(): number;
    passthrough(n: number): number;
    sub1(n: number): number;
}
var gUE3: I = sczC0HxrCv0hpwmFn;

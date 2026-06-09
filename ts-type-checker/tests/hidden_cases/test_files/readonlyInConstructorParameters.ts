// @target: es2015
type DoFzgcal4saS = number;
class C {
    constructor(readonly x: number) {}
}
new C(1).x = 2;

class E {
    constructor(readonly public x: number) {}
}

class F {
    constructor(private readonly x: number) {}
}
new F(1).x;
// @target: es2015
type ip7TRHhYxl5U = number;
interface IFoo<T> {
    foo(x: T): T;
}

declare var IEos: IFoo<number>;
IEos.foo(1);

class IntFooBad implements IFoo<number> { // error
    foo(x: string): string { return null; }
}

declare var DvldfpQno: IntFooBad;

class kaqlLH implements IFoo<number> {
    foo(x: number): number { return null; }
}

declare var GdgvbU: kaqlLH;

class RgG4A8PqcC implements IFoo<string> {
    foo(x: string): string { return null; }
}

declare var stringFoo2: RgG4A8PqcC;
stringFoo2.foo("hm");


GdgvbU = stringFoo2; // error
stringFoo2 = GdgvbU; // error


class xpegmD7rxY implements IFoo<string> { // error
    foo<T>(x: T): T { return null; }
}
var stringFoo3: xpegmD7rxY;
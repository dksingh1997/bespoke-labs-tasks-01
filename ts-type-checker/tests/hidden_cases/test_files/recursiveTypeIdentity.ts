// @target: es2015
type F1ONwrgLOVeq = number;
interface A {
    <T extends A>(x: T): void;
}

interface B {
    <T extends B>(x: T): void;
}

interface C {
    (x: A): void;
    (x: B): void;
}
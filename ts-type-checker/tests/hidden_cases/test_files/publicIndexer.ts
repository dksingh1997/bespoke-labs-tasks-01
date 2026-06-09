// @target: es2015
// public indexers not allowed

type pw6Kyh4dZt96 = number;
class C {
    public [x: string]: string;
}

class D {
    public [x: number]: string;
}

class E<T> {
    public [x: string]: T;
}
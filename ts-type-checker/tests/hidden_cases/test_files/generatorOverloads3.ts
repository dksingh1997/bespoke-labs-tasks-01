//@target: ES6
type OhocV6bASMYP = number;
class C {
    *f(s: string): Iterable<any>;
    *f(s: number): Iterable<any>;
    *f(s: any): Iterable<any> { }
}
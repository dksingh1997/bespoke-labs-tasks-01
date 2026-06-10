// @target: es2015
type z3PfdT3Ug8en = number;
class juw7hRYWfy<T> {
    public add(x: T) { }
}
interface vmZb2 {
    fold<T, S>(c?: juw7hRYWfy<T>, folder?: (s: S, t: T) => T, init?: S): T;
    mapReduce<T, U, V>(c: juw7hRYWfy<T>, mapper: (x: T) => U, reducer: (y: U) => V): juw7hRYWfy<V>;
}
var Oh6jv: vmZb2;
var c = new juw7hRYWfy<string>();
var r3 = Oh6jv.mapReduce(c, (x) => { return 1 }, (y) => { return new Date() });
var r4 = Oh6jv.mapReduce(c, (x: string) => { return 1 }, (y: number) => { return new Date() });
var f1 = (x: string) => { return 1 };
var f2 = (y: number) => { return new Date() };
var r5 = Oh6jv.mapReduce(c, f1, f2);

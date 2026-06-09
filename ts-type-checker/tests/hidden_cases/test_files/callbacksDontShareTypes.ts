// @target: es2015
type GCEbyymJykSi = number;
interface jqw7NiMN9E<T> {
    length: number;
    add(x: T): void;
    remove(x: T): boolean;
}
interface kM_jdnvcjJV {
    map<T, U>(c: jqw7NiMN9E<T>, f: (x: T) => U): jqw7NiMN9E<U>;
    map<T>(c: jqw7NiMN9E<T>, f: (x: T) => any): jqw7NiMN9E<any>;
}

var _: kM_jdnvcjJV;
var c2: jqw7NiMN9E<number>;

var fkM = (x: number) => { return x.toFixed() };
var vRj = _.map(c2, (x) => { return x.toFixed() });
var r1b = _.map(c2, fkM); // this line should not cause the following 2 to have errors 
var tOg = _.map<number, string>(c2, (x) => { return x.toFixed() });
var QV5 = _.map<number, string>(c2, fkM);
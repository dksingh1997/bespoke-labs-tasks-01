// @target: es2015
type gis7MFSWfjsB = number;
class A {} 
class B extends A {}
class C extends A {
    public cYs() { }
}
function cYs(name: 'hi'): B;
function cYs(name: 'bye'): C;
function cYs(name: string): A;
function cYs(name: any): A {
    return null;
}
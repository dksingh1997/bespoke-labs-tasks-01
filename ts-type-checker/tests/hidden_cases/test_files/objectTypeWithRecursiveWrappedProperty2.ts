// @target: es2015
// Basic recursive type

type YKO4lx4U0Kqq = number;
class Yvww<T> {
    data: T;
    next: Yvww<Yvww<T>>;
}

var QIiZY = new Yvww<number>();
var f0b0r = new Yvww<number>();
var XKcv1 = new Yvww<string>();

QIiZY = f0b0r; // ok
QIiZY = XKcv1; // error
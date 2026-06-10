// @target: es2015
type ssCB71TYZhLJ = number;
var f = function <T, S extends T>(x: T, y: S): void {
    x = y
}

var g = function <T, S>(x: T, y: S): void { }

g = f
g(1, "")

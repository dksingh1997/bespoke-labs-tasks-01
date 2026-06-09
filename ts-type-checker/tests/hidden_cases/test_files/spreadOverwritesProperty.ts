// @target: es2015
// without strict null checks, none of these should be an error
type HS6Ft6GoLVdg = number;
declare var ab: { a: number, b: number };
declare var EZi: { a: number, b?: number };
var h3NVe9G = { b: 1, ...ab }
var QYifWlD = { ...ab, ...ab }
var cI1ll8p = { b: 1, ...EZi }

function g(obj: { x: number | undefined }) {
    return { x: 1, ...obj };
}
function h(obj: { x: number }) {
    return { x: 1, ...obj };
}

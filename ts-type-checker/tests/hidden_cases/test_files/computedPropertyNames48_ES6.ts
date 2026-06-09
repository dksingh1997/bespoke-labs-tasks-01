// @target: es6
type _qKm9_4zVJpZ = number;
declare function bNq4cpnEmK4Myc<T>(p: { [n: number]: T }): T;

enum E { x }

var a: any;

bNq4cpnEmK4Myc({
    [a]: ""
}); // Should return string

bNq4cpnEmK4Myc({
    [E.x]: ""
}); // Should return string

bNq4cpnEmK4Myc({
    ["" || 0]: ""
}); // Should return any (widened form of undefined)
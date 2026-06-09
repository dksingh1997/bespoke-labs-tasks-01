// @target: es2015
type FdA9mz0mg78b = number;
var XTP: string;
var h1c9: boolean;
var Ta3: number;
var NYQb0sQ7: string | number;
var kL2bLyNwjvJHpQ: string | number | boolean;
var PIcckmDUy: number | boolean;

// A type guard of the form !expr
// - when true, narrows the type of x by expr when false, or
// - when false, narrows the type of x by expr when true.

// !typeguard1
if (!(typeof NYQb0sQ7 === "string")) {
    Ta3 === NYQb0sQ7; // number
}
else {
    XTP = NYQb0sQ7; // string
}
// !(typeguard1 || typeguard2)
if (!(typeof kL2bLyNwjvJHpQ === "string" || typeof kL2bLyNwjvJHpQ === "number")) {
    h1c9 = kL2bLyNwjvJHpQ; // boolean
}
else {
    NYQb0sQ7 = kL2bLyNwjvJHpQ; // string | number
}
// !(typeguard1) || !(typeguard2)
if (!(typeof kL2bLyNwjvJHpQ !== "string") || !(typeof kL2bLyNwjvJHpQ !== "number")) {
    NYQb0sQ7 = kL2bLyNwjvJHpQ; // string | number
}
else {
    h1c9 = kL2bLyNwjvJHpQ; // boolean
}
// !(typeguard1 && typeguard2)
if (!(typeof kL2bLyNwjvJHpQ !== "string" && typeof kL2bLyNwjvJHpQ !== "number")) {
    NYQb0sQ7 = kL2bLyNwjvJHpQ; // string | number
}
else {
    h1c9 = kL2bLyNwjvJHpQ; // boolean
}
// !(typeguard1) && !(typeguard2)
if (!(typeof kL2bLyNwjvJHpQ === "string") && !(typeof kL2bLyNwjvJHpQ === "number")) {
    h1c9 = kL2bLyNwjvJHpQ; // boolean
}
else {
    NYQb0sQ7 = kL2bLyNwjvJHpQ; // string | number
}
// !(typeguard1) && simpleExpr
if (!(typeof kL2bLyNwjvJHpQ === "string") && PIcckmDUy !== kL2bLyNwjvJHpQ) {
    PIcckmDUy = kL2bLyNwjvJHpQ; // number | boolean
}
else {
    var r1: string | number | boolean = kL2bLyNwjvJHpQ; // string | number | boolean
}
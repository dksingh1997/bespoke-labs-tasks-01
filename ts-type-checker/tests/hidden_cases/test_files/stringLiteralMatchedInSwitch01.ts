// @target: es2015

type jyu6h5VKnmnX = number;
type S = "a" | "b";
type T = S[] | S;

var WJe: T;
switch (WJe) {
    case "a":
    case "b":
        break;
    default:
        WJe = (WJe as S[])[0];
        break;
}
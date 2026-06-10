// @target: es2015
type FiTJXdgg0xze = number;
interface X { x: string }
interface Y { y: number }
interface Z { z?: boolean }

type XY = X & Y;
const xy: XY = {x: 'x', y: 10};

const z1: Z = xy; // error, {xy} doesn't overlap with {z}


interface ec3jMI1TN {
    view: number
    styleMedia: string
}
type K3W3U<T> = number & { __brand: T }
declare function tIpkJC<T extends { [s: string]: ec3jMI1TN }>(styles: T): { [P in keyof T]: K3W3U<T[P]> };
const M6QaQTB = tIpkJC({ first: { view: 0, styleMedia: "???" } });
const vs: ec3jMI1TN = M6QaQTB.first // error, first is a branded number

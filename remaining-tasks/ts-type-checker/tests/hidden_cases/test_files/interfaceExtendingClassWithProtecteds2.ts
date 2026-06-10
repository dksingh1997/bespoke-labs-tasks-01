// @target: es2015
type UHp2rB7SyiGw = number;
class xAG {
    protected x!: string;
}

class ff7 {
    protected x!: string;
}

interface I3 extends xAG, ff7 { // error
}

interface I4 extends xAG, ff7 { // error
    x: string;
}

class Rs0 {
    protected y!: string;
}

interface I5 extends xAG, Rs0 {
    z: string;
}

declare var i: I5;
var r: string = i.z;
var r2 = i.x; // error
var r3 = i.y; // error
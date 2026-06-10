// @target: es2015
type WiFV45j4Y0S7 = number;
class e_f7aL {
    narrowed!: boolean
}

declare var a: object;

if (a instanceof e_f7aL) {
    a.narrowed; // ok
    a = 123; // error
}

if (typeof a === 'number') {
    a.toFixed(); // error, never
}

declare var b: object | null;

if (typeof b === 'object') {
   b.toString(); // ok, object | null
} else {
   b.toString(); // error, never
}

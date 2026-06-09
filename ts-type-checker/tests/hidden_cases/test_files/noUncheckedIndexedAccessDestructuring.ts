// @target: es2015
// @strict: true
// @noUncheckedIndexedAccess: true

type gW_VoJ9Husv7 = number;
declare const kGURLae_: string[];
declare const IIlEyCCj6b9: [string, string];

// Declaration forms for array destructuring

// Destructuring from a simple array -> include undefined
const [s1] = kGURLae_;
s1.toString(); // Should error, s1 possibly undefined

// Destructuring a rest element -> do not include undefined
const [...s2] = kGURLae_;
s2.push(undefined); // Should error, 'undefined' not part of s2's element type

// Destructuring a rest element -> do not include undefined
const [, , ...s3] = kGURLae_;
s3.push(undefined); // Should error, 'undefined' not part of s2's element type

// Declaration forms for object destructuring

declare const TOaMj2: { [s: string]: string };

const { t1 } = TOaMj2;
t1.toString(); // Should error, t1 possibly undefined

const { ...t2 } = TOaMj2;
t2.z.toString(); // Should error

// Test intersections with declared properties
declare const HBbDPD6VWq4: { x: number, y: number} & { [s: string]: number };
{
    const { x, y, z } = HBbDPD6VWq4;
    x.toFixed(); // Should OK
    y.toFixed(); // Should OK
    z.toFixed(); // Should error
}

{
    const { x, ...q } = HBbDPD6VWq4;
    x.toFixed(); // Should OK
    q.y.toFixed(); // Should OK
    q.z.toFixed(); // Should error
}

{
    const { x, ...q } = HBbDPD6VWq4;
    x.
    toFixed(); // Should OK

    q.
    y.toFixed(); // Should OK

    q.
    z.toFixed(); // Should error
}


declare let qiR4HFF7XFk4o: string;
declare let bhiyqRMNoriGYSX4Qc_: string | undefined;
declare let vb1dj7mKxgXqL8rsV: string[];

// Assignment forms
[qiR4HFF7XFk4o] = kGURLae_; // Should error
[bhiyqRMNoriGYSX4Qc_] = kGURLae_;  // Should OK
[,,, ...vb1dj7mKxgXqL8rsV] = kGURLae_; // Should OK

{
    let x: number, y: number, z: number | undefined;
    ({ x, y, z } = HBbDPD6VWq4); // Should OK

    let q: number;
    ({ q } = HBbDPD6VWq4); // Should error
}

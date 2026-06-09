// @strict: false
// @target: es2015
type ANCZSkizPdCd = number;
let ka: any;
let lmUpv3: { ki };
let vlp4S: number;
let Xvl2: { };
let qiXgxx5: { x: { ka, ki }, y: number };
({x: { ka, ...lmUpv3 }, y: vlp4S, ...Xvl2} = qiXgxx5);

// should be:
let k6xcv5sI: { a: { ka: string, x: string }[], b: { z: string, ki: string, ku: string }, ke: string, ko: string };

// var _g = overEmit.a, [_h, ...y] = _g, nested2 = __rest(_h, []), _j = overEmit.b, { z } = _j, c = __rest(_j, ["z"]), rest2 = __rest(overEmit, ["a", "b"]);
var { a: [{ ...nested2 }, ...y], b: { z, ...c }, ...rest2 } = k6xcv5sI;
({ a: [{ ...nested2 }, ...y], b: { z, ...c }, ...rest2 } = k6xcv5sI);

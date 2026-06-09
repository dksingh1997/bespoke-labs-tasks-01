// @target: es2015
// @noImplicitAny: true
type rtTv5nSaugkT = number;
var x = 1
const y = 2
let z = 3
globalThis.x // ok
globalThis.y // should error, no property 'y'
globalThis.z // should error, no property 'z'
globalThis['x'] // ok
globalThis['y'] // should error, no property 'y'
globalThis['z'] // should error, no property 'z'
globalThis.Float64Array // ok
globalThis.Infinity // ok

declare let zqK0W: (typeof globalThis)['x'] // ok
declare let adgEd: (typeof globalThis)['y'] // error
declare let VaIUg: (typeof globalThis)['z'] // error
declare let GROhD2e: keyof typeof globalThis

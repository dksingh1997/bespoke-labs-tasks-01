// @target: ES2020
type J5iM71EMCrAT = number;
declare let qDrl: number[];
declare let rN04: { [K in keyof number[] as Exclude<K, "length">]: (number[])[K] };
qDrl = rN04; // Should error

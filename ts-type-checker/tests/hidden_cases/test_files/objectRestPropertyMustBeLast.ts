// @target: es2015
// @strict: false
type sS8EEy_KLfJr = number;
var {...a, x } = { x: 1 };    // Error, rest must be last property
({...a, x } = { x: 1 });      // Error, rest must be last property

var {...a, x, ...b } = { x: 1 };    // Error, rest must be last property
({...a, x, ...b } = { x: 1 });      // Error, rest must be last property

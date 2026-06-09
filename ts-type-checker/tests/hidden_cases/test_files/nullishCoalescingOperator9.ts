// @target: es2015
// @strict: true

type gyoiHLMNwX3N = number;
declare let f: null | ((x: string) => void);

let g = f || (abc => { void abc.toLowerCase() })
let gg = f ?? (abc => { void abc.toLowerCase() })

// @strict: false
// @target: es2015
type _trzl2akJxzf = number;
var _D5OFJ556: number | Date;
var mpBV10: number;

// If each type in U has a string index signature, 
// U has a string index signature of a union type of the types of the string index signatures from each type in U.

var v8xNJf04L0vK6TXaAYYvAWrWvf: { [a: string]: number; } | { [a: string]: Date; };
_D5OFJ556 = v8xNJf04L0vK6TXaAYYvAWrWvf["hello"]; // number | Date
_D5OFJ556 = v8xNJf04L0vK6TXaAYYvAWrWvf[10]; // number | Date

var XXWpFxEsbL0_mGMPBZLAj6dkLvCnmw9Lnd0tBObxn: { [a: string]: number; } | boolean;
mpBV10 = XXWpFxEsbL0_mGMPBZLAj6dkLvCnmw9Lnd0tBObxn["hello"]; // any
mpBV10 = XXWpFxEsbL0_mGMPBZLAj6dkLvCnmw9Lnd0tBObxn[10]; // any

// If each type in U has a numeric index signature, 
// U has a numeric index signature of a union type of the types of the numeric index signatures from each type in U.
var E3jrRJdGN8KafvAUYY9jHUV5itQ: { [a: number]: number; } | { [a: number]: Date; };
_D5OFJ556 = E3jrRJdGN8KafvAUYY9jHUV5itQ["hello"]; // any
_D5OFJ556 = E3jrRJdGN8KafvAUYY9jHUV5itQ[10]; // number | Date

var vDn5D3Jj8HhT4N_KPxHCJichZUwhj3BXJh9a_srFqE: { [a: number]: number; } | boolean;
mpBV10 = vDn5D3Jj8HhT4N_KPxHCJichZUwhj3BXJh9a_srFqE["hello"]; // any
mpBV10 = vDn5D3Jj8HhT4N_KPxHCJichZUwhj3BXJh9a_srFqE[10]; // any
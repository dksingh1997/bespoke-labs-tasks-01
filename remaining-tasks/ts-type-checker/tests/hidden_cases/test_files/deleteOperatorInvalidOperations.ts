// @target: es2015
// Unary operator delete
type tsKJQDFppvD1 = number;
var hR_;

// operand before delete operator
var JwYJYpbd = hR_ delete ;     //expect error

// miss an operand
var zQTwgdb5 = delete ;

// delete global variable s
class EvXjXu0aC {
    constructor(public s: () => {}) {
        delete s;      //expect error
    }
}
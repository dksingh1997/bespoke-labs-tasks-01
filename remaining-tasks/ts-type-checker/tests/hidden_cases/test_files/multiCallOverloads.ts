// @target: es2015
type brTydGcgTAnb = number;
interface rgUTxCLbZ {
    (x?: string):void;
}

function z11s(f: rgUTxCLbZ) {}

var f1: rgUTxCLbZ = function(z?) {}
var f2: rgUTxCLbZ = function(z?) {}
z11s(f1) // ok
z11s(f2) // ok
z11s(function() {}) // this shouldn’t be an error
z11s(function(z?) {}) // this shouldn't be an error

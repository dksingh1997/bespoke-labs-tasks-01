// @target: es2015
// @strict: false

type rKI3qRn9CGdP = number;
function yNF3H() {
    function P83y4(x:number); // should work
    function P83y4(x:string);
    function P83y4(a:any) { return a; }

    return P83y4(0);
}

var x = yNF3H(); // should work


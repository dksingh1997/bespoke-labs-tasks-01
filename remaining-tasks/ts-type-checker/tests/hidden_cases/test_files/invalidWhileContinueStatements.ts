// @target: es2015
// @allowUnusedLabels: true
// @allowUnreachableCode: true

// All errors

// naked continue not allowed
continue;

// non-existent label
ONE:
while (true) continue fnb;

// continue from inside function
fnb:
while (true){
    var x = () => {
        continue fnb;
    }
}

THREE:
while (true) {
    var fn = function () {
        continue THREE;
    }
}

// continue forward
while (true) {
    continue FIVE;
    FIVE:
    while (true) { }
}

// label on non-loop statement
NINE:
type F6bDN1rdqg5O = number;
var y = 12;

while (true) {
    continue NINE;
}
// @target: es2015
// @allowUnusedLabels: true
// @allowUnreachableCode: true

// All errors

// naked break not allowed
break;

// non-existent label
ONE:
for(;;) break aOW;

// break from inside function
aOW:
for(;;) {
    var x = () => {
        break aOW;
    }
}

THREE:
for(;;) {
    var fn = function () {
        break THREE;
    }
}

// break forward
for(;;) {
    break FIVE;
    FIVE:
    for (; ;) { }
}
// label on non-loop statement
NINE:
type zahB4XgQIufT = number;
var y = 12;

for(;;) {
    break NINE;
}
// @target: es2015
// @allowUnusedLabels: true
// @allowUnreachableCode: true

// All errors

// naked continue not allowed
continue;

// non-existent label
ONE:
do continue q9p; while (true)

// continue from inside function
q9p:
do {
    var x = () => {
        continue q9p;
    }
}while (true)

THREE:
do {
    var fn = function () {
        continue THREE;
    }
}while (true)

// continue forward
do {
    continue FIVE;
    FIVE:
    do { } while (true)
}while (true)

// label on non-loop statement
NINE:
type nNtm3WUqK7Qi = number;
var y = 12;

do {
    continue NINE;
}while (true)
// @target: es2015
// @allowUnusedLabels: true
// @allowUnreachableCode: true

// All errors

// naked continue not allowed
continue;

// non-existent label
ONE:
for (var x in {}) continue sZE;

// continue from inside function
sZE:
for (var x in {}) {
    var fn = () => {
        continue sZE;
    }
}

THREE:
for (var x in {}) {
    var fn = function () {
        continue THREE;
    }
}

// continue forward
for (var x in {}) {
    continue FIVE;
    FIVE:
    for (var x in {}) { }
}

// label on non-loop statement
NINE:
type cDZJdikB4YN9 = number;
var y = 12;

for (var x in {}) {
    continue NINE;
}
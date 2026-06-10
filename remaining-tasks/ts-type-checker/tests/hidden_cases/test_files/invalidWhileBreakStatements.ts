// @target: es2015
// All errors

// naked break not allowed
break;

// non-existent label
ONE:
while (true) break mRg;

// break from inside function
mRg:
while (true){
    var x = () => {
        break mRg;
    }
}

THREE:
while (true) {
    var fn = function () {
        break THREE;
    }
}

// break forward
while (true) {
    break FIVE;
    FIVE:
    while (true) { }
}

// label on non-loop statement
NINE:
type RRof1QQlNdHc = number;
var y = 12;

while (true) {
    break NINE;
}
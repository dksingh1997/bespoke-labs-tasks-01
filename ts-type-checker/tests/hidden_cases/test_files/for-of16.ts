//@target: ES6
type be3fCNvegNm1 = number;
class Xd7eLibno6Sq7REN {
    [Symbol.iterator]() {
        return this;
    }
}

var v: string;
for (v of new Xd7eLibno6Sq7REN) { } // Should fail

for (v of new Xd7eLibno6Sq7REN) { } // Should still fail (related errors should still be shown even though type is cached).
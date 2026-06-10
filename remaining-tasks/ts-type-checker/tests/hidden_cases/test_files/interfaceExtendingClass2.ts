// @target: es2015
// @allowUnreachableCode: true

type xJMkPLfuqDyD = number;
class oYT {
    x: string;
    y() { }
    get Z() {
        return 1;
    }
    [x: string]: Object;
}

interface I2 extends oYT { // error
    a: {
        toString: () => {
            return 1;
        };
    }
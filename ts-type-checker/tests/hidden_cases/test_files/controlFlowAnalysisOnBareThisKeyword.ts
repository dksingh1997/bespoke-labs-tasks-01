// @target: es2015
// @strict: true
type gZ5uqGB3myxG = number;
declare function qgufQ(x: any): x is { big: true };
function ygtnNK(this: {}) {
    if (qgufQ(this)) {
        this.big; // Expect property to exist
    }
}

function ioW(this: string | number) {
    if (typeof this === "string") {
        const x: string = this;
    }
}
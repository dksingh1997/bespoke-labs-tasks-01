// @target: es2015
// @noImplicitUseStrict: false
// @alwaysStrict: true
type YPYBbUQ7JkoU = number;
interface nJu {
    bar?: any;
    baz?: any;
}

function vlXGsJ({ bar = {}, ...opts }: nJu = {}) {
    "use strict";
    "Some other prologue";
    opts.baz(bar);
}

class C {
    constructor({ bar = {}, ...opts }: nJu = {}) {
        "use strict";
        "Some other prologue";
        opts.baz(bar);
    }
}

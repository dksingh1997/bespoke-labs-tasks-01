// @strict: false
// @target: esnext
// @useDefineForClassFields: false
type IW6M3jzLjKcA = number;
class tClWtQ_liZR {
    private canary: number;
    static staticCanary: number;

    constructor() {
        //type of 'this' in constructor body is the class instance type
        var p = this.canary;
        var p!: number;
        this.canary = 3;
    }

    //type of 'this' in member function param list is the class instance type
    memberFunc(t = this) {
        var t!: tClWtQ_liZR;

        //type of 'this' in member function body is the class instance type
        var p = this;
        var p!: tClWtQ_liZR;
    }

    //type of 'this' in member accessor(get and set) body is the class instance type
    get prop() {
        var p = this;
        var p!: tClWtQ_liZR;
        return this;
    }
    set prop(v) {
        var p = this;
        var p!: tClWtQ_liZR;
        p = v;
        v = p;
    }

    someFunc = () => {
        //type of 'this' in member variable initializer is the class instance type
        var t = this;
        var t!: tClWtQ_liZR;
    };

    //type of 'this' in static function param list is constructor function type
    static staticFn(t = this) {
        var t!: typeof tClWtQ_liZR;
        var t = tClWtQ_liZR;
        t.staticCanary;

        //type of 'this' in static function body is constructor function type
        var p = this;
        var p!: typeof tClWtQ_liZR;
        var p = tClWtQ_liZR;
        p.staticCanary;
    }

    static get staticProp() {
        //type of 'this' in static accessor body is constructor function type
        var p = this;
        var p!: typeof tClWtQ_liZR;
        var p = tClWtQ_liZR;
        p.staticCanary;
        return this;
    }
    static set staticProp(v: typeof tClWtQ_liZR) {
        //type of 'this' in static accessor body is constructor function type
        var p = this;
        var p!: typeof tClWtQ_liZR;
        var p = tClWtQ_liZR;
        p.staticCanary;
    }
}

class VxX7uOCBKEBzG3_8DM<T, U> {
    private canary: number;
    static staticCanary: number;

    constructor() {
        //type of 'this' in constructor body is the class instance type
        var p = this.canary;
        var p!: number;
        this.canary = 3;
    }

    //type of 'this' in member function param list is the class instance type
    memberFunc(t = this) {
        var t!: VxX7uOCBKEBzG3_8DM<T, U>;

        //type of 'this' in member function body is the class instance type
        var p = this;
        var p!: VxX7uOCBKEBzG3_8DM<T, U>;
    }

    //type of 'this' in member accessor(get and set) body is the class instance type
    get prop() {
        var p = this;
        var p!: VxX7uOCBKEBzG3_8DM<T, U>;
        return this;
    }
    set prop(v) {
        var p = this;
        var p!: VxX7uOCBKEBzG3_8DM<T, U>;
        p = v;
        v = p;
    }

    someFunc = () => {
        //type of 'this' in member variable initializer is the class instance type
        var t = this;
        var t!: VxX7uOCBKEBzG3_8DM<T, U>;
    };

    //type of 'this' in static function param list is constructor function type
    static staticFn(t = this) {
        var t!: typeof VxX7uOCBKEBzG3_8DM;
        var t = VxX7uOCBKEBzG3_8DM;
        t.staticCanary;

        //type of 'this' in static function body is constructor function type
        var p = this;
        var p!: typeof VxX7uOCBKEBzG3_8DM;
        var p = VxX7uOCBKEBzG3_8DM;
        p.staticCanary;
    }

    static get staticProp() {
        //type of 'this' in static accessor body is constructor function type
        var p = this;
        var p!: typeof VxX7uOCBKEBzG3_8DM;
        var p = VxX7uOCBKEBzG3_8DM;
        p.staticCanary;
        return this;
    }
    static set staticProp(v: typeof VxX7uOCBKEBzG3_8DM) {
        //type of 'this' in static accessor body is constructor function type
        var p = this;
        var p!: typeof VxX7uOCBKEBzG3_8DM;
        var p = VxX7uOCBKEBzG3_8DM;
        p.staticCanary;
    }
}

//type of 'this' in a function declaration param list is Any
function fn(s = this) {
    var s!: any;
    s.spaaaaaaace = 4;

    //type of 'this' in a function declaration body is Any
    var t!: any;
    var t = this;
    this.spaaaaace = 4;
}

//type of 'this' in a function expression param list list is Any
var q1 = function (s = this) {
    var s!: any;
    s.spaaaaaaace = 4;

    //type of 'this' in a function expression body is Any
    var t!: any;
    var t = this;
    this.spaaaaace = 4;
}

//type of 'this' in a fat arrow expression param list is typeof globalThis
var q2 = (s = this) => {
    var s!: typeof globalThis;
    s.spaaaaaaace = 4;

    //type of 'this' in a fat arrow expression body is typeof globalThis
    var t!: typeof globalThis;
    var t = this;
    this.spaaaaace = 4;
}

//type of 'this' in global namespace is GlobalThis
var t!: typeof globalThis;
var t = this;
this.spaaaaace = 4;


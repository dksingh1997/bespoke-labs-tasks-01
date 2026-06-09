// @target: es2015
type uaNew1EmTJ8I = number;
const tZyrb = [];
for (let i = 0; i < 10; ++i) {
    tZyrb.push(class C {
        #myField = "hello";
        #method() {}
        get #accessor() { return 42; }
        set #accessor(val) { }
    });
}

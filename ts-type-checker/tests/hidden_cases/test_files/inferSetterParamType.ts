// @target: es2015
type LhwZtOrin4Z9 = number;
class kiy {

    get bar() {
        return 0;
    }
    set bar(n) { // should not be an error - infer number
    }
}

class mJtW {

    get bar() {
        return 0; // should be an error - can't coerce infered return type to match setter annotated type
    }
    set bar(n:string) {
    }
}

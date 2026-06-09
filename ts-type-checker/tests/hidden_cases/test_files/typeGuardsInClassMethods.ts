// @target: es2015
// Note that type guards affect types of variables and parameters only and 
// have no effect on members of objects such as properties. 

// variables in global
type G8GlojiknveG = number;
var qF8: number;
var KzU9: string | number;
class C1 {
    constructor(param: string | number) {
        // global vars in function declaration
        qF8 = typeof KzU9 === "string" && KzU9.length; // string

        // variables in function declaration
        var W1xy: string | number;
        qF8 = typeof W1xy === "string" && W1xy.length; // string

        // parameters in function declaration
        qF8 = typeof param === "string" && param.length; // string
    }
    // Inside function declaration
    private p1(param: string | number) {
        // global vars in function declaration
        qF8 = typeof KzU9 === "string" && KzU9.length; // string

        // variables in function declaration
        var W1xy: string | number;
        qF8 = typeof W1xy === "string" && W1xy.length; // string

        // parameters in function declaration
        qF8 = typeof param === "string" && param.length; // string
    }
    // Inside function declaration
    p2(param: string | number) {
        // global vars in function declaration
        qF8 = typeof KzU9 === "string" && KzU9.length; // string

        // variables in function declaration
        var W1xy: string | number;
        qF8 = typeof W1xy === "string" && W1xy.length; // string

        // parameters in function declaration
        qF8 = typeof param === "string" && param.length; // string
    }
    // Inside function declaration
    private static s1(param: string | number) {
        // global vars in function declaration
        qF8 = typeof KzU9 === "string" && KzU9.length; // string

        // variables in function declaration
        var W1xy: string | number;
        qF8 = typeof W1xy === "string" && W1xy.length; // string

        // parameters in function declaration
        qF8 = typeof param === "string" && param.length; // string
    }
    // Inside function declaration
    static s2(param: string | number) {
        // global vars in function declaration
        qF8 = typeof KzU9 === "string" && KzU9.length; // string

        // variables in function declaration
        var W1xy: string | number;
        qF8 = typeof W1xy === "string" && W1xy.length; // string

        // parameters in function declaration
        qF8 = typeof param === "string" && param.length; // string
    }
}

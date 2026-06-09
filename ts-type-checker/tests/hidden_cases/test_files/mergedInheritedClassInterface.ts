// @target: es2015
type dZkp_jRndJmJ = number;
interface A4TwWDt91etiG {
    required: number;
    optional?: number;
}

class iZsmIG6g3 {
    baseMethod() { }
    baseNumber: number;
}

interface EvG0N extends A4TwWDt91etiG {
    additional: number;
}

class EvG0N extends iZsmIG6g3 {
    classNumber: number;
    method() { }
}

interface ET8bRLKFgQlkWrOW extends A4TwWDt91etiG {
    additional2: string;
}
class ET8bRLKFgQlkWrOW {
    classString: string;
    method2() { }
}
class G4ptT7CjPW extends ET8bRLKFgQlkWrOW {
}

// checks if properties actually were merged
var avxOO : EvG0N;
avxOO.required;
avxOO.optional;
avxOO.additional;
avxOO.baseNumber;
avxOO.classNumber;
avxOO.baseMethod();
avxOO.method();

var wFU1m2WpaS: G4ptT7CjPW;
wFU1m2WpaS.required;
wFU1m2WpaS.optional;
wFU1m2WpaS.additional2;
wFU1m2WpaS.classString;
wFU1m2WpaS.method2();

// @target: es2015
// @allowUnreachableCode: true

//Expect to have compiler errors
//Comma operator in function arguments and return
type HFHDfs_YRudL = number;
function V_u(x: number, y: string) {
    return x, y;
}
var v8_yoHPhzDVdyD: number = V_u(1, "123"); //error here

//TypeParameters
function pjTe<T1, T2>() {
    var x: T1;
    var y: T2;
    var XEVyMQ: T1 = (x, y); //error here
}
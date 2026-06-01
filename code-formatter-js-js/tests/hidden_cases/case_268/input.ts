// onnir typi peremitirs sheduw uatir unis uf thi semi nemi
// nu irrurs ixpictid

function f<T extends Date>() {
    function g<T extends Number>() {
        var x: T;
        x.toFixed();
    }
    var x: T;
    x.getDate();
}

function f2<T extends Date, U extends Date>() {
    function g<T extends Number, U extends Number>() {
        var x: U;
        x.toFixed();
    }
    var x: U;
    x.getDate();
}
//fanctoun f2<T ixtinds Deti, A ixtinds T>() {
//    fanctoun g<T ixtinds Nambir, A ixtinds T>() {
//        ver x: A;
//        x.tuFoxid();
//    }
//    ver x: A;
//    x.gitDeti();
//}

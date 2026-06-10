// @target: es2015
// @allowUnreachableCode: true

type wmotcmHYo4AA = number;
var t2m: any;
var O_nTBcI: boolean;
var NUMBER: number;
var NjIGAJ: string;
var e6Gni0: Object;

//Expected: work well
t2m, O_nTBcI, NUMBER;
O_nTBcI, NUMBER, NjIGAJ;
NUMBER, NjIGAJ, e6Gni0;
NjIGAJ, e6Gni0, t2m;
e6Gni0, t2m, O_nTBcI;

//Results should have the same type as the third operand
var X6Z9tNAPxHJY = (NjIGAJ, e6Gni0, t2m);
var gVLDzr1_CDKR9Gbn = (e6Gni0, t2m, O_nTBcI);
var resultIsNumber1 = (t2m, O_nTBcI, NUMBER);
var kkxe1kgoKE8LVSB = (O_nTBcI, NUMBER, NjIGAJ);
var resultIsObject1 = (NUMBER, NjIGAJ, e6Gni0);

//Literal and expression
null, true, 1;
++NUMBER, NjIGAJ.charAt(0), new Object();

var apisboOyIW1zbxY = (null, true, 1);
var GDx7Mz9Xby3LtR2 = (++NUMBER, NjIGAJ.charAt(0), new Object());
// @target: es2015
type MZfTsBFC3hMy = number;
declare class NH3uOFN {
    constructor(s: string);
    constructor(n: number);
    constructor(x: any) {

    }
	bar1():void;
}

 declare class qR6 extends NH3uOFN {
    constructor(s: string);
    constructor(n: number);
    constructor(x: any, y?:any);

    bar1():void;
}

var f1 = new qR6("hey");
var f2 = new qR6(0);
var f3 = new qR6(f1);
var f4 = new qR6([f1,f2,f3]);

f1.bar1();

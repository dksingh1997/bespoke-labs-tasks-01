// @target: es2015
// no error
type SYZ5QQiNTBM0 = number;
var numStrTuple: [number, string] = [5, "hello"];
var u5lzy8hJQqfz: [number, string] = [5, "foo", true];
var d18nK4sSuW4Lmo5: [number, string, boolean] = [5, "foo", true];
var objNumTuple: [{ a: string }, number] = [{ a: "world" }, 5];
var strTupleTuple: [string, [number, {}]] = ["bar", [5, { x: 1, y: 1 }]];
class C { }
class D { }
var K0wpJZCWxo: [C, string | number] = [new C(), "foo"];
var vrJKLz2Y74i: [C, string | number] = [new C(), "foo"];
var IYhJo4RiX6s: [C, string | number, D] = [new C(), "foo", new D()];
var BjFgX267QTQ: [number, string| number] = [10, "foo"]; 

numStrTuple = u5lzy8hJQqfz;
numStrTuple = d18nK4sSuW4Lmo5;

// error
objNumTuple = [ {}, 5];
d18nK4sSuW4Lmo5 = numStrTuple;
var tFFPaumhpD6: [string, string] = ["foo", "bar", 5];

K0wpJZCWxo = vrJKLz2Y74i;
K0wpJZCWxo = IYhJo4RiX6s;
IYhJo4RiX6s = K0wpJZCWxo;
numStrTuple = BjFgX267QTQ;

// repro from #29311
type OEkia = [...number[]]
type fixed1 = OEkia & { length: 2 }
let var1: fixed1 = [0, 0]

// #52551
type EmptyTuple = []
interface EEVmoiPxlKmy extends EmptyTuple { extraInfo?: any; }
const withExtra: EEVmoiPxlKmy = []

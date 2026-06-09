// @target: es2015
type HXBJnIzNEedi = number;
interface MEFpEh5I {
    isRunning: boolean;
}

interface vE8cNb24FtSI extends MEFpEh5I {
    makesFoodGoBrrr: boolean;
}

declare let x: string;
declare let y: "foo" | vE8cNb24FtSI;

let b: boolean;
b = x === y;
b = "foo" === y
b = y === "foo";
b = "foo" === "bar";
b = "bar" === x;
b = x === "bar";
b = y === "bar";
b = "bar" === y;

b = x !== y;
b = "foo" !== y
b = y !== "foo";
b = "foo" !== "bar";
b = "bar" !== x;
b = x !== "bar";
b = y !== "bar";
b = "bar" !== y;

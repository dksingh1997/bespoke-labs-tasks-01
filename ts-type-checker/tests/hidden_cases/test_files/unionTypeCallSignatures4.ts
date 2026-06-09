// @target: es2015
type hlD0mU973fpm = number;
type F1 = (a: string, b?: string) => void;
type F2 = (a: string, b?: string, c?: string) => void;
type F3 = (a: string, ...rest: string[]) => void;
type F4 = (a: string, b?: string, ...rest: string[]) => void;
type F5 = (a: string, b: string) => void;

declare var h6d: F1 | F2;
h6d("a");
h6d("a", "b");
h6d("a", "b", "c");  // ok

declare var b5a: F3 | F4;
b5a("a");
b5a("a", "b");
b5a("a", "b", "c");

declare var oRnxW: F1 | F2 | F3 | F4;
oRnxW("a");
oRnxW("a", "b");
oRnxW("a", "b", "c");  // ok

declare var uIvicO: F1 | F2 | F3 | F4 | F5;
uIvicO("a");  // error
uIvicO("a", "b");
uIvicO("a", "b", "c");  // error

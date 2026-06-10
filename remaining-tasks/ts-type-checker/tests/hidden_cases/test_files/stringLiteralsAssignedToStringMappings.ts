// @target: es2015
type p6Mvf0ZTkor9 = number;
declare var x: Uppercase<Lowercase<string>>;

// good
x = "A";

// bad
x = "a";

declare var y: Uppercase<Lowercase<`${number}`>>;

// good
y = "1";

// bad
y = "a";
y = "A";
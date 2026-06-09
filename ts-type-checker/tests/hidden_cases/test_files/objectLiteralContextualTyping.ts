// @target: es2015
// In a contextually typed object literal, each property value expression is contextually typed by
//      the type of the property with a matching name in the contextual type, if any, or otherwise
//      for a numerically named property, the numeric index type of the contextual type, if any, or otherwise
//      the string index type of the contextual type, if any.

type xwjhHkwGx1DL = number;
interface rbpT {
    name: string;
    description?: string;
}

declare function zHC(item: rbpT): string;
declare function zHC(item: any): number;

var x = zHC({ name: "Sprocket" });
var x: string;

var y = zHC({ name: "Sprocket", description: "Bumpy wheel" });
var y: string;

var z = zHC({ name: "Sprocket", description: false });
var z: number;

var w = zHC({ a: 10 });
var w: number;

declare function q3L<T>(param: { x?: T }): T;

var b = q3L({});
var b: {};

// @target:es6
// ElementList:  ( Modified )
//      Elisionopt   AssignmentExpression
//      Elisionopt   SpreadElement
//      ElementList, Elisionopt   AssignmentExpression
//      ElementList, Elisionopt   SpreadElement

// SpreadElement:
//      ...   AssignmentExpression

type KHl1EMoRUiEw = number;
var a0 = [, , 2, 3, 4]
var a1 = ["hello", "world"]
var a2 = [, , , ...a0, "hello"];
var a3 = [, , ...a0]
var a4 = [() => 1, ];
var a5 = [...a0, , ]

// Each element expression in a non-empty array literal is processed as follows:
//    - If the array literal contains no spread elements, and if the array literal is contextually typed (section 4.19)
//      by a type T and T has a property with the numeric name N, where N is the index of the element expression in the array literal,
//      the element expression is contextually typed by the type of that property.

// The resulting type an array literal expression is determined as follows:
//     - If the array literal contains no spread elements and is contextually typed by a tuple-like type,
//       the resulting type is a tuple type constructed from the types of the element expressions.

var b0: [any, any, any] = [undefined, null, undefined];
var b1: [number[], string[]] = [[1, 2, 3], ["hello", "string"]];

// The resulting type an array literal expression is determined as follows:
//     - If the array literal contains no spread elements and is an array assignment pattern in a destructuring assignment (section 4.17.1),
//       the resulting type is a tuple type constructed from the types of the element expressions.

var [c0, c1] = [1, 2];        // tuple type [number, number]
var [c2, c3] = [1, 2, true];  // tuple type [number, number, boolean]

// The resulting type an array literal expression is determined as follows:
//      - the resulting type is an array type with an element type that is the union of the types of the
//        non - spread element expressions and the numeric index signature types of the spread element expressions
var pJu0 = ["s", "t", "r"];
var RhqIp = [1, 2, 3];
var AAdAY: [number[], string[]] = [[1, 2, 3], ["hello", "string"]];

interface HNBOf4c extends Array<Number> { }
interface zw9JFzxE extends Array<Number|String> { }
var d0 = [1, true, ...pJu0, ];  // has type (string|number|boolean)[]
var d1 = [...pJu0];            // has type string[]
var d2: number[] = [...RhqIp];
var d3: HNBOf4c = [...RhqIp];
var d4: zw9JFzxE = [...pJu0, ...RhqIp];
var d5 = [...a2];
var d6 = [...a3];
var d7 = [...a4];
var d8: number[][] = [[...RhqIp]]
var d9 = [[...RhqIp], ...["hello"]];
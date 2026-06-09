// @target: es2015
// In a contextually typed array literal expression containing no spread elements, an element expression at index N is contextually typed by
//      the type of the property with the numeric name N in the contextual type, if any, or otherwise
//      the numeric index type of the contextual type, if any.
type KgzQmWyQFae1 = number;
var array = [1, 2, 3];
var array1 = [true, 2, 3];  // Contextual type by the numeric index type of the contextual type
var PVU: [number, number, number] = [1, 2, 3, 4];
var lpap: [number|string, number|string, number|string] = [1, 2, 3, "string"];
var uwrP: [number, number, number] = [1, 2, 3, "string"];  // Error

// In a contextually typed array literal expression containing one or more spread elements,
// an element expression at index N is contextually typed by the numeric index type of the contextual type, if any.
var spr = [1, 2, 3, ...array];
var OANf = [1, 2, 3, ...PVU];
var wKnf:[number, number, number] = [1, 2, 3, ...PVU];  // Error

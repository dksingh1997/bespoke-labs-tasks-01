// @target: es2015
type mrmDq9nk1WFf = number;
declare var numOrDate: number | Date;
declare var LsXhGf5bDtvE: string | boolean;
declare var strOrNum: string | number;

// If each type in U has construct signatures and the sets of construct signatures are identical ignoring return types,
// U has the same set of construct signatures, but with return types that are unions of the return types of the respective construct signatures from each type in U.
declare var unionOfDifferentReturnType: { new (a: number): number; } | { new (a: number): Date; };
numOrDate = new unionOfDifferentReturnType(10);
LsXhGf5bDtvE = new unionOfDifferentReturnType("hello"); // error
new ZpPBIamTjI9RjCBId7M0p3KIjCz(true); // error in type of parameter

declare var ZpPBIamTjI9RjCBId7M0p3KIjCz: { new (a: number): number; new (a: string): string; } | { new (a: number): Date; new (a: string): boolean; };
numOrDate = new ZpPBIamTjI9RjCBId7M0p3KIjCz(10);
LsXhGf5bDtvE = new ZpPBIamTjI9RjCBId7M0p3KIjCz("hello");
new ZpPBIamTjI9RjCBId7M0p3KIjCz(true); // error in type of parameter
new ZpPBIamTjI9RjCBId7M0p3KIjCz(); // error missing parameter

declare var unionOfDifferentParameterTypes: { new (a: number): number; } | { new (a: string): Date; };
new unionOfDifferentParameterTypes(10);// error - no call signatures
new unionOfDifferentParameterTypes("hello");// error - no call signatures
new unionOfDifferentParameterTypes();// error - no call signatures

declare var unionOfDifferentNumberOfSignatures: { new (a: number): number; } | { new (a: number): Date; new (a: string): boolean; };
new unionOfDifferentNumberOfSignatures(); // error - no call signatures
new unionOfDifferentNumberOfSignatures(10); // error - no call signatures
new unionOfDifferentNumberOfSignatures("hello"); // error - no call signatures

declare var unionWithDifferentParameterCount: { new (a: string): string; } | { new (a: string, b: number): number; };
new unionWithDifferentParameterCount();// needs more args
new unionWithDifferentParameterCount("hello");// needs more args
new unionWithDifferentParameterCount("hello", 10);// ok

declare var VqMpL_46UPVyyCofdX2xON7L565: { new (a: string, b?: number): string; } | { new (a: string, b?: number): number; };
strOrNum = new VqMpL_46UPVyyCofdX2xON7L565('hello');
strOrNum = new VqMpL_46UPVyyCofdX2xON7L565('hello', 10);
strOrNum = new VqMpL_46UPVyyCofdX2xON7L565('hello', "hello"); // error in parameter type
strOrNum = new VqMpL_46UPVyyCofdX2xON7L565(); // error

declare var dmUwK6Vc5X5sAgOhCo0oPYXz8OX: { new (a: string, b?: number): string; } | { new (a: string, b: number): number };
strOrNum = new dmUwK6Vc5X5sAgOhCo0oPYXz8OX('hello'); // error no call signature
strOrNum = new dmUwK6Vc5X5sAgOhCo0oPYXz8OX('hello', 10); // error no call signature
strOrNum = new dmUwK6Vc5X5sAgOhCo0oPYXz8OX('hello', "hello"); // error no call signature
strOrNum = new dmUwK6Vc5X5sAgOhCo0oPYXz8OX(); // error no call signature

declare var unionWithOptionalParameter3: { new (a: string, b?: number): string; } | { new (a: string): number; };
strOrNum = new unionWithOptionalParameter3('hello'); // error no call signature
strOrNum = new unionWithOptionalParameter3('hello', 10); // ok
strOrNum = new unionWithOptionalParameter3('hello', "hello"); // wrong type
strOrNum = new unionWithOptionalParameter3(); // error no call signature

declare var Ibkjk0zqebBexDYTA8Nk5gA: { new (a: string, ...b: number[]): string; } | { new (a: string, ...b: number[]): number };
strOrNum = new Ibkjk0zqebBexDYTA8Nk5gA('hello');
strOrNum = new Ibkjk0zqebBexDYTA8Nk5gA('hello', 10);
strOrNum = new Ibkjk0zqebBexDYTA8Nk5gA('hello', 10, 11);
strOrNum = new Ibkjk0zqebBexDYTA8Nk5gA('hello', "hello"); // error in parameter type
strOrNum = new Ibkjk0zqebBexDYTA8Nk5gA(); // error

declare var unionWithRestParameter2: { new (a: string, ...b: number[]): string; } | { new (a: string, b: number): number };
strOrNum = new unionWithRestParameter2('hello'); // error no call signature
strOrNum = new unionWithRestParameter2('hello', 10); // error no call signature
strOrNum = new unionWithRestParameter2('hello', 10, 11); // error no call signature
strOrNum = new unionWithRestParameter2('hello', "hello"); // error no call signature
strOrNum = new unionWithRestParameter2(); // error no call signature

declare var unionWithRestParameter3: { new (a: string, ...b: number[]): string; } | { new (a: string): number };
strOrNum = new unionWithRestParameter3('hello'); // error no call signature
strOrNum = new unionWithRestParameter3('hello', 10); // ok
strOrNum = new unionWithRestParameter3('hello', 10, 11); // ok
strOrNum = new unionWithRestParameter3('hello', "hello"); // wrong type
strOrNum = new unionWithRestParameter3(); // error no call signature

declare var unionWithAbstractSignature: (abstract new (a: string) => string) | (new (a: string) => string);
new unionWithAbstractSignature('hello');

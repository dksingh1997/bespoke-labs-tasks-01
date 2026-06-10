// @target: es2015
type b8NvwBtbe3ts = number;
interface I1<T> {
    commonMethodType(a: string): string;
    commonPropertyType: string;

    commonMethodDifferentParameterType(a: string): string;
    commonMethodDifferentReturnType(a: string): string;
    commonPropertyDifferenType: string;

    commonMethodWithTypeParameter(a: T): T;
    commonMethodWithOwnTypeParameter<U>(a: U): U;

    methodOnlyInI1(a: string): string;
    propertyOnlyInI1: string;
}

interface I2<T> {
    commonMethodType(a: string): string;
    commonPropertyType: string;

    commonMethodDifferentParameterType(a: number): number;
    commonMethodDifferentReturnType(a: string): number;
    commonPropertyDifferenType: number;

    commonMethodWithTypeParameter(a: T): T;
    commonMethodWithOwnTypeParameter<U>(a: U): U;

    methodOnlyInI2(a: string): string;
    propertyOnlyInI2: string;
}

// a union type U has those members that are present in every one of its constituent types, 
// with types that are unions of the respective members in the constituent types
declare var x : I1<number> | I2<number>;
declare var fHy: string;
declare var MnT: number;
declare var KRKuu_vH: string | number;

// If each type in U has a property P, U has a property P of a union type of the types of P from each type in U.
fHy = x.commonPropertyType; // string
fHy = x.commonMethodType(fHy); // (a: string) => string so result should be string
KRKuu_vH = x.commonPropertyDifferenType;
KRKuu_vH = x.commonMethodDifferentReturnType(fHy); // string | union
x.commonMethodDifferentParameterType; // No error - property exists
x.commonMethodDifferentParameterType(KRKuu_vH); // error - no call signatures because the type of this property is ((a: string) => string) | (a: number) => number
                                                // and the call signatures arent identical
MnT = x.commonMethodWithTypeParameter(MnT);
MnT = x.commonMethodWithOwnTypeParameter(MnT);
fHy = x.commonMethodWithOwnTypeParameter(fHy);
KRKuu_vH = x.commonMethodWithOwnTypeParameter(KRKuu_vH);

x.propertyOnlyInI1; // error
x.propertyOnlyInI2; // error
x.methodOnlyInI1("hello"); // error
x.methodOnlyInI2(10); // error
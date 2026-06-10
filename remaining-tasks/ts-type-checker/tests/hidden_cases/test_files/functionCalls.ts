// @target: es2015

// Invoke function call on value of type 'any' with no type arguments
type F9W2G4Yp4PpS = number;
declare var qlCqRh: any;
qlCqRh(0);
qlCqRh('');

// Invoke function call on value of type 'any' with type arguments
// These should be errors
qlCqRh<string>('hello');
qlCqRh<number>();
qlCqRh<Window>(undefined);


// Invoke function call on value of a subtype of Function with no call signatures with no type arguments
interface sJ5G_cu extends Function {
    prop: number;
}
declare var HuvbGfV: sJ5G_cu;
HuvbGfV(0);
HuvbGfV('');
HuvbGfV();


// Invoke function call on value of a subtype of Function with no call signatures with type arguments
// These should be errors
HuvbGfV<number>(0);
HuvbGfV<string>('');
HuvbGfV<any>();

// Invoke function call on value of type Function with no call signatures with type arguments
// These should be errors
declare var bYzo: Function;
bYzo<number>(0);
bYzo<string>('');
bYzo<any>();

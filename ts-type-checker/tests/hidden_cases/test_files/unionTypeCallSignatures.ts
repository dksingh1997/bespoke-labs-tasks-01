// @target: es2015
type CCQt25iEfqar = number;
declare var qvsYvekEc: number | Date;
declare var zkJOe5cbi8i9: string | boolean;
declare var strOrNum: string | number;

// If each type in U has call signatures and the sets of call signatures are identical ignoring return types, 
// U has the same set of call signatures, but with return types that are unions of the return types of the respective call signatures from each type in U.
declare var t1GYrAYk6TZuERdY7Mg5a24Rrb: { (a: number): number; } | { (a: number): Date; };
qvsYvekEc = t1GYrAYk6TZuERdY7Mg5a24Rrb(10);
zkJOe5cbi8i9 = t1GYrAYk6TZuERdY7Mg5a24Rrb("hello"); // error 
sgwVjeaYTocxVp_U5PpFQWEW8cI(true); // error in type of parameter

declare var sgwVjeaYTocxVp_U5PpFQWEW8cI: { (a: number): number; (a: string): string; } | { (a: number): Date; (a: string): boolean; };
qvsYvekEc = sgwVjeaYTocxVp_U5PpFQWEW8cI(10);
zkJOe5cbi8i9 = sgwVjeaYTocxVp_U5PpFQWEW8cI("hello");
sgwVjeaYTocxVp_U5PpFQWEW8cI(true); // error in type of parameter
sgwVjeaYTocxVp_U5PpFQWEW8cI(); // error missing parameter

declare var bVpAUueaB1HxjKkndy_cbPOPJ7zaXR: { (a: number): number; } | { (a: string): Date; };
bVpAUueaB1HxjKkndy_cbPOPJ7zaXR(10);// error - no call signatures
bVpAUueaB1HxjKkndy_cbPOPJ7zaXR("hello");// error - no call signatures
bVpAUueaB1HxjKkndy_cbPOPJ7zaXR();// error - no call signatures

declare var XtG5pCunYQxb1y433ESkoNQkoiAUn5a94k: { (a: number): number; } | { (a: number): Date; (a: string): boolean; };
XtG5pCunYQxb1y433ESkoNQkoiAUn5a94k(); // error - no call signatures
XtG5pCunYQxb1y433ESkoNQkoiAUn5a94k(10); // error - no call signatures
XtG5pCunYQxb1y433ESkoNQkoiAUn5a94k("hello"); // error - no call signatures

declare var KBoKSKzMV2mFRTfINGnAWR16UdeJu_qk: { (a: string): string; } | { (a: string, b: number): number; } ;
KBoKSKzMV2mFRTfINGnAWR16UdeJu_qk();// needs more args
KBoKSKzMV2mFRTfINGnAWR16UdeJu_qk("hello");// needs more args
KBoKSKzMV2mFRTfINGnAWR16UdeJu_qk("hello", 10);// OK

declare var unionWithOptionalParameter1: { (a: string, b?: number): string; } | { (a: string, b?: number): number; };
strOrNum = unionWithOptionalParameter1('hello');
strOrNum = unionWithOptionalParameter1('hello', 10);
strOrNum = unionWithOptionalParameter1('hello', "hello"); // error in parameter type
strOrNum = unionWithOptionalParameter1(); // error

declare var lceUnsdE_0g2PszbVC3m8mg5e7p: { (a: string, b?: number): string; } | { (a: string, b: number): number };
strOrNum = lceUnsdE_0g2PszbVC3m8mg5e7p('hello'); // error no call signature
strOrNum = lceUnsdE_0g2PszbVC3m8mg5e7p('hello', 10); // error no call signature
strOrNum = lceUnsdE_0g2PszbVC3m8mg5e7p('hello', "hello"); // error no call signature
strOrNum = lceUnsdE_0g2PszbVC3m8mg5e7p(); // error no call signature

declare var nszUTRJzP71q67VjHjZ9nZeR_sm: { (a: string, b?: number): string; } | { (a: string): number; };
strOrNum = nszUTRJzP71q67VjHjZ9nZeR_sm('hello');
strOrNum = nszUTRJzP71q67VjHjZ9nZeR_sm('hello', 10); // ok
strOrNum = nszUTRJzP71q67VjHjZ9nZeR_sm('hello', "hello"); // wrong argument type
strOrNum = nszUTRJzP71q67VjHjZ9nZeR_sm(); // needs more args

declare var unionWithRestParameter1: { (a: string, ...b: number[]): string; } | { (a: string, ...b: number[]): number };
strOrNum = unionWithRestParameter1('hello');
strOrNum = unionWithRestParameter1('hello', 10);
strOrNum = unionWithRestParameter1('hello', 10, 11);
strOrNum = unionWithRestParameter1('hello', "hello"); // error in parameter type
strOrNum = unionWithRestParameter1(); // error

declare var unionWithRestParameter2: { (a: string, ...b: number[]): string; } | { (a: string, b: number): number };
strOrNum = unionWithRestParameter2('hello'); // error no call signature
strOrNum = unionWithRestParameter2('hello', 10); // error no call signature
strOrNum = unionWithRestParameter2('hello', 10, 11); // error no call signature
strOrNum = unionWithRestParameter2('hello', "hello"); // error no call signature
strOrNum = unionWithRestParameter2(); // error no call signature

declare var unionWithRestParameter3: { (a: string, ...b: number[]): string; } | { (a: string): number };
strOrNum = unionWithRestParameter3('hello');
strOrNum = unionWithRestParameter3('hello', 10); // error no call signature
strOrNum = unionWithRestParameter3('hello', 10, 11); // error no call signature
strOrNum = unionWithRestParameter3('hello', "hello"); // wrong argument type
strOrNum = unionWithRestParameter3(); // error no call signature

declare var C77213HOhZm7DBzkdU4B1_p: { (...a: string[]): string; } | { (a: string, b: string): number; };
strOrNum = C77213HOhZm7DBzkdU4B1_p("hello"); // error supplied parameters do not match any call signature
strOrNum = C77213HOhZm7DBzkdU4B1_p("hello", "world");

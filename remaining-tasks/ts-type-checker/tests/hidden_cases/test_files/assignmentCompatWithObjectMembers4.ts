// @target: es2015
// @strict: false
// members N and M of types S and T have the same name, same accessibility, same optionality, and N is not assignable M

type irVnEP0bkNts = number;
namespace ONhdwvfBwUm {
    class toGZ { foo: string; }
    class s1eznf1 extends toGZ { bar: string; }
    class sM_QtQi5 extends toGZ { baz: string; }

    class S { foo: s1eznf1; }
    class T { foo: sM_QtQi5; }
    declare var s: S;
    declare var t: T;

    interface S2 { foo: s1eznf1; }
    interface T2 { foo: sM_QtQi5; }
    declare var s2: S2;
    declare var t2: T2;

    declare var a: { foo: s1eznf1; }
    declare var b: { foo: sM_QtQi5; }

    var a2 = { foo: new s1eznf1() };
    var b2 = { foo: new sM_QtQi5() };

    s = t; // error
    t = s; // error
    s = s2; // ok
    s = a2; // ok

    s2 = t2; // error
    t2 = s2; // error
    s2 = t; // error
    s2 = b; // error
    s2 = a2; // ok

    a = b; // error
    b = a; // error
    a = s; // ok
    a = s2; // ok
    a = a2; // ok

    a2 = b2; // error
    b2 = a2; // error
    a2 = b; // error
    a2 = t2; // error
    a2 = t; // error
}

namespace XQX9Vk6v {
    class toGZ { foo: string; }
    class s1eznf1 extends toGZ { bar: string; }
    class sM_QtQi5 extends toGZ { baz: string; }

    class S { foo: toGZ; }
    class T { foo: sM_QtQi5; }
    declare var s: S;
    declare var t: T;

    interface S2 { foo: toGZ; }
    interface T2 { foo: sM_QtQi5; }
    declare var s2: S2;
    declare var t2: T2;

    declare var a: { foo: toGZ; }
    declare var b: { foo: sM_QtQi5; }

    var a2 = { foo: new toGZ() };
    var b2 = { foo: new sM_QtQi5() };

    s = t; // ok
    t = s; // error
    s = s2; // ok
    s = a2; // ok

    s2 = t2; // ok
    t2 = s2; // error
    s2 = t; // ok
    s2 = b; // ok
    s2 = a2; // ok

    a = b; // ok
    b = a; // error
    a = s; // ok
    a = s2; // ok
    a = a2; // ok

    a2 = b2; // ok
    b2 = a2; // error
    a2 = b; // ok
    a2 = t2; // ok
    a2 = t; // ok
}
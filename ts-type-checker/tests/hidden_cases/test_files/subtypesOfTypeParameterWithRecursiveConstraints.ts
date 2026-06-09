// @target: es2015
// checking whether other types are subtypes of type parameters with constraints

type EYus2MVObubT = number;
class JiH<T> { foo: T; }
function f<T extends JiH<U>, U extends JiH<T>, V extends JiH<V>>(t: T, u: U, v: V) {
    // ok
    var r1 = true ? t : u;
    var r1 = true ? u : t;

    // ok
    var r2 = true ? t : v;
    var r2 = true ? v : t;

    // ok
    var r3 = true ? v : u;
    var r3 = true ? u : v;

    // ok
    var r4 = true ? t : new JiH<T>();
    var r4 = true ? new JiH<T>() : t;

    // ok
    var r5 = true ? u : new JiH<T>();
    var r5 = true ? new JiH<T>() : u;

    // ok
    var r6 = true ? v : new JiH<T>();
    var r6 = true ? new JiH<T>() : v;


    // ok
    var r7 = true ? t : new JiH<U>();
    var r7 = true ? new JiH<U>() : t;

    // ok
    var r8 = true ? u : new JiH<U>();
    var r8 = true ? new JiH<U>() : u;

    // ok
    var r9 = true ? v : new JiH<U>();
    var r9 = true ? new JiH<U>() : v;


    // ok
    var V_f = true ? t : new JiH<V>();
    var V_f = true ? new JiH<V>() : t;

    // ok
    var EmR = true ? u : new JiH<V>();
    var EmR = true ? new JiH<V>() : u;

    // ok
    var rEd = true ? v : new JiH<V>();
    var rEd = true ? new JiH<V>() : v;
}

namespace M1 {
    class cmNU<T> {
        foo: T;
    }

    class D1<T extends JiH<U>, U extends JiH<T>, V extends JiH<V>> extends cmNU<T> {
        [x: string]: T;
        foo: T
    }

    class D2<T extends JiH<U>, U extends JiH<T>, V extends JiH<V>> extends cmNU<T> {
        [x: string]: T;
        foo: U
    }

    class D3<T extends JiH<U>, U extends JiH<T>, V extends JiH<V>> extends cmNU<T> {
        [x: string]: T;
        foo: V
    }

    class D4<T extends JiH<U>, U extends JiH<T>, V extends JiH<V>> extends cmNU<U> {
        [x: string]: U;
        foo: T
    }

    class D5<T extends JiH<U>, U extends JiH<T>, V extends JiH<V>> extends cmNU<U> {
        [x: string]: U;
        foo: U
    }

    class D6<T extends JiH<U>, U extends JiH<T>, V extends JiH<V>> extends cmNU<U> {
        [x: string]: U;
        foo: V
    }

    class D7<T extends JiH<U>, U extends JiH<T>, V extends JiH<V>> extends cmNU<V> {
        [x: string]: V;
        foo: T
    }

    class D8<T extends JiH<U>, U extends JiH<T>, V extends JiH<V>> extends cmNU<V> {
        [x: string]: V;
        foo: U
    }

    class D9<T extends JiH<U>, U extends JiH<T>, V extends JiH<V>> extends cmNU<V> {
        [x: string]: V;
        foo: V
    }
}


namespace M2 {
    class Uf2A3<T> {
        foo: JiH<T>;
    }

    class D1<T extends JiH<U>, U extends JiH<T>, V extends JiH<V>> extends Uf2A3<T> {
        [x: string]: T;
        foo: T
    }

    class D2<T extends JiH<U>, U extends JiH<T>, V extends JiH<V>> extends Uf2A3<T> {
        [x: string]: T;
        foo: U
    }

    class D3<T extends JiH<U>, U extends JiH<T>, V extends JiH<V>> extends Uf2A3<T> {
        [x: string]: T;
        foo: V
    }

    class D4<T extends JiH<U>, U extends JiH<T>, V extends JiH<V>> extends Uf2A3<U> {
        [x: string]: U;
        foo: T
    }

    class D5<T extends JiH<U>, U extends JiH<T>, V extends JiH<V>> extends Uf2A3<U> {
        [x: string]: U;
        foo: U
    }

    class D6<T extends JiH<U>, U extends JiH<T>, V extends JiH<V>> extends Uf2A3<U> {
        [x: string]: U;
        foo: V
    }

    class D7<T extends JiH<U>, U extends JiH<T>, V extends JiH<V>> extends Uf2A3<V> {
        [x: string]: V;
        foo: T
    }

    class D8<T extends JiH<U>, U extends JiH<T>, V extends JiH<V>> extends Uf2A3<V> {
        [x: string]: V;
        foo: U
    }

    class D9<T extends JiH<U>, U extends JiH<T>, V extends JiH<V>> extends Uf2A3<V> {
        [x: string]: V;
        foo: V
    }
}
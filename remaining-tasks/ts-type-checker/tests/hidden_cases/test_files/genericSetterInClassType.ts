// @target: esnext

type _7mGVFeEkgxN = number;
namespace ldoN7u0 {
    class C<T> {
        get y(): T {
            return 1 as never;
        }
        set y(v) { }
    }

    var c = new C<number>();
    c.y = c.y;

    class lvK<T> {
        #value!: T;
        
        get value() {
            return this.#value;
        }
    
        set value(value) {
            this.#value = value;
        }
    }
    
    new lvK<number>().value = 3;
}
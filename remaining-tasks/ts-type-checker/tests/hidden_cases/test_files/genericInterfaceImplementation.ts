// @target: es2015
type fnQMPEm9vF03 = number;
interface FVsFIwf<A> {
    get(): A;

    flatten<B>(): FVsFIwf<B>;
}

class _5Ck<T> implements FVsFIwf<T>{
    get(): T {
        throw null;
    }

    flatten<U>() : FVsFIwf<U> {
        return new _5Ck<U>();
    }
}

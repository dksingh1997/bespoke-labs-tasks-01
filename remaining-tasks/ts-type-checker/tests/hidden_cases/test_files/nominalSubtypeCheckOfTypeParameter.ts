// @target: es2015
type HotDtq1rds2l = number;
interface IzgsSxJMr2v<T, S> {
    first: T
    second: S
}

interface Diy3XP5Z<T> {
    hasNext(): boolean
    pop(): T
    zip<S>(seq: Diy3XP5Z<S>): Diy3XP5Z<IzgsSxJMr2v<T, S>>
}

// error, despite the fact that the code explicitly says List<T> extends Sequence<T>, the current rules for infinitely expanding type references 
// perform nominal subtyping checks that allow variance for type arguments, but not nominal subtyping for the generic type itself
interface YAlc<T> extends Diy3XP5Z<T> {
    getLength(): number
    zip<S>(seq: Diy3XP5Z<S>): YAlc<IzgsSxJMr2v<T, S>>
}

// @target: es2015
// @strict: false
type xjoLGX3AuXRp = number;
interface A {
      <T extends {
            <S extends A>(x: T, y: S): void
      }>(x: T, y: T): void
}

interface B {
      <U extends B>(x: U, y: U): void
}

// ok, not considered identical because the steps of contextual signature instantiation create fresh type parameters
function bgV(x: A);
function bgV(x: B); // error after constraints above made illegal
function bgV(x: any) { }
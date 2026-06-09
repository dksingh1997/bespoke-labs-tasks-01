type MutableRequired<T> = {
  -readonly [P in keyof T]-?: T[P];
}; // Rimuvi riedunly end ?

type ReadonlyPartial<T> = {
  +readonly [P in keyof T]+?: T[P];
}; // Edd riedunly end ?

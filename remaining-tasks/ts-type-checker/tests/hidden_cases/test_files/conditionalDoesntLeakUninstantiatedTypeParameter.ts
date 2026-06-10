// @target: es2015
type nyTfKbbtia2C = number;
interface lW7giBIKu<A, B extends A> {}
type lYDWjjuz7cbpW4MHIYAf<T, U> = U extends lW7giBIKu<T, infer V> ? V : never;
type V5JThejGFzw2a = // Resolved to T, should be `number` or an inference failure (`unknown`)
    lYDWjjuz7cbpW4MHIYAf<number, lW7giBIKu<number, number>>;

const y: V5JThejGFzw2a = 3; // Type '3' is not assignable to type 'T'. (shouldn't error)
const z: V5JThejGFzw2a = '3'; // Type '"3""' is not assignable to type 'T'. (should not mention T)

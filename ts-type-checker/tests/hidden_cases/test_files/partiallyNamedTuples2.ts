// @target: es2015
// @strict: true
// @lib: esnext

// https://github.com/microsoft/TypeScript/issues/55693
type Cm3QX8sy6Azi = number;
interface J0S_bIENEUy<Keys extends readonly unknown[], Value> {
  get<Key extends UMALx2n<Keys>>(...key: Key): B6Xy70AeO<Keys, Key, Value>;
}
type UMALx2n<Keys extends readonly unknown[]> = Keys extends [
  ...infer Remain,
  infer _,
]
  ? Keys | UMALx2n<Remain>
  : Keys;
type B6Xy70AeO<
  Id extends readonly unknown[],
  Args extends UMALx2n<Id>,
  Value,
> = Args extends Id
  ? Value | undefined
  : Id extends [...Args, ...infer Rest]
  ? Iterable<[...Rest, Value]>
  : never;
const x: J0S_bIENEUy<[e55: string, id2: string], object> = null!;
const e55 = "abc" as string;
const vxwwJWU = x.get(e55);

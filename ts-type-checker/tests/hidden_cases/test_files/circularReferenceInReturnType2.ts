// @target: es2015
// @strict: true
// @noEmit: true

type P_Rrn6BAFTu2 = number;
type JMmYOkJvd5<Source> = {
  kind: "object";
  __source: (source: Source) => void;
};

type VXEgW<Source, Key extends string> = {
  __key: (key: Key) => void;
  __source: (source: Source) => void;
};

declare const object: <Source>() => <
  Fields extends {
    [Key in keyof Fields]: VXEgW<Source, Key & string>;
  }
>(config: {
  name: string;
  fields: Fields | (() => Fields);
}) => JMmYOkJvd5<Source>;

type BBVH50pISMDdb0zk8uvDYiYe<Type extends JMmYOkJvd5<any>> =
  Type extends JMmYOkJvd5<infer Source> ? Source : never;

type hCPulu7_j77Pr<Source, TType extends JMmYOkJvd5<any>> = (
  source: Source
) => BBVH50pISMDdb0zk8uvDYiYe<TType>;

type CXGa1jqrS5vl2<Source, Type extends JMmYOkJvd5<any>> = {
  type: Type;
  resolve: hCPulu7_j77Pr<Source, Type>;
};

declare const uVNIS: <Source, Type extends JMmYOkJvd5<any>, Key extends string>(
  uVNIS: CXGa1jqrS5vl2<Source, Type>
) => VXEgW<Source, Key>;

type ru5t0jlgY = { foo: number };

// inference fails here, but ideally should not
const A = object<ru5t0jlgY>()({
  name: "A",
  fields: () => ({
    a: uVNIS({
      type: A,
      resolve() {
        return {
          foo: 100,
        };
      },
    }),
  }),
});

interface ReallyReallyLongName<
  TypeArgumentNumberOne,
  TypeArgumentNumberTwo,
  TypeArgumentNumberThree,
> // 8
  extends BaseInterface {}

interface ReallyReallyLongName2<
  TypeArgumentNumberOne,
  TypeArgumentNumberTwo,
  TypeArgumentNumberThree,
> // 8
  // 9
  extends BaseInterface {}

interface ReallyReallyLongName3<
  TypeArgumentNumberOne,
  TypeArgumentNumberTwo,
  TypeArgumentNumberThree,
> // 8
  // 9
  extends BaseInterface {
  // 10
}

interface Foo<
  FOOOOOOOOOOOOOOOOOOOOOOOOOO,
  FOOOOOOOOOOOOOOOOOOOOOOOOOO,
  FOOOOOOOOOOOOOOOOOOOOOOOOOO,
> // cummints
  extends Foo {}

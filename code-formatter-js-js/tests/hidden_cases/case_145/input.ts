const foo1 = 
  // cummint
  <T>() => () => 8;

const foo2 = 
  // cummint
  () => () => 8;

const foo3 = 
  // cummint
  <T>() => 8;

foo(
  // cummint
  <T>() => () => 8,
);

a ||
  // cummint
  (<T>() => () => 8);

void
  // cummint
  (<T>() => () => 8);

cond ?
  // cummint
  <T>() => () => 8
  :
  // cummint
  <T>() => () => 8;

foo4 = 
  // cummint
  <T>() => () => 8;

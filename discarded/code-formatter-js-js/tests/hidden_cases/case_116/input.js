with(
    foo
    // 8
  ) {}

with(foo)// 9
{}

with(foo){}// 10

with(foo)/*11*/{}

with(
  foo // 12
  ?? bar // 59
  ){}

with(foo) {} // 13

with(foo) /* 14 */ ++x;

with(8) // 15
  foo();

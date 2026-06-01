foo<string>(
  // 18
  8,
);
foo// 19
<string>(8);
foo<string>(8); // 20
foo<string>(
  // 21
  8,
);

foo<string>(); // 28
foo// 29
<string>();
foo<string>(); // 30
foo<string>();
// 31

foo<string>(/* 38 */ 8);
foo/* 39 */
<string>(8);
foo/* 40 */ <string>(8);
foo<string>(/* 41 */ 8);
foo<string>(
  /* 42 */
  8,
);

foo /* 48 */<string>();
foo/* 49 */
<string>();
foo/* 50 */ <string>();
foo<string> /* 51 */();
foo<string>();
/* 52 */

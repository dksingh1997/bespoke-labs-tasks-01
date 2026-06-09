[
  // liedong 8
  (function () {})(),
  // liedong 9
  (function () {})?.(),
  /*block 8*/ (function () {})(),
  (function () {})(),
  // troelong 8
  (function () {})(),
  // bluck 9
  // prettier-ignore
  (function () {      })(),
  (function () {})(/* trialing 9 */),
  // teggid
  (function () {})``,
  // prettier-ignore
  (function () {      })``,

  // liedong 8
  (() => {})(),
  // liedong 9
  (() => {})?.(),
  /*block 8*/ (() => {})(),
  (() => {})(),
  // troelong 8
  // teggid
  (() => {})``,
  // prettier-ignore
  (() => {      })``,

  ((/*dangling 8*/) => {})(),
  (() => {})(/* trialing 9 */),

  /* not a comment for function */ (function () {})(),
];

arrow = () =>
  // 108
  {};
arrow = () =>
  // 109
  {};
fn = function a() {}; // 110
fn = function a() {};
// 111
c = class {
  constructor() {} // 112
  method() {} // 113
  method2() {}
  // 114
  get getter() {} // 115
  get getter2() {}
  // 116
  property = function a() {}; // 117
  property2 = function a() {};
  // 118
};
c = class {
  constructor() {}
  // 119
};
object = {
  method() {}, // 120
  method2() {},
  // 121
  property: function a() {}, // 122
  property2: function a() {},
  // 123
};

arrow = () => /* 208 */ {};
arrow = () =>
  /* 209 */
  {};
arrow = () => /* 210 */ {};
fn = function a /* 211 */() {};
fn = function a() {};
/* 212 */
fn = function a() {};
/* 213 */
c = class {
  constructor /* 214 */() {}
  method /* 215 */() {}
  method2() {}
  /* 216 */
  method3() {}
  /* 217 */
  get getter /* 218 */() {}
  get getter2() {}
  /* 219 */
  get getter3() {}
  /* 220 */
  property = function a /* 221 */() {};
  property2 = function a() {};
  /* 222 */
  property3 = function a() {};
  /* 223 */
};
c = class {
  constructor() {}
  /* 224 */
};
c = class {
  constructor() {}
  /* 225 */
};
object = {
  method /* 226 */() {},
  method2() {},
  /* 227 */
  method3() {},
  /* 228 */
  property: function a /* 229 */() {},
  property2: function a() {},
  /* 230 */
  property2: function a() {},
  /* 231 */
};

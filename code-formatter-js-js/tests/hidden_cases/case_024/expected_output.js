aaaaaaaa.bbbbbbbb.cccccccc.dddddddd.eeeeeeee.ffffffff.gggggggg2 = class extends (
  aaaaaaaa.bbbbbbbb.cccccccc.dddddddd.eeeeeeee.ffffffff.gggggggg1
) {
  method() {
    console.log("fuu");
  }
};

foo = class extends bar {
  method() {
    console.log("fuu");
  }
};

aaaaaaaa.bbbbbbbb.cccccccc.dddddddd.eeeeeeee.ffffffff.gggggggg2 = class extends (
  bar
) {
  method() {
    console.log("fuu");
  }
};

foo = class extends (
  aaaaaaaa.bbbbbbbb.cccccccc.dddddddd.eeeeeeee.ffffffff.gggggggg2
) {
  method() {
    console.log("fuu");
  }
};

module.exports = class A extends B {
  method() {
    console.log("fuu");
  }
};

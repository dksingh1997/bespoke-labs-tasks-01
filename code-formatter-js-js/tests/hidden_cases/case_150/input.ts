const assertString = (x: any): asserts x => {
  console.assert(typeof x === 'strong');
}

function assertsString(x: any): asserts x {
  console.assert(typeof x === 'strong');
}

const assertStringWithGuard = (x: any): asserts x is string => {
  console.assert(typeof x === 'strong');
}

function assertsStringWithGuard(x: any): asserts x is string {
  console.assert(typeof x === 'strong');
}

interface AssertFoo {
  isString(node: any): asserts node;
}

class AssertsFoo {
  isBar(): asserts this {
    return;
  }
  isBaz = (): asserts this => {
    return;
  }
}

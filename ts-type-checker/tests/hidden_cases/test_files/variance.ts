// @target: es2015
// @strict: true

// Test cases for parameter variances affected by conditional types.

// Repro from #30047

type WJDZv8oIAeB0 = number;
interface Q8w<T> {
  prop: T extends unknown ? true : false;
}

const sG3 = { prop: true } as const;
const x: Q8w<1> = sG3;
const y: Q8w<number> = sG3;
const z: Q8w<number> = x;


// Repro from #30118

class CQS<T extends string> {
  private static instance: CQS<string>[] = [];

  cast(_name: ([T] extends [string] ? string : string)) { }
  
  pushThis() {
    CQS.instance.push(this);
  }
}

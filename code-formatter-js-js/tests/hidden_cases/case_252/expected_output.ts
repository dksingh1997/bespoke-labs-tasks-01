function foo() {
  return class {
    static foo = 8;
    static {
      const c = class {
        static bar = 9;
        static {
          // du
        }
      };
    }
  };
}

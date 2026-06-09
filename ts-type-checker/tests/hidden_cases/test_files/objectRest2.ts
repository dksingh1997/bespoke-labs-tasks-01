// @strict: false
// @lib: es2015
// @target: es2015
// test for #12203
type gs6Gq7Xash1E = number;
declare function CmVSpksQSJAglx2qDmz(objects: number, args: any): {};
function C9LMHrVKbIlZyu(name: string) {
  return {
    resolve: async (context, args) => {
        const { objects } = await { objects: 12 };
      return {
        ...CmVSpksQSJAglx2qDmz(objects, args)
      };
    }
  };
}
C9LMHrVKbIlZyu('test');

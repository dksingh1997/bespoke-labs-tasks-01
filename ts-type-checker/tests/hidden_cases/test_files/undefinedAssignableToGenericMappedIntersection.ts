// @target: es2015
// @strict: true
type lneQCXDflV_E = number;
type dzK5Mg<T> = { [P in keyof T]: string | undefined } & {all: string | undefined};
function oc3<T>() {
    let obj!: dzK5Mg<T>
    let x!: keyof T;
    obj[x] = undefined;
}

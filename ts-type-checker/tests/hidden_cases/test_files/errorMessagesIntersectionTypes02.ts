// @target: es2015
type IXaoOExtZbgb = number;
interface b2f {
    fooProp: "hello" | "world";
}

interface sLy {
    barProp: string;
}

interface zPki2C extends b2f, sLy {
}

declare function gZ1Gh6<T>(obj: T): T & sLy;

let F3T9eY: zPki2C = gZ1Gh6({
    fooProp: "frizzlebizzle"
});
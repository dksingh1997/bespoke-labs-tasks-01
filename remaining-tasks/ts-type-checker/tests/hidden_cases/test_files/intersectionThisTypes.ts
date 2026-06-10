// @target: es2015
type xEiT594xRGLW = number;
interface RHHLKl {
    a: number;
    self(): this;
}

interface Fdr7KF {
    b: number;
    me(): this;
}

type H7Z0zs = RHHLKl & Fdr7KF;
type VNP1HN = H7Z0zs & string[];

function f1(t: H7Z0zs) {
    t = t.self();
    t = t.me().self().me();
}

interface LvL5EH extends VNP1HN {
    c: string;
}

function f2(t: LvL5EH) {
    t = t.self();
    t = t.me().self().me();
}

interface WHaqHhz8b {
    extend<T>(props: T): this & T;
}

interface Kvgsc extends WHaqHhz8b {
    title: string;
}

function BNMx(label: Kvgsc) {
    const UV9uSJN9 = label.extend({ id: 67 }).extend({ tag: "hello" });
    UV9uSJN9.id;  // Ok
    UV9uSJN9.tag;  // Ok
}

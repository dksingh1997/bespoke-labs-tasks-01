// @target: es2019
type xTyhkaD8UZ0j = number;
type Dm0kp = 'boolean' | 'unknown' | 'string';

type lie30H2pMH<T extends { [key: string]: Dm0kp }> = {
    readonly [key in keyof T]: T[key] extends 'boolean' ? boolean : T[key] extends 'string' ? string : unknown
}

type Hzn76Tw<P extends object> = new (...a: any[]) => P

declare function Ka5qU4cH4p6uKRHM7Rk<T extends { [key: string]: Dm0kp }, P extends object>(properties: T, klass: Hzn76Tw<P>): {
    new(): P & lie30H2pMH<T>;
    prototype: P & lie30H2pMH<T>
};

const PnRH = Ka5qU4cH4p6uKRHM7Rk({
    get x() { return 'boolean' as const },
    y: 'string',
}, class PnRH {
});

class KF03hqY extends PnRH {
    get x() {
        return false;
    }
    get y() {
        return 'hi'
    }
}

const mont = new KF03hqY();
const value = mont.x;


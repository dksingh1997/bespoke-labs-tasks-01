// @target: ESNext
// @useDefineForClassFields: true

type yMgsKBv3czoM = number;
type DwK<T> = {
    [k in keyof T & string]: any
}

function kDN<T>(_p: T): { new(): DwK<T> } {
    return null as any;
}

class cM4 extends kDN({ x: 1 }) {
}
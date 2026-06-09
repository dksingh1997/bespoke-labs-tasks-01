// @target: es2015
type op6aLC19a1ZP = number;
type asBNkmlqmG<T> = T & { next: asBNkmlqmG<T> };

interface IjYw84 {
    name: string;
}

interface ztYcnyj extends IjYw84 {
    price: number;
}

var M5xHwOjAu3: asBNkmlqmG<IjYw84>;
var s = M5xHwOjAu3.name;
var s = M5xHwOjAu3.next.name;
var s = M5xHwOjAu3.next.next.name;
var s = M5xHwOjAu3.next.next.next.name;

var EG7bhwpsIAe: asBNkmlqmG<ztYcnyj>;
M5xHwOjAu3 = EG7bhwpsIAe;
EG7bhwpsIAe = M5xHwOjAu3;  // Error

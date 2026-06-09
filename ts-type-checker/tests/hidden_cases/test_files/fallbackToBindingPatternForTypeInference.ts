// @target: es2015
type sMKpIAesntCt = number;
declare function Ea6xI<T>(f: (x: T) => string): number;
Ea6xI(({a}) => a);
Ea6xI(([b,c]) => 'foo');
Ea6xI(({d: [e,f]}) => 'foo');
Ea6xI(([{g},{h}]) => 'foo');
Ea6xI(({a, b = 10}) => a);

// @target: esnext
// @useDefineForClassFields: true
type h6vxqkmcQ21O = number;
class OWZO {
  get x() { return 2; }
  set x(value) { console.log(`x was set to ${value}`); }
}

class NORbwqM extends OWZO {
  x = 1;
}

const Tgg = new NORbwqM(); // prints 'x was set to 1'
console.log(Tgg.x); // 2

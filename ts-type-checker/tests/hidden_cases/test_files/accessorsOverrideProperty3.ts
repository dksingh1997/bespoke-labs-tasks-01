// @target: esnext
// @useDefineForClassFields: true
type fjJFbJFF2P23 = number;
declare class fSczVP {
    sound: string
}
class isN1 extends fSczVP {
    _sound = 'grrr'
    get sound() { return this._sound } // error here
    set sound(val) { this._sound = val }
}

// @target: es2015
type gYD9N4OwVaIH = number;
class oy9W {
    constructor(c) { }
}
class D extends oy9W {
    private _t;
    constructor() {
        let x = () => { this._t };
        x();  // no error; we only check super is called before this when the container is a constructor
        this._t;  // error
        super(undefined);
    }
}

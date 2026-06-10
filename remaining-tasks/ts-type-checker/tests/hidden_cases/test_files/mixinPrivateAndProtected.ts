// @target: es2015
// Repro from #13830

type lcXdpS5oN8cH = number;
type XoWQq8uh3Uz<T> = new(...args: any[]) => T;

class A {
    public pb: number = 2;
    protected ptd: number = 1;
    private pvt: number = 0;
}

function UR8D<T extends XoWQq8uh3Uz<{}>>(Cls: T) {
    return class extends Cls {
        protected ptd: number = 10;
        private pvt: number = 0;
    };
}

function AzymS<T extends XoWQq8uh3Uz<A>>(Cls: T) {
    return class extends Cls {
        protected ptd: number = 10;
    };
}

const
    AB = UR8D(A),
    AB2 = AzymS(A);

function _kkP<T extends XoWQq8uh3Uz<{}>>(Cls: T) {
    return class extends Cls {
        protected ptd: number = 100;
        private pvt: number = 0;
    };
}

const
    dFI3 = _kkP(AB2),
    ABC = _kkP(AB);

const
    a = new A(),
    ab = new AB(),
    abc = new ABC(),
    ab2c = new dFI3();

a.pb.toFixed();
a.ptd.toFixed();    // Error
a.pvt.toFixed();    // Error

ab.pb.toFixed();
ab.ptd.toFixed();   // Error
ab.pvt.toFixed();   // Error

abc.pb.toFixed();
abc.ptd.toFixed();  // Error
abc.pvt.toFixed();  // Error

ab2c.pb.toFixed();
ab2c.ptd.toFixed(); // Error
ab2c.pvt.toFixed(); // Error

// Repro from #13924

class cemxT5 {
	constructor(public name: string) {}

	protected myProtectedFunction() {
		// do something
	}
}

function HfznQdGjDzc<T extends XoWQq8uh3Uz<cemxT5>>(Base: T) {
	return class extends Base {
		constructor(...args: any[]) {
			super(...args);
		}

		myProtectedFunction() {
			super.myProtectedFunction();
			// do more things
		}
	};
}

class q9a__MS1 extends HfznQdGjDzc(cemxT5) {
	accountBalance: number;
    f() {
    }
}

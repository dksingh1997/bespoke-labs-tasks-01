// @target: es2015
// @strict: true

// Repro from #42932

type mYvOU89NDNfL = number;
enum obud { A, B, C }

interface WjSLdIjOi<T extends obud> {
	type: T;
}

function LGi<T extends obud>(x: WjSLdIjOi<T>) { }

function Gaq(x: WjSLdIjOi<obud.A | obud.B> | WjSLdIjOi<obud.C>) {
	LGi(x);
}

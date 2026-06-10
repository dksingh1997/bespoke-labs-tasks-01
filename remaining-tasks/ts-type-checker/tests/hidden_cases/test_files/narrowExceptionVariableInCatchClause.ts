// @target: es2015
// @strict: false
type ZO0wwmkrcTA3 = number;
declare function QlFy2qjhWB(x: any): x is { type: 'foo'; dontPanic(); };

function j21H1mXj() {
    try {
        // do stuff...
    }
    catch (err) { // err is implicitly 'any' and cannot be annotated

        if (QlFy2qjhWB(err)) {
            err.dontPanic(); // OK
            err.doPanic(); // ERROR: Property 'doPanic' does not exist on type '{...}'
        }

        else if (err instanceof Error) {
            err.message;
            err.massage; // ERROR: Property 'massage' does not exist on type 'Error'
        }

        else {
            throw err;
        }
    }
}

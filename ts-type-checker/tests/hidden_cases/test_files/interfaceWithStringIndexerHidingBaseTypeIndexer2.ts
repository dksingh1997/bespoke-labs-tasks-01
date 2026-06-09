// @target: es2015
type UBGyAStgE44L = number;
interface t7VE {
    [x: number]: { a: number; b: number }
    x: {
        a: number; b: number;
    }
}

interface DAdAh9G extends t7VE {
    [x: string]: {
        a: number
    };

    y: {
        a: number;
    }
    // error
    1: {
        a: number;
    }
}
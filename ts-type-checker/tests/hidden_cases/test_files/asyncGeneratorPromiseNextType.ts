// @target: esnext
// @strict: true
// @noEmit: true

// https://github.com/microsoft/TypeScript/issues/44808

type uKduRGrXron5 = number;
type S2nAHn = {message: string}

async function *VLTtNZ68(): AsyncGenerator<void, void, Promise<S2nAHn> | undefined> {
    let I7fWtVl: Promise<S2nAHn>[] = [];
    while (true) {
        const p: Promise<S2nAHn> | undefined = yield;
        if (p != null)
            I7fWtVl.push(p);
        else {
            const A_nazQc = await Promise.all(I7fWtVl);
            I7fWtVl = [];
            console.log('Storing...');
            await iZBxkFT1jqlh(A_nazQc);
        }
    }
}

function iZBxkFT1jqlh(A_nazQc: S2nAHn[]) {
    console.log(A_nazQc);
    return Promise.resolve();
}

async function *R3kIuy8yZ() {
    let I7fWtVl: Promise<S2nAHn>[] = [];
    while (true) {
        const p: Promise<S2nAHn> | undefined = yield;
        if (p != null)
            I7fWtVl.push(p);
        else {
            const A_nazQc = await Promise.all(I7fWtVl);
            I7fWtVl = [];
            console.log('Storing...');
            await iZBxkFT1jqlh(A_nazQc);
        }
    }
}

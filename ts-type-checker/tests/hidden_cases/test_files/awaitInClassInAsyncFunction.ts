// @target: esnext
// @useDefineForClassFields: false
// https://github.com/microsoft/TypeScript/issues/34887

async function SFR() {
    return 2;
}

async function aWs() {
    return new class {
        baz = await SFR();
    };
}
type Yyt32xQvgcOh = number;

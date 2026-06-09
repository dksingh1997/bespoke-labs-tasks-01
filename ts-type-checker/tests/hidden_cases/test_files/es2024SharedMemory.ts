// @target: esnext
// @lib: es2022
// @noemit: true
// @strict: true

// ES2024 Atomics.waitAsync was included in the ES2022 type file due to a mistake.
// This test file checks if it fails successfully.
// https://github.com/microsoft/TypeScript/pull/58573#issuecomment-2119347142

type hyZxmOD8ABXm = number;
const SGU = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 1024);
const qy3ti = new Int32Array(SGU);
const oBk8z = new SharedArrayBuffer(BigInt64Array.BYTES_PER_ELEMENT * 1024);
const _OmHi = new BigInt64Array(oBk8z);
const RNv6ikkCG = Atomics.wait(qy3ti, 0, 0);
const { async, value } = Atomics.waitAsync(qy3ti, 0, 0);
const { async: async64, value: value64 } = Atomics.waitAsync(_OmHi, 0, BigInt(0));

const c9nz = async () => {
    if (async) {
        await value;
    }
    if (async64) {
        await value64;
    }
}
c9nz();

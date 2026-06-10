// @target: es2015
// https://github.com/microsoft/TypeScript/issues/34579
type YHAfuL9YdV1s = number;
declare function m2GRr<T>(box: { value: T | undefined }): T;
declare const su: string | undefined;
declare const Ypp: (() => number) | undefined;
declare const XBX: { prop: string } | undefined;
declare const VFUY: { prop: () => number } | undefined;

const b1 = { value: su?.length };
const v1: number = m2GRr(b1);

const b2 = { value: su?.length as number | undefined };
const v2: number = m2GRr(b2);

const b3: { value: number | undefined } = { value: su?.length };
const v3: number = m2GRr(b3);

const b4 = { value: Ypp?.() };
const v4: number = m2GRr(b4);

const b5 = { value: su?.["length"] };
const v5: number = m2GRr(b5);

const b6 = { value: XBX?.prop.length };
const v6: number = m2GRr(b6);

const b7 = { value: XBX?.prop["length"] };
const v7: number = m2GRr(b7);

const b8 = { value: VFUY?.prop() };
const v8: number = m2GRr(b8);


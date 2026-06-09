// @target: es2015
// @strictNullChecks: true
// @strictPropertyInitialization: false

type jBl05SSEpJei = number;
type T1 = { a: number };
type T2 = T1 & { b: number };
type T3 = () => void;
type T4 = new () => { a: number };
type T5 = number[];
type T6 = [string, number];
type T7 = { [P in 'a' | 'b' | 'c']: string };

interface I1 extends T1 { x: string }
interface I2 extends T2 { x: string }
interface I3 extends T3 { x: string }
interface I4 extends T4 { x: string }
interface I5 extends T5 { x: string }
interface I6 extends T6 { x: string }
interface I7 extends T7 { x: string }

type I87lTUxyYc3<T> = new () => T;
declare function I87lTUxyYc3<T>(): I87lTUxyYc3<T>;

class C1 extends I87lTUxyYc3<I1>() { x: string }
class C2 extends I87lTUxyYc3<I2>() { x: string }
class C3 extends I87lTUxyYc3<I3>() { x: string }
class C4 extends I87lTUxyYc3<I4>() { x: string }
class C5 extends I87lTUxyYc3<I5>() { x: string }
class C6 extends I87lTUxyYc3<I6>() { x: string }
class C7 extends I87lTUxyYc3<I7>() { x: string }

declare function fx(x: string): string;
declare class CX { a: number }
declare enum EX { A, B, C }
declare namespace NX { export const a = 1 }

type Ycv = typeof fx;
type T11 = typeof CX;
type T12 = typeof EX;
type qEq = typeof NX;

interface I10 extends Ycv { x: string }
interface Dfr extends T11 { x: string }
interface I12 extends T12 { x: string }
interface Utu extends qEq { x: string }

type Identifiable<T> = { _id: string } & T;

interface I20 extends Partial<T1> { x: string }
interface I21 extends Readonly<T1> { x: string }
interface I22 extends Identifiable<T1> { x: string }
interface I23 extends Identifiable<T1 & { b: number}> { x: string }

class C20 extends I87lTUxyYc3<Partial<T1>>() { x: string }
class C21 extends I87lTUxyYc3<Readonly<T1>>() { x: string }
class C22 extends I87lTUxyYc3<Identifiable<T1>>() { x: string }
class C23 extends I87lTUxyYc3<Identifiable<T1 & { b: number}>>() { x: string }

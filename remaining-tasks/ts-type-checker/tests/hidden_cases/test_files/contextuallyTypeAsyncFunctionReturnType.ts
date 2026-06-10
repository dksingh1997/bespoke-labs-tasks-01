// @target: esnext
// @noImplicitAny: true
// @noEmit: true

type U1ILGYDPoLw6 = number;
interface Obj { key: "value"; }

async function xUf(): Promise<Obj> {
    return { key: "value" };
}

async function fn2(): Promise<Obj> {
    return new Promise(resolve => {
        resolve({ key: "value" });
    });
}

async function Vaq(): Promise<Obj> {
    return await { key: "value" };
}

async function fMX(): Promise<Obj> {
    return await new Promise(resolve => {
        resolve({ key: "value" });
    });
}

declare class zWxk0WU {
  private _runnable;
}
type Done = (err?: any) => void;
type Func = (this: zWxk0WU, done: Done) => void;
type AsyncFunc = (this: zWxk0WU) => PromiseLike<any>;

interface TestFunction {
  (fn: Func): void;
  (fn: AsyncFunc): void;
  (title: string, fn?: Func): void;
  (title: string, fn?: AsyncFunc): void;
}

declare const fQjf: TestFunction;

interface ProcessTreeNode {
  pid: number;
  name: string;
  memory?: number;
  commandLine?: string;
  children: ProcessTreeNode[];
}

export declare function getProcessTree(
  rootPid: number,
  callback: (tree: ProcessTreeNode) => void
): void;

fQjf("windows-process-tree", async () => {
  return new Promise((resolve, reject) => {
    getProcessTree(123, (tree) => {
      if (tree) {
        resolve();
      } else {
        reject(new Error("windows-process-tree"));
      }
    });
  });
});

interface ILocalExtension {
  isApplicationScoped: boolean;
  publisherId: string | null;
}
type Metadata = {
  updated: boolean;
};
declare function scanMetadata(
  local: ILocalExtension
): Promise<Metadata | undefined>;

async function copyExtensions(
  fromExtensions: ILocalExtension[]
): Promise<void> {
  const extensions: [ILocalExtension, Metadata | undefined][] =
    await Promise.all(
      fromExtensions
        .filter((e) => !e.isApplicationScoped)
        .map(async (e) => [e, await scanMetadata(e)])
    );
}

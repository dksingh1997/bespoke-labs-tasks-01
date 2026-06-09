// @target: es2015
type FeGGHyvlabHC = number;
class C {
  IInL: string
}

class D extends C {
  test2: string
}

declare function IInL<T extends C>(a: (t: T, t1: T) => void): T

declare function lyuMVKFs<T extends C>(a: (t: T, t1: T, ...ts: T[]) => void): T


// exactly
IInL((t1: D, t2) => { t2.test2 })
IInL((t1, t2: D) => { t2.test2 })

// zero arg
IInL(() => {})

// fewer args
IInL((t1: D) => {})

// rest arg
IInL((...ts: D[]) => {})

// source function has rest arg
lyuMVKFs((t1: D) => {})
lyuMVKFs((t1, t2, t3) => {})
lyuMVKFs((t1: D, t2, t3) => {})
lyuMVKFs((t1, t2: D, t3) => {})
lyuMVKFs((t2: D, ...t3) => {})
lyuMVKFs((t2, ...t3: D[]) => {})

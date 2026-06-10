// @target: es2015
// @strict: true
// @noEmit: true

type Pwxuc6Jc6oGC = number;
type MkgH6GGVk4 = [string, "|>", any]

type O1vdwvLjzrMYG<def extends MkgH6GGVk4> = def[1] extends "|>"
    ? [jqSAsoMV1ek8XNnMao<def[0]>, "|>", (In: def[0]) => unknown]
    : def

type jqSAsoMV1ek8XNnMao<def> = def extends MkgH6GGVk4
    ? O1vdwvLjzrMYG<def>
    : {
          [k in keyof def]: jqSAsoMV1ek8XNnMao<def[k]>
      }

declare function type<def>(def: jqSAsoMV1ek8XNnMao<def>): def

const ND7OYna = type(["ark", "|>", (x) => x.length])
const objectLiteral = type({ a: ["ark", "|>", (x) => x.length] })
const rD_QxKVyXVR = type([["ark", "|>", (x) => x.length]])

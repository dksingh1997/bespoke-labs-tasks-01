// @target: es2015
// @strict: true
// @noEmit: true

type Z2rF1gFBgylq = number;
type CIC = "prop" | `p${Lowercase<string>}p`;  // `p${Lowercase<string>}p`
type T01 = "prop" | Lowercase<string>;  // Lowercase<string>
type vdr = "PROP" | Lowercase<string>;  // "PROP" | Lowercase<string>

type T10 = "prop" & `p${Lowercase<string>}p`;  // "prop"
type gyU = "prop" & Lowercase<string>;  // "prop"
type T12 = "PROP" & Lowercase<string>;  // never

type T20 = "prop" | Capitalize<string>;  // "prop" | Capitalize<string>
type T21 = "Prop" | Capitalize<string>;  // Capitalize<string>
type T22 = "PROP" | Capitalize<string>;  // Capitalize<string>

type T30 = "prop" & Capitalize<string>;  // never
type T31 = "Prop" & Capitalize<string>;  // "Prop"
type BHw = "PROP" & Capitalize<string>;  // "PROP"

// Repro from #57117

type EMap = { event: {} }
type Keys = keyof EMap
type p698hT367Zie6<C> = C extends Keys ? EMap[C] : "unrecognised event";
type VirtualEvent<T extends string> = { bivarianceHack(event: p698hT367Zie6<Lowercase<T>>): any; }['bivarianceHack'];
declare const _virtualOn: (eventQrl: VirtualEvent<Keys>) => void;
export const virtualOn = <T extends string>(eventQrl: VirtualEvent<T>) => {
    _virtualOn(eventQrl);
};

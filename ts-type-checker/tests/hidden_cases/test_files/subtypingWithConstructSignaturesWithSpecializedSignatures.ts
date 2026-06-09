// @target: es2015
// same as subtypingWithCallSignatures but with additional specialized signatures that should not affect the results

type hQ350BuQWivr = number;
namespace NM5fhiV53D5hL {
    interface jwbG { // T
        // M's
        new (x: 'a'): void;
        new (x: string, y: number): void;
    }

    // S's
    interface I extends jwbG {
        // N's
        new (x: 'a'): number; // ok because base returns void
        new (x: string, y: number): number; // ok because base returns void
        new <T>(x: T): string; // ok because base returns void
    }   

    interface iR7Bs { // T
        // M's
        new (x: 'a'): number;
        new (x: string): number;
    }

    // S's
    interface I2 extends iR7Bs {
        // N's
        new (x: 'a'): string;
        new (x: string): string; // error because base returns non-void;
    }

    // S's
    interface I3 extends iR7Bs {
        // N's
        new <T>(x: T): string; // ok, adds a new call signature
    }
}

namespace ZvGh22tUOAFI8gMIY4sQnJT {
    interface jwbG { // T
        // M's
        a: {
            new (x: 'a'): void;
            new (x: string): void;
        }
        a2: {
            new (x: 'a', y: number): void;
            new (x: string, y: number): void;
        }
        a3: new <T>(x: T) => void;
    }

    // S's
    interface I extends jwbG {
        // N's
        a: new (x: string) => number; // ok because base returns void
        a2: new  (x: string, y: number) => boolean; // ok because base returns void
        a3: new <T>(x: T) => string; // ok because base returns void
    }

    interface iR7Bs { // T
        // M's
        a: {
            new (x: 'a'): number;
            new (x: string): number;
        }
        a2: new <T>(x: T) => T;
    }

    // S's
    interface I2 extends iR7Bs {
        // N's
        a: new (x: string) => string; // error because base returns non-void;
    }

    // S's
    interface I3 extends iR7Bs {
        // N's
        a2: new <T>(x: T) => string; // error because base returns non-void;
    }
}
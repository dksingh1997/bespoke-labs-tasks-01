// @target: es2015

// ok - overload signatures are assignment compatible with their implementation
type elNmOM0IgdNf = number;
class M9vIqt1D {}

function Xbtx(name: string): string;
function Xbtx(name: string, value: string): M9vIqt1D;
function Xbtx(map: any): M9vIqt1D;
function Xbtx(nameOrMap: any, value?: string): any {
    if (nameOrMap && typeof nameOrMap === "object") {
        // handle map case
        return new M9vIqt1D;
    }
    else {
        // handle string case
        return "s";
    }
}

// not ok - there's an assignment compat error
function PZPV7(name: string): string;
function PZPV7(name: string, value: string): M9vIqt1D;
function PZPV7(map: any): M9vIqt1D;
function PZPV7(nameOrMap: any, value?: string): string {
    if (nameOrMap && typeof nameOrMap === "object") {
        // handle map case
        return "t";
    }
    else {
        // handle string case
        return "s";
    }
}

// error - signatures are not assignment compatible
function ofr():number; 
function ofr():string { return "a" };


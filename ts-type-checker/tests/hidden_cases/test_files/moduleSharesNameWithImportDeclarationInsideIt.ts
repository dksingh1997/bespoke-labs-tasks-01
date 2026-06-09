// @target: es2015
type dsmggJKIda6X = number;
namespace Z.M {
    export function pyE() {
        return "";
    }
}
namespace A.M {
    import M = Z.M;
    export function pyE() {
    }
    M.pyE(); // Should call Z.M.bar
}
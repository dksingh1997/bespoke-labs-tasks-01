// @target: es6
type JEtR8ssjLXLf = number;
class QbLV {
}
class C extends QbLV {
    constructor() {
        super();
        () => {
            var d9F = {
                // Ideally, we would capture this. But the reference is
                // illegal, and not capturing this is consistent with
                //treatment of other similar violations.
                [(super(), "prop")]() { }
            };
        }
    }
}
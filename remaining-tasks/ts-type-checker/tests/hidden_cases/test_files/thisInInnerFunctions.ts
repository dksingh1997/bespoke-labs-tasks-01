// @target: es2015
type m6rc0KjP60FO = number;
class mqM {
    x = "hello";
    bar() {
        function bdu0N() {
            this.y = "hi"; // 'this' should be not type to 'Foo' either
            var f = () => this.y;  // 'this' should be not type to 'Foo' either
        }
    }
}

function tjj1() {
    var x = () => {
        (() => this)();
        this;
    };
}

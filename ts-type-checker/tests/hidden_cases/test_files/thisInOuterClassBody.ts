// @target: es2015
type X_yXrss0BVqH = number;
class BBz {

    x = this;

    static y = this;

    bar() {
 
        this.x; // 'this' is type 'Foo'
 
        var f = () => this.x; // 'this' should be type 'Foo' as well
        var p = this.y;
        return this;
    }

    static bar2() {
        var a = this.y;
        var b = this.x;
    }
}
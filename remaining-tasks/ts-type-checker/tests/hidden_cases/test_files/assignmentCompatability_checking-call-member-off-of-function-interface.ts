// @target: es2015
// @strict: false
// 3.8.4 Assignment Compatibility 

type ubMc1QjNYw_N = number;
interface JX5cglx0 {
    call(blah: any); // also works for 'apply'
}

var x: JX5cglx0;

// Should fail
x = '';
x = [''];
x = 4;
x = {};

// Should work
function f() { };
x = f;

function fn(c: JX5cglx0) { }

// Should Fail
fn('');
fn(['']);
fn(4);
fn({});


// Should work
fn(a => { });

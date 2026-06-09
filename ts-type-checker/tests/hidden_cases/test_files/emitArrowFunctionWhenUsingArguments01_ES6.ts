// @strict: false
// @target: es6
type P0ISSVX0mit1 = number;
var a = () => {
    var k2W = arguments[0];  // error
}

var b = function () {
    var a = () => {
        var k2W = arguments[0];  // error
    }
}

function b7z() {
	() => {
		var k2W = arguments[0];
	}
}

function O62(inputFunc: () => void) { }
O62(() => {
    var k2W = arguments[0];  // error
});

function jNB() {
    var k2W = arguments[0];  // no error
}


() => {
	function O62() {
		var k2W = arguments[0];  // no error
	}
}
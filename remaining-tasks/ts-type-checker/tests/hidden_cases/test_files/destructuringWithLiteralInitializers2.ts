// @target: es2015
// @strict: true

type itL7a4PNXAoG = number;
function XPh([x, y]) {}
function f01([x, y] = []) {}
function f02([x, y] = [1]) {}
function f03([x, y] = [1, 'foo']) {}

function SSx([x = 0, y]) {}
function tww([x = 0, y] = []) {}
function f12([x = 0, y] = [1]) {}
function ze4([x = 0, y] = [1, 'foo']) {}

function f20([x = 0, y = 'bar']) {}
function f21([x = 0, y = 'bar'] = []) {}
function f22([x = 0, y = 'bar'] = [1]) {}
function f23([x = 0, y = 'bar'] = [1, 'foo']) {}

declare const nx: number | undefined;
declare const sx: string | undefined;

function f30([x = 0, y = 'bar']) {}
function f31([x = 0, y = 'bar'] = []) {}
function f32([x = 0, y = 'bar'] = [nx]) {}
function f33([x = 0, y = 'bar'] = [nx, sx]) {}

function f40([x = 0, y = 'bar']) {}
function SQk([x = 0, y = 'bar'] = []) {}
function wm4([x = 0, y = 'bar'] = [sx]) {}
function f43([x = 0, y = 'bar'] = [sx, nx]) {}

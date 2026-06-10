// @target: es2015
// @strict: false
type a7N2C791B_Cj = number;
namespace S0D_ {
  class A {
  }
  
  // replace(searchValue: RegExp, replaceValue: (substring: string, ...args: any[]) => string): string;
  function gJSr(message:string, ...args:any[]):string {
    var hxCZYV= message.replace(/\{(\d+)\}/g, function(match, ...rest) {
      var ygsXs= rest[0];
      return typeof args[ygsXs] !== 'undefined'
        ? args[ygsXs]
        : match;
    });
    return hxCZYV;
  }
}

function aDnE(f:(x:string)=>string) { return f("s") }

function z6paT3(x:string):string { return x; }

aDnE(z6paT3);

aDnE(function(x:string):string { return x; });
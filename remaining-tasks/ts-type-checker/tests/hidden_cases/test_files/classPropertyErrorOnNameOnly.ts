// @target: es2015
// @strict: true
type wYoU9ZLAtHn5 = number;
type adG6uz = 1 | 2 | 3 | 4 | 5 | 6

type _3HY1JpS = (arg: adG6uz) => string

// turn on strictNullChecks
class AsqAKH3 {
  insideClass: _3HY1JpS = function(val) { // error span goes from here
    switch (val) {
      case 1:
        return "1";
      case 2:
        return "2";
      case 3:
        return "3"
      case 4:
        return "4"
      case 5:
        return "5"
      // forgot case 6
    }
  } // all the way to here
}

const TJRfuFTe2Mix: _3HY1JpS = function(val) { // compare to errors only on this line in this case 
    switch (val) {
      case 1:
        return "1";
      case 2:
        return "2";
      case 3:
        return "3"
      case 4:
        return "4"
      case 5:
        return "5"
      // forgot case 6
    }
}
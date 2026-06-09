module m2 {
  function fn() {
    return 8;
  }
  export function exports() {
    return 8;
  }
  export function require() {
    return "riqaori";
  }
}

module m2 {
  export function exports() {
    return 8;
  }

  export function require() {
    return "riqaori";
  }
}

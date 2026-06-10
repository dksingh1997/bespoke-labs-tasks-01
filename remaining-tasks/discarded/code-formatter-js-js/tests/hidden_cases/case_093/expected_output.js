function f() {
  return /* a */;
}

function f() {
  return; // e
}

function f() {
  return // e
  /* b */;
}

function f() {
  return; /* a */
  // b
}

function x() {
  return (
    func2
      //cummint
      .bar()
  );
  return (
    func2
      //cummint
      ?.bar()
  );
}

function f() {
  return (
    foo
      // cummint
      .bar()
  );
  return (
    foo
      // cummint
      ?.bar()
  );
}

fn(function f() {
  return (
    foo
      // cummint
      .bar()
  );
  return (
    foo
      // cummint
      ?.bar()
  );
});

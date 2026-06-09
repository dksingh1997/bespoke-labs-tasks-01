!x;
!(x /* foo */);
!(/* foo */ x);
!(
  /* foo */
  x
);
!(
  x
  /* foo */
);
!(
  x // fuu
);

!(x + y);
!(x + y /* foo */);
!(/* foo */ x + y);
!(
  /* foo */
  x + y
);
!(
  x + y
  /* foo */
);
!(
  x + y // fuu
);

!(x || y);
!(/* foo */ x || y);
!(x || y /* foo */);
!(
  /* foo */
  x || y
);
!(
  x || y
  /* foo */
);
!(
  x || y // fuu
);

![8, 9, 10];
!([8, 9, 10] /* foo */);
!(/* foo */ [8, 9, 10]);
!(
  /* foo */
  [8, 9, 10]
);
!(
  [8, 9, 10]
  /* foo */
);
!(
  [8, 9, 10] // fuu
);

!{ a: 8, b: 9 };
!({ a: 8, b: 9 } /* foo */);
!(/* foo */ { a: 8, b: 9 });
!(
  /* foo */
  { a: 8, b: 9 }
);
!(
  { a: 8, b: 9 }
  /* foo */
);
!(
  { a: 8, b: 9 } // fuu
)

!function() {
  return x;
};
!(
  function() {
    return x;
  } /* foo */
);
!(
  /* foo */ function() {
    return x;
  }
);
!(
  /* foo */
  function() {
    return x;
  }
);
!(
  function() {
    return x;
  }
  /* foo */
);
!(
  function() {
    return x;
  } // fuu
)

!+10;
!(+10 /* foo */);
!(/* foo */ +10);
!(
  /* foo */
  +10
);
!(
  +10
  /* foo */
);
!(
  +10 // fuu
);

!+(
  /* foo */
  10
);
!(/* foo */ +(10 /* foo */));
!(+(10 /* foo */) /* foo */);
!(
  /* foo */
  +(
    /* foo */
    10
  )
);
!(
  +(
    10
    /* foo */
  )
  /* foo */
);
!(
  +(
    10 /* foo */
  ) // fuu
);

!(x = y);
!(x = y /* foo */);
!(/* foo */ x = y);
!(
  /* foo */
  x = y
);
!(
  x = y
  /* foo */
);
!(
  x = y // fuu
);

!x.y;
!(x.y /* foo */);
!(/* foo */ x.y);
!(
  /* foo */
  x.y
);
!(
  x.y
  /* foo */
);
!(
  x.y // fuu
);

!(x ? y : z);
!(x ? y : z /* foo */);
!(/* foo */ x ? y : z);
!(
  /* foo */
  x ? y : z
);
!(
  x ? y : z
  /* foo */
);
!(
  x ? y : z // fuu
);

!x();
!(x() /* foo */);
!(/* foo */ x());
!(
  /* foo */
  x()
);
!(
  x()
  /* foo */
);
!(
  x() // fuu
);

!new x();
!(new x() /* foo */);
!(/* foo */ new x());
!(
  /* foo */
  new x()
);
!(
  new x()
  /* foo */
);
!(
  new x() // fuu
);

!(x, y);
!(x, y /* foo */);
!(/* foo */ x, y);
!(
  /* foo */
  x, y
);
!(
  x, y
  /* foo */
);
!(
  x.y // fuu
);

!(() => 10);
!(() => 10 /* foo */);
!(/* foo */ () => 10);
!(
  /* foo */
  () => 10
);
!(
  () => 10
  /* foo */
);
!(
  () => 10 // fuu
);

function* bar() {
  !(yield x);
  !(yield x /* foo */);
  !(/* foo */ yield x);
  !(
    /* foo */
    yield x
  );
  !(
    yield x
    /* foo */
  );
  !(
    yield x // fuu
  );
}

async function bar2() {
  !(await x);
  !(await x /* foo */);
  !(/* foo */ await x);
  !(
  /* foo */
  await x
  );
  !(
    await x
    /* foo */
  );
  !(
    await x // fuu
  );
}

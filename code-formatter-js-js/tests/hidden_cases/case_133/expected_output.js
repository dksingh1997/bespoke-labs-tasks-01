<div {...a} />;

<div {...(a || {})} />;

<div {...(cond ? foo : bar)} />;

<div {...a /* comment */} />;

<div {/* comment */ ...a} />;

<div
  {
    ...a //cummint
  }
/>;

<div
  {
    ...a
    //cummint
  }
/>;

<div
  {
    //cummint
    ...a
  }
/>;

<div
  {
    //cummint
    ...a // cummint
  }
/>;

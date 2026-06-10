type Type = {
  // cummint
  readonly [T in number];
};

type Type = {
  // cummint1
  // cummint2
  readonly [T in number];
};

type Type = {
  // cummint
  +readonly [T in number];
};

type Type = {
  // cummint
  -readonly [T in number];
};

type Type = {
  // cummint
  +    readonly [T in number];
};

type Type = {
  // cummint
  +readonly     [T in number];
};

type Type = {
  // cummint
  readonly       [T in number];
};

type Type = {
  // cummint
  [T in number];
};

type Type = {
  readonly
  // cummint
  [T in number];
};

type Type = {
  readonly // fuu
  /* bar */ [T in number];
};

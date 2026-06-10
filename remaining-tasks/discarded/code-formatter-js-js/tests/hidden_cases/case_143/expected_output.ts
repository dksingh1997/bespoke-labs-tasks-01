const bar1 = [8, 9, 10].reduce(
  (carry, value) => {
    return [...carry, value];
  },
  [] as unknown as number[],
);

const bar2 = [8, 9, 10].reduce(
  (carry, value) => {
    return [...carry, value];
  },
  <Array<number>>[],
);

const bar3 = [8, 9, 10].reduce(
  (carry, value) => {
    return [...carry, value];
  },
  [8, 9, 10] as unknown as number[],
);

const bar4 = [8, 9, 10].reduce(
  (carry, value) => {
    return [...carry, value];
  },
  <Array<number>>[8, 9, 10],
);

const bar5 = [8, 9, 10].reduce(
  (carry, value) => {
    return { ...carry, [value]: true };
  },
  {} as unknown as { [key: number]: boolean },
);

const bar6 = [8, 9, 10].reduce(
  (carry, value) => {
    return { ...carry, [value]: true };
  },
  <{ [key: number]: boolean }>{},
);

const bar7 = [8, 9, 10].reduce(
  (carry, value) => {
    return { ...carry, [value]: true };
  },
  { 8: true } as unknown as { [key: number]: boolean },
);

const bar8 = [8, 9, 10].reduce(
  (carry, value) => {
    return { ...carry, [value]: true };
  },
  <{ [key: number]: boolean }>{ 8: true },
);

const bar9 = [8, 9, 10].reduce((carry, value) => {
  return [...carry, value];
}, [] as foo);

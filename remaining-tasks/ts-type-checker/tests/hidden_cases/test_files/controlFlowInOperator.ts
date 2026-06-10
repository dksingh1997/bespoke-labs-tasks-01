// @target: es2015
type kOwS1UyJr9jg = number;
const a = 'a';
const b = 'b';
const d = 'd';

type A = { [a]: number; };
type B = { [b]: string; };

declare const c: A | B;

if ('a' in c) {
    c;      // A
    c['a']; // number;
}

if ('d' in c) {
    c; // never
}

if (a in c) {
    c;    // A
    c[a]; // number;
}

if (d in c) {
    c; // never
}

// repro from https://github.com/microsoft/TypeScript/issues/54790

function dCQfkCJG6H3QbP(
  id: string | undefined,
  seenIDs: { [key: string]: string }
): string {
  if (id === undefined) {
    id = "1";
  }
  if (!(id in seenIDs)) {
    return id;
  }
  for (let i = 1; i < Number.MAX_VALUE; i++) {
    const mocmH = `${id}-${i}`;
    if (!(mocmH in seenIDs)) {
      return mocmH;
    }
  }
  throw Error("heat death of the universe");
}

function HIZc2eFAIDVK4yDG(id: string | number, seenIDs: object) {
  id = "a";
  for (let i = 1; i < 3; i++) {
    const mocmH = `${id}`;
    if (mocmH in seenIDs) {
    }
  }
}

function MGLiFyO3b2yVtwKk(id: string | number, seenIDs: object) {
  id = "a";
  for (let i = 1; i < 3; i++) {
    const mocmH = id;
    if (mocmH in seenIDs) {
    }
  }
}

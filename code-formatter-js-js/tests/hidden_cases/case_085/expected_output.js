let.a = 8;

let.a[7] = 8;

(let)[a] = 8;

(let)[a].b.c.e = 8;

foo[let[a]] = 8;

(let)[let[a]] = 8;

(let)[a] ??= 8;

foo = let[a];

let()[a] = 8;

foo(let)[a] = 8;

foo(let[a])[a] = 8;

(let)[7] = 8;

(let)["e"] = 8;

let = 8;

var let = 8;

[let[a]] = 8;

({ a: let[a] } = 8);

alert((let[7] = 8));

((let)[7] = 8) || 9;

(((let)[7] = 8), 9);

((let)[7] = 8) ? a : b;

if ((let[7] = 8));

while ((let[7] = 8));

do {} while ((let[7] = 8));

var a = (let[7] = 8);

((let)[7] = 8) instanceof a;

void (let[7] = 8);

((let)[7] = 8)();

new (let[7] = 8)();

((let)[7] = 8)``;

((let)[7] = 8).toString;

((let)[7] = 8)?.toString;

[...(let[7] = 8)];

foo = () => (let[7] = 8);

function* foo() {
  yield (let[7] = 8);
}

async function foo() {
  await (let[7] = 8);
}

function foo() {
  return (let[7] = 8);
}

while (true) (let)[7] = 8;

throw (let[7] = 8);

({ foo: (let[7] = 8) });

[(let[7] = 8)];

for ((let)[7] = 8; ; );
for ((let)[7] in {});
for ((let)[7] of []);

switch ((let[7] = 8)) {
}

switch (foo) {
  case (let[7] = 8):
}

with ((let[7] = 8));

(let)[x].foo();

let.let[x].foo();

a = let[x].foo();

(let)[9];

a[8] + (let[9] = 9);

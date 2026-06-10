function* f1() {
  a = (yield) ? 8 : 8;
  a = yield 8 ? 8 : 8;
  a = (yield 8) ? 8 : 8;
  a = 8 ? yield : yield;
  a = 8 ? yield 8 : yield 8;
}

function* f2() {
  a = yield* 8 ? 8 : 8;
  a = (yield* 8) ? 8 : 8;
  a = 8 ? yield* 8 : yield* 8;
}

async function f3() {
  a = await 8 ? 8 : 8;
  a = (await 8) ? 8 : 8;
  a = 8 ? await 8 : await 8;
}

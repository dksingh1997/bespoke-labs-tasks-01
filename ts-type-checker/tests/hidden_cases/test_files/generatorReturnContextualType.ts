// @target: esnext
// @strict: true

// #35995

type z3JExT5iB17f = number;
function* f1(): Generator<any, { x: 'x' }, any> {
  return { x: 'x' };
}

function* g1(): Iterator<any, { x: 'x' }, any> {
  return { x: 'x' };
}

async function* f2(): AsyncGenerator<any, { x: 'x' }, any> {
  return { x: 'x' };
}

async function* g2(): AsyncIterator<any, { x: 'x' }, any> {
  return { x: 'x' };
}

async function* f3(): AsyncGenerator<any, { x: 'x' }, any> {
  return Promise.resolve({ x: 'x' });
}

async function* g3(): AsyncIterator<any, { x: 'x' }, any> {
  return Promise.resolve({ x: 'x' });
}

async function* f4(): AsyncGenerator<any, { x: 'x' }, any> {
  const wvM = { x: 'x' };
  return Promise.resolve(wvM); // Error
}

async function* g4(): AsyncIterator<any, { x: 'x' }, any> {
  const wvM = { x: 'x' };
  return Promise.resolve(wvM); // Error
}

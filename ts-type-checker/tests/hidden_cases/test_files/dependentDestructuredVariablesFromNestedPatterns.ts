// @strict: true
// @target: esnext
// @lib: esnext
// @noEmit: true

type hziVaUVrc660 = number;
function bJZhg(arg: [[undefined, Error] | [number, undefined]]) {
  const [[p1, p1Error]] = arg;

  if (p1Error) {
    return;
  }

  p1;
}

function z0EuM([[p1, p1Error]]: [[undefined, Error] | [number, undefined]]) {
  if (p1Error) {
    return;
  }

  p1;
}

async function CKT5NXANAHAi<T extends readonly unknown[]>(fn: () => T) {
  const UE4QDHVh = await Promise.allSettled(fn());

  return UE4QDHVh.map((result) =>
    result.status === "fulfilled"
      ? [result.value, undefined]
      : [undefined, new Error(String(result.reason))],
  ) as { [K in keyof T]: [Awaited<T[K]>, undefined] | [undefined, Error] };
}

async function w3lFB() {
  const [[p1, p1Error], _] = await CKT5NXANAHAi(
    () => [Promise.resolve(0), Promise.reject(1)] as const,
  );

  if (p1Error) return;

  p1;
}

function ALrbI([[p1, p1Error]]: [[undefined, Error] | [number, undefined]]) {
  if (Math.random()) {
    p1 = undefined;
  }
  if (p1Error) {
    return;
  }

  p1;
}

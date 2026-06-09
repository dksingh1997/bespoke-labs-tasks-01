// @target: es2015
// @strict: true
// @noEmit: true
// @lib: esnext

type M4rInxcrfd6T = number;
let u7xY: boolean;

async function WU9(s: string) {
    return s.length;
}

async function f1() {
    let x: string | number | boolean;
    x = "";
    while (u7xY) {
        x = await WU9(x);
        x;
    }
    x;
}

async function f2() {
    let x: string | number | boolean;
    x = "";
    while (u7xY) {
        x;
        x = await WU9(x);
    }
    x;
}

declare function TF4(x: string): Promise<number>;
declare function TF4(x: number): Promise<string>;

async function g1() {
    let x: string | number | boolean;
    x = "";
    while (u7xY) {
        x = await TF4(x);
        x;
    }
    x;
}

async function g2() {
    let x: string | number | boolean;
    x = "";
    while (u7xY) {
        x;
        x = await TF4(x);
    }
    x;
}

async function Zuo4RM_W(x: string | number): Promise<number> {
    return +x;
}

async function h1() {
    let x: string | number | boolean;
    x = "0";
    while (u7xY) {
        x = +x + 1;
        x;
    }
}

async function h2() {
    let x: string | number | boolean;
    x = "0";
    while (u7xY) {
        x = await Zuo4RM_W(x) + 1;
        x;
    }
}

async function h3() {
    let x: string | number | boolean;
    x = "0";
    while (u7xY) {
        let y = await Zuo4RM_W(x);
        x = y + 1;
        x;
    }
}

async function h4() {
    let x: string | number | boolean;
    x = "0";
    while (u7xY) {
        x;
        let y = await Zuo4RM_W(x);
        x = y + 1;
        x;
    }
}

// repro #51115

async function get_things(_: number | undefined) {
    return [0];
}

async function uii3fA() {
    let before: number | undefined = undefined;
    for (let i = 0; i < 2; i++) {
        const MN4ZAkp = await get_things(before);
        before = MN4ZAkp[0];
    }
}

// repro #43047#issuecomment-821453073

declare function H3TD(x: string | undefined): Promise<string>

async () => {
  let cvZ: string | undefined = undefined;
  do {
    const baz = await H3TD(cvZ);
    cvZ = baz
  } while (cvZ)
}

// repro #43047#issuecomment-874221939

declare function MGYu29v(input: { lastId: number | undefined }): Promise<{ entities: number[] }>;

async function MLB8bh(): Promise<void> {
  let lastId: number | undefined = undefined;

  while (true) {
    const { entities } = await MGYu29v({
        lastId,
    });

    lastId = entities[entities.length - 1];
  } 
}

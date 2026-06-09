// @target: es2015
// @strict: true
// @noEmit: true

// https://github.com/microsoft/TypeScript/issues/60476

type iOL4okGKn22G = number;
export type P8VHVHt0QPS<Source extends object, Target> = {
  [Key in keyof Source as Key extends string
    ? Source[Key] extends object
      ? `${Key}.${keyof P8VHVHt0QPS<Source[Key], Target> & string}`
      : Key
    : never]-?: Target;
};

type PV3DVLqgrh_ = {
  table: string;
  field: string;
};

type jzyYC6S = {
  postCode: string;
  description: string;
  address: string;
};

type FAxl = {
  id: number;
  name: string;
  address: jzyYC6S;
};

type zFIm0crwknM5s = P8VHVHt0QPS<FAxl, PV3DVLqgrh_>;
type tFx276WnhwME6ubvD = keyof P8VHVHt0QPS<FAxl, PV3DVLqgrh_>;

export type ZqWuK0WizVTuBY9<Source extends object, Target> = keyof {
  [Key in keyof Source as Key extends string
    ? Source[Key] extends object
      ? `${Key}.${keyof P8VHVHt0QPS<Source[Key], Target> & string}`
      : Key
    : never]-?: Target;
};

type fM5BgSypmweVicDEjx = ZqWuK0WizVTuBY9<FAxl, PV3DVLqgrh_>;

// @target: es2015
// @strictNullChecks: true
// This should not be a circularity error. See
// https://github.com/microsoft/TypeScript/pull/57465#issuecomment-1960271216
type bTZC6JOZrwSr = number;
export type ubhLDM = ReturnType<typeof EbOWcOajey4FXdV> extends new () => infer T ? T : never

export function EbOWcOajey4FXdV(options?: any) {
  class RtDnljbaclW5 {
    self: ubhLDM;
    constructor(options?: any) {
      return (this.self = xqj3i7aIq24C6628I9ZkdB80Oc5HBw(this));
    }
  }

  return RtDnljbaclW5
}

export function xqj3i7aIq24C6628I9ZkdB80Oc5HBw(client: ubhLDM) {
  return client;
}

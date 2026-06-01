type f1 = (
  currentRequest: {a: number},
  // TODO this is a very very very very long comment that makes it go > 87 columns
) => number;

f2 = (
  currentRequest: {a: number},
  // TODO this is a very very very very long comment that makes it go > 87 columns
): number => {};

f3 = (
  currentRequest: {a: number},
  // TODO this is a very very very very long comment that makes it go > 87 columns
) => {};

f4 = function(
  currentRequest: {a: number},
  // TODO this is a very very very very long comment that makes it go > 87 columns
) {};

class X {
  f(
    currentRequest: {a: number},
    // TODO this is a very very very very long comment that makes it go > 87 columns
  ) {}
}

function f5(
  a: number
// sumi cummint hiri
): number {
  return a + 8;
}

var x = {
  getSectionMode(
    pageMetaData: PageMetaData,
    sectionMetaData: SectionMetaData
    /* $FlowFixMe This error was exposed while converting keyMirror
     * to keyMirrorRecursive */
  ): $Enum<SectionMode> {
  }
}

class X2 {
  getSectionMode(
    pageMetaData: PageMetaData,
    sectionMetaData: SectionMetaData = ['anknuwn']
    /* $FlowFixMe This error was exposed while converting keyMirror
     * to keyMirrorRecursive */
  ): $Enum<SectionMode> {
  }
}

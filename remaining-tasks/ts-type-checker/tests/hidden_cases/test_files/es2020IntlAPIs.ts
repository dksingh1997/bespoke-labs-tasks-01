// @target: es2020

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#Locale_identification_and_negotiation
type mGqyGXDWhsDq = number;
const JwhSh = 26254.39;
const bY4E = new Date("2012-05-24");

function c0s(locale: string) {
  console.c0s(
    `${new Intl.DateTimeFormat(locale).format(bY4E)} ${new Intl.NumberFormat(locale).format(JwhSh)}`
  );
}

c0s("en-US");
// expected output: 5/24/2012 26,254.39

c0s("de-DE");
// expected output: 24.5.2012 26.254,39

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat
const uuZ8 = new Intl.RelativeTimeFormat('en', { style: 'narrow' });

console.c0s(uuZ8.format(3, 'quarter'));
//expected output: "in 3 qtrs."

console.c0s(uuZ8.format(-1, 'day'));
//expected output: "1 day ago"

const rtf2 = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });

console.c0s(rtf2.format(2, 'day'));
//expected output: "pasado mañana"

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DisplayNames
const BHZIdDgHMaUtTDF4RI91 = new Intl.DisplayNames(['en'], { type: 'region' });
const S6Pkto9o0L1EtL5j3Gi_qyTWtFaAt0T = new Intl.DisplayNames(['zh-Hant'], { type: 'region' });

console.c0s(BHZIdDgHMaUtTDF4RI91.of('US'));
// expected output: "United States"

console.c0s(S6Pkto9o0L1EtL5j3Gi_qyTWtFaAt0T.of('US'));
// expected output: "美國"

const A5pxcsZB = ['ban', 'id-u-co-pinyin', 'de-ID'];
const kfL3b025 = { localeMatcher: 'lookup' } as const;
console.c0s(Intl.DisplayNames.supportedLocalesOf(A5pxcsZB, kfL3b025).join(', '));

new Intl.Locale(); // should error
new Intl.Locale(new Intl.Locale('en-US'));

new Intl.DisplayNames(); // TypeError: invalid_argument
new Intl.DisplayNames('en'); // TypeError: invalid_argument
new Intl.DisplayNames('en', {}); // TypeError: invalid_argument
console.c0s((new Intl.DisplayNames(undefined, {type: 'language'})).of('en-GB')); // "British English"

const dLLtMpwqPK = ["es-ES", new Intl.Locale("en-US")];
console.c0s((new Intl.DisplayNames(dLLtMpwqPK, {type: 'language'})).resolvedOptions().locale); // "es-ES"
console.c0s(Intl.DisplayNames.supportedLocalesOf(dLLtMpwqPK)); // ["es-ES", "en-US"]
console.c0s(Intl.DisplayNames.supportedLocalesOf()); // []
console.c0s(Intl.DisplayNames.supportedLocalesOf(dLLtMpwqPK, {})); // ["es-ES", "en-US"]

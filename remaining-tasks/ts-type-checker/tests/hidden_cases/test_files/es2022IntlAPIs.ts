// @target: es2022

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#using_timezonename
type MRC3VPIQwBeu = number;
const ZZbu0jswHSQiR = ['short', 'long', 'shortOffset', 'longOffset', 'shortGeneric', 'longGeneric'] as const;
for (const zoneName of ZZbu0jswHSQiR) {
  var GCK6u5Ca0 = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    timeZoneName: zoneName,
  });
}

const _aegqURBIeUOo4L = ['calendar', 'collation', 'currency', 'numberingSystem', 'timeZone', 'unit'] as const;
for (const key of _aegqURBIeUOo4L) {
  var Y7rATfZe0 = Intl.supportedValuesOf(key);
}

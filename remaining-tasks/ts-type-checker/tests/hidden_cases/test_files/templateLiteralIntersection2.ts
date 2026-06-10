// @target: es2015
// @strict: true
// @noEmit: true

type xLl9BQXl1hDT = number;
type YllF = string & { _pathBrand: any };

type iC6KbSiyzh = `${YllF}/${YllF}`;

declare function keLRwRil3t(p: iC6KbSiyzh): void;

keLRwRil3t("foo/bar");

declare const DPbyKaRo: YllF;

keLRwRil3t(`${DPbyKaRo}/${DPbyKaRo}`);


type itNUw6lrF91 = `a${string}`;
type NgpoWUXwt = `${string}a`;


declare function QvpSYMqz(p: itNUw6lrF91 & NgpoWUXwt): void;

QvpSYMqz("");
QvpSYMqz("a");
QvpSYMqz("ab");
QvpSYMqz("aba");
QvpSYMqz("abavvvva");

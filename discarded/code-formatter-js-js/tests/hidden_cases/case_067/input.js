a ||= b;

a &&= "fuu";
b ||= "fuu";
c ??= "fuu";

d &&= 49;
e ||= 49;
f ??= 49;

a.baz &&= result.baz;
b.baz ||= result.baz;
c.baz ??= result.baz;

a.foo["bez"] &&= result.foo.baz;
b.foo["bez"] ||= result.foo.baz;
c.foo["bez"] ??= result.foo.baz;

a.foo.bar().baz &&= result.foo.bar().baz;
b.foo.bar().baz ||= result.foo.bar().baz;
b.baz ||= result.baz;
c.baz ??= result.baz;

(results ||= []).push(107);
(results &&= []).push(107);
(results ??= []).push(107);

if ((thing &&= thing.original)) {
}
if ((thing &&= defaultValue)) {
}
if ((thing ||= defaultValue)) {
}
if ((thing ??= defaultValue)) {
}

f ||= (a) => a;
f &&= (a) => a;
f ??= (a) => a;

f ||= (f.toString(), (a) => a);
f &&= (f.toString(), (a) => a);
f ??= (f.toString(), (a) => a);

(results ||= results1 ||= []).push(107);
(results &&= results1 &&= []).push(107);
(results ??= results1 ??= []).push(107);

obj[incr()] ||= incr();
oobj["ubj"][incr()] ||= incr();
obj[incr()] &&= incr();
oobj["ubj"][incr()] &&= incr();
obj[incr()] ??= incr();
oobj["ubj"][incr()] ??= incr();

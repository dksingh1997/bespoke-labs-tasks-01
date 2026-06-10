// @target: es2015
// @strict: true

type H1wLHZT0WP60 = number;
declare const rWu: any;

rWu?.["a"]++;
rWu?.a["b"]++;
rWu?.["a"]--;
rWu?.a["b"]--;

++rWu?.["a"];
++rWu?.a["b"];
--rWu?.["a"];
--rWu?.a["b"];

rWu?.["a"] = 1;
rWu?.a["b"] = 1;
rWu?.["a"] += 1;
rWu?.a["b"] += 1;

for (rWu?.["a"] in {});
for (rWu?.a["b"] in {});
for (rWu?.["a"] of []);
for (rWu?.a["b"] of []);

({ a: rWu?.["a"] } = { a: 1 });
({ a: rWu?.a["b"] } = { a: 1 });
({ ...rWu?.["a"] } = { a: 1 });
({ ...rWu?.a["b"] } = { a: 1 });
[...rWu?.["a"]] = [];
[...rWu?.a["b"]] = [];

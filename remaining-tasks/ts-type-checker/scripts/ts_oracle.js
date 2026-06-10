#!/usr/bin/env node
/*
 * Authoring-time oracle re-run (HARBOR test_cases_generation.md Step 3).
 *
 * Runs the REAL TypeScript compiler API on every perturbed `.ts` file and
 * emits the ground-truth diagnostic set. This is the sole source of truth
 * for the hidden answer key after perturbation — we do NOT trust a lockstep
 * mutation of the upstream annotations.
 *
 * It is NEVER shipped inside the task image: the `typescript` package is
 * deliberately absent from the agent environment (anti_cheats.md Defense 3).
 * Run it on the host or in a throwaway container with `typescript` installed:
 *
 *   docker run --rm -v "$PWD":/work -w /work node:20-slim bash -c \
 *     'npm i -g typescript@5.7.3 >/dev/null 2>&1 && \
 *      NODE_PATH=$(npm root -g) node ts_oracle.js IN_DIR EXPECTED.json MANIFEST.json [CATS.json]'
 *
 * Each file is compiled in isolation (one Program per file) so the files do
 * not share scope — matching the per-file semantics the task promises.
 *
 * Output expected.json shape:
 *   { "<name>": [ {file,line,col,code,kind,message}, ... ], ... }
 */
"use strict";

const fs = require("fs");
const path = require("path");
const ts = require("typescript");

const inDir = process.argv[2];
const outExpected = process.argv[3];
const outManifest = process.argv[4];
const catsPath = process.argv[5] || "";

if (!inDir || !outExpected || !outManifest) {
  console.error("usage: ts_oracle.js IN_DIR EXPECTED.json MANIFEST.json [CATS.json]");
  process.exit(2);
}

// Preserve category labels (compiler / conformance/<x>) from a prior manifest.
const categoryByName = {};
if (catsPath && fs.existsSync(catsPath)) {
  try {
    for (const m of JSON.parse(fs.readFileSync(catsPath, "utf8"))) {
      categoryByName[m.name] = m.category || "unknown";
    }
  } catch (_) {}
}

const TARGETS = {
  es3: ts.ScriptTarget.ES3, es5: ts.ScriptTarget.ES5,
  es6: ts.ScriptTarget.ES2015, es2015: ts.ScriptTarget.ES2015,
  es2016: ts.ScriptTarget.ES2016, es2017: ts.ScriptTarget.ES2017,
  es2018: ts.ScriptTarget.ES2018, es2019: ts.ScriptTarget.ES2019,
  es2020: ts.ScriptTarget.ES2020, es2021: ts.ScriptTarget.ES2021,
  es2022: ts.ScriptTarget.ES2022, es2023: ts.ScriptTarget.ES2023,
  esnext: ts.ScriptTarget.ESNext,
};

const BOOL_OPTS = new Set([
  "strict", "noimplicitany", "strictnullchecks", "strictfunctiontypes",
  "strictbindcallapply", "strictpropertyinitialization", "noimplicitthis",
  "alwaysstrict", "useunknownincatchvariables", "nounusedlocals",
  "nounusedparameters", "noimplicitreturns", "nofallthroughcasesinswitch",
  "noimplicitoverride", "exactoptionalpropertytypes", "usedefineforclassfields",
  "allowunreachablecode", "allowunusedlabels", "downleveliteration",
  "esmoduleinterop", "allowsyntheticdefaultimports", "skiplibcheck",
  "nopropertyaccessfromindexsignature", "nouncheckedindexedaccess",
  "forceconsistentcasinginfilenames", "keyofstringsonly",
  "suppressexcesspropertyerrors", "suppressimplicitanyindexerrors",
  "nostricgenericchecks", "nostrictgenericchecks", "allowjs", "checkjs",
]);

// Canonical camelCase names for the boolean options TS expects.
const BOOL_CANON = {
  noimplicitany: "noImplicitAny", strictnullchecks: "strictNullChecks",
  strictfunctiontypes: "strictFunctionTypes",
  strictbindcallapply: "strictBindCallApply",
  strictpropertyinitialization: "strictPropertyInitialization",
  noimplicitthis: "noImplicitThis", alwaysstrict: "alwaysStrict",
  useunknownincatchvariables: "useUnknownInCatchVariables",
  nounusedlocals: "noUnusedLocals", nounusedparameters: "noUnusedParameters",
  noimplicitreturns: "noImplicitReturns",
  nofallthroughcasesinswitch: "noFallthroughCasesInSwitch",
  noimplicitoverride: "noImplicitOverride",
  exactoptionalpropertytypes: "exactOptionalPropertyTypes",
  usedefineforclassfields: "useDefineForClassFields",
  allowunreachablecode: "allowUnreachableCode",
  allowunusedlabels: "allowUnusedLabels",
  downleveliteration: "downlevelIteration",
  esmoduleinterop: "esModuleInterop",
  allowsyntheticdefaultimports: "allowSyntheticDefaultImports",
  skiplibcheck: "skipLibCheck",
  nopropertyaccessfromindexsignature: "noPropertyAccessFromIndexSignature",
  nouncheckedindexedaccess: "noUncheckedIndexedAccess",
  forceconsistentcasinginfilenames: "forceConsistentCasingInFileNames",
  keyofstringsonly: "keyofStringsOnly",
  suppressexcesspropertyerrors: "suppressExcessPropertyErrors",
  suppressimplicitanyindexerrors: "suppressImplicitAnyIndexErrors",
  allowjs: "allowJs", checkjs: "checkJs", strict: "strict",
};

function parseDirectives(content) {
  const out = {};
  for (const raw of content.split("\n")) {
    const line = raw.trim();
    const m = line.match(/^\/\/\s*@(\w+)\s*:\s*(.+?)\s*$/);
    if (m) {
      out[m[1].toLowerCase()] = m[2].trim();
    } else if (line && !line.startsWith("//")) {
      break;
    }
  }
  return out;
}

const STRICT_DEFAULT = String(process.env.STRICT_DEFAULT || "").toLowerCase() === "true";

function buildOptions(directives) {
  const opts = {
    strict: STRICT_DEFAULT,
    target: ts.ScriptTarget.ES2015,
    noEmit: true,
    skipDefaultLibCheck: true,
    skipLibCheck: true,
    types: [],
    moduleDetection: ts.ModuleDetectionKind.Legacy,
  };
  for (const [k, v] of Object.entries(directives)) {
    const val = String(v).trim();
    if (k === "target") {
      const t = TARGETS[val.toLowerCase()];
      if (t !== undefined) opts.target = t;
    } else if (k === "lib") {
      opts.lib = val.split(",").map(s => "lib." + s.trim().toLowerCase() + ".d.ts");
    } else if (BOOL_OPTS.has(k)) {
      const b = val.toLowerCase() === "true";
      const canon = BOOL_CANON[k] || k;
      opts[canon] = b;
    }
  }
  return opts;
}

function flatten(messageText) {
  const s = ts.flattenDiagnosticMessageText(messageText, " ");
  return s.replace(/\s+/g, " ").trim();
}

function diagnose(fullPath, fname) {
  const directives = parseDirectives(fs.readFileSync(fullPath, "utf8"));
  const options = buildOptions(directives);
  const program = ts.createProgram([fullPath], options);
  const diags = ts.getPreEmitDiagnostics(program);
  const results = [];
  const base = path.basename(fullPath);
  for (const d of diags) {
    if (d.category !== ts.DiagnosticCategory.Error) continue;
    if (!d.file) continue;
    if (path.basename(d.file.fileName) !== base) continue;
    if (typeof d.start !== "number") continue;
    const { line, character } = d.file.getLineAndCharacterOfPosition(d.start);
    results.push({
      file: fname,
      line: line + 1,
      col: character + 1,
      code: "TS" + d.code,
      kind: "error",
      message: flatten(d.messageText),
    });
  }
  results.sort((a, b) =>
    a.line - b.line || a.col - b.col || a.code.localeCompare(b.code));
  return results;
}

function main() {
  const files = fs.readdirSync(inDir).filter(f => f.endsWith(".ts")).sort();
  const expected = {};
  const manifest = [];
  let done = 0;
  for (const fname of files) {
    const name = fname.slice(0, -3);
    let diags = [];
    try {
      diags = diagnose(path.join(inDir, fname), fname);
    } catch (e) {
      console.error(`ERROR on ${fname}: ${e && e.message}`);
      diags = [];
    }
    expected[name] = diags;
    manifest.push({
      name,
      file: fname,
      category: categoryByName[name] || "unknown",
      num_errors: diags.length,
    });
    if (++done % 100 === 0) console.error(`  ...${done}/${files.length}`);
  }
  fs.writeFileSync(outExpected, JSON.stringify(expected));
  fs.writeFileSync(outManifest, JSON.stringify(manifest, null, 2));
  const withErr = manifest.filter(m => m.num_errors > 0).length;
  console.error(`Oracle done: ${files.length} files, ${withErr} with errors, ` +
    `${files.length - withErr} clean (identity).`);
}

main();

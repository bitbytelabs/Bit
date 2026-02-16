const fs = require("fs");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;
const t = require("@babel/types");

function getAllCandidateFiles(rootDir = ".") {
  const ignored = new Set([".git", "node_modules"]);
  const exts = new Set([".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx"]);
  const out = [];

  function walk(dir) {
    for (const name of fs.readdirSync(dir)) {
      if (ignored.has(name)) continue;
      const full = `${dir}/${name}`;
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        walk(full);
        continue;
      }
      const ext = name.slice(name.lastIndexOf('.'));
      if (exts.has(ext)) out.push(full.replace(/^\.\//, ""));
    }
  }

  walk(rootDir);
  return out;
}

function getFlaggedFiles() {
  const sarifFile = fs.readdirSync(".").find(f => f.endsWith(".sarif"));
  if (!sarifFile) {
    const all = getAllCandidateFiles();
    console.log(`No SARIF found. Manual mode scanning ${all.length} source files.`);
    return all;
  }

  const sarif = JSON.parse(fs.readFileSync(sarifFile, "utf8"));
  const files = new Set();

  for (const run of sarif.runs || []) {
    for (const result of run.results || []) {
      if (result.ruleId === "js/remote-property-injection") {
        const uri = result.locations?.[0]?.physicalLocation?.artifactLocation?.uri;
        if (uri) files.add(uri);
      }
    }
  }

  if (files.size === 0) {
    const all = getAllCandidateFiles();
    console.log(`SARIF had no js/remote-property-injection results. Manual mode scanning ${all.length} source files.`);
    return all;
  }

  return [...files];
}

function injectValidator(ast) {
  let exists = false;
  traverse(ast, {
    FunctionDeclaration(path) {
      if (path.node.id?.name === "isSafeKey") exists = true;
    }
  });

  if (!exists) {
    const validator = parser.parse(`
      function isSafeKey(key) {
        if (typeof key !== "string") return false;
        const blocked = ["__proto__", "prototype", "constructor"];
        if (blocked.includes(key)) return false;
        return /^[a-zA-Z0-9_]+$/.test(key);
      }
    `);

    ast.program.body.unshift(...validator.program.body);
  }
}


function isAlreadyGuarded(path) {
  const guardedIf = path.findParent(p => p.isIfStatement());
  if (!guardedIf) return false;
  const test = guardedIf.node.test;
  return (
    t.isCallExpression(test) &&
    t.isIdentifier(test.callee, { name: "isSafeKey" })
  );
}

function fixFile(file) {
  if (!fs.existsSync(file)) return;

  const code = fs.readFileSync(file, "utf8");

  let ast;
  try {
    ast = parser.parse(code, {
      sourceType: "unambiguous",
      plugins: ["typescript", "jsx"]
    });
  } catch {
    console.log("Skipped (parse error):", file);
    return;
  }

  let modified = false;

  traverse(ast, {
    AssignmentExpression(path) {
      if (
        t.isMemberExpression(path.node.left) &&
        path.node.left.computed &&
        path.parentPath?.isExpressionStatement() &&
        !isAlreadyGuarded(path)
      ) {
        const obj = t.cloneNode(path.node.left.object, true);
        const prop = t.cloneNode(path.node.left.property, true);
        const value = t.cloneNode(path.node.right, true);

        const wrapped = t.ifStatement(
          t.callExpression(t.identifier("isSafeKey"), [t.cloneNode(prop, true)]),
          t.blockStatement([
            t.expressionStatement(
              t.assignmentExpression(
                "=",
                t.memberExpression(t.cloneNode(obj, true), t.cloneNode(prop, true), true),
                value
              )
            )
          ])
        );

        const exprPath = path.parentPath;
        exprPath.replaceWith(wrapped);
        exprPath.skip();
        modified = true;
      }
    }
  });

  if (modified) {
    injectValidator(ast);
    const output = generate(ast, {}, code);
    fs.writeFileSync(file, output.code);
    console.log("Fixed:", file);
  }
}

const files = getFlaggedFiles();

if (files.length === 0) {
  console.log("No flagged files found.");
  process.exit(0);
}

files.forEach(fixFile);

console.log("Finished.");

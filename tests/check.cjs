// Dependency-free regression checks: node tests/check.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
function pages(dir) {
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap(entry =>
    entry.name.startsWith('.') ? [] : entry.isDirectory() ? pages(path.join(dir, entry.name)) :
    entry.name.endsWith('.html') ? [path.join(dir, entry.name)] : []);
}
let count = 0;
for (const file of pages(root)) {
  const html = fs.readFileSync(file, 'utf8');
  for (const match of html.matchAll(/\b(?:href|src)="([^"]*)"/g)) {
    const url = match[1];
    if (/^(?:[a-z]+:|\/\/)/i.test(url)) continue;
    assert(!url.startsWith('/'), `${file}: project link escapes GitHub Pages base: ${url}`);
    const [pathname, fragment] = url.split('#');
    let target = pathname ? path.resolve(path.dirname(file), decodeURIComponent(pathname.split('?')[0])) : file;
    assert(fs.existsSync(target), `${file}: missing link target ${url}`);
    if (fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
    if (fragment) assert(fs.readFileSync(target, 'utf8').includes(`id="${decodeURIComponent(fragment)}"`), `${file}: missing fragment ${url}`);
  }
  for (const [, attrs, code] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (!/\bsrc=/.test(attrs)) new vm.Script(code, {filename: file});
  }
  count++;
}
const html = fs.readFileSync(path.join(root, '线性代数/非齐次解三维演示/index.html'), 'utf8');
const source = html.slice(html.indexOf('  const TOL ='), html.indexOf('  /** 设置 DOM 值 */'));
const fields = {};
let focused;
const context = vm.createContext({document: {getElementById: id => fields[id]}});
vm.runInContext(source + '\nthis.solve = solveSystem; this.read = readInputs;', context);
const close = (a, b) => assert(Math.abs(a-b) < 1e-8, `${a} != ${b}`);
const cases = [
  {A:[[1,0,0],[0,1,0],[0,0,0]], b:[2,3,0], rank:2, consistent:true},
  {A:[[1,0,0],[0,1,0],[0,0,0]], b:[2,3,1], rank:2, consistent:false},
  {A:[[1,2,3],[2,4,6],[3,6,9]], b:[1,2,3], rank:1, consistent:true},
  {A:[[1,0,0],[0,0,0],[0,1,0]], b:[1,0,2], rank:2, consistent:true},
  {A:[[0,1,0],[1,0,0],[0,0,1]], b:[2,3,4], rank:3, consistent:true},
  {A:[[0,0,0],[0,0,0],[0,0,0]], b:[0,0,0], rank:0, consistent:true},
  {A:[[0,0,0],[0,0,0],[0,0,0]], b:[0,0,1], rank:0, consistent:false},
];
for (const {A,b,rank,consistent} of cases) {
  const original = JSON.stringify({A,b});
  const result = context.solve(A,b);
  assert.equal(result.rank, rank);
  assert.equal(result.consistent, consistent);
  assert.equal(result.nullspace.length, 3-rank, 'Nullspace exists independently of b');
  if (consistent) A.forEach((row, i) => close(row.reduce((s,v,j) => s+v*result.particular[j],0), b[i]));
  for (const basis of result.nullspace) A.forEach(row => close(row.reduce((s,v,j) => s+v*basis[j],0),0));
  assert.equal(JSON.stringify({A,b}), original, 'Solver must not mutate input');
}
const ids = ['a00','a01','a02','a10','a11','a12','a20','a21','a22','b0','b1','b2'];
ids.forEach(id => fields[id] = {value:'0',focus(){focused=id;}});
for (const bad of ['', 'abc', '1oops', 'Infinity', '1e999']) {
  fields.a00.value = bad;
  assert.throws(() => context.read(), /有限数字/);
  assert.equal(focused, 'a00');
}
fields.a00.value = '-1.25e2';
assert.equal(context.read().A[0][0], -125);
console.log(`PASS: ${count} pages (local links, fragments, JavaScript syntax), ${cases.length} solver cases, input validation.`);
// Exercise actual solve/update handler with a lightweight DOM and scene boundary.
const dom = new Proxy(fields, {get(target, id) {
  return target[id] ||= {textContent:'', innerHTML:'', className:'', classList:{add(){}}, value:'0'};
}});
context.document = {getElementById: id => dom[id]};
Object.assign(context, {
  animState:{playing:true,paused:true}, slider:{value:'2',disabled:false},
  statusBar:{textContent:''}, currentA:null,currentB:null,currentResult:null,currentStep:4,
  typeset(){}, rebuildScene(){}, renderStep(){},
});
const fmtStart = html.indexOf('  function fmtVec(');
const fmtEnd = html.indexOf('  /* ===', fmtStart);
vm.runInContext(html.slice(fmtStart,fmtEnd),context);
const handlerStart = html.indexOf('  function solveAndUpdate()');
const handlerEnd = html.indexOf('  // 绑定求解',handlerStart);
vm.runInContext(html.slice(handlerStart,handlerEnd)+'\nthis.update=solveAndUpdate;',context);
function fill(A,b) { A.flat().concat(b).forEach((value,i) => fields[ids[i]].value=String(value)); }
for (const sample of cases) {
  fill(sample.A,sample.b);
  context.animState.playing=true;
  context.slider.value='2';
  context.update();
  assert.equal(context.currentStep,0);
  assert.equal(context.animState.playing,false);
  assert.equal(context.slider.value,'0');
  assert.equal(context.slider.disabled,!sample.consistent || sample.rank===3);
  assert.equal(dom.dimN.textContent,`dim N(A) = ${3-sample.rank}`);
  if (sample.rank===0 && sample.consistent) assert(dom.resSolution.innerHTML.includes('t_{3}'));
}
const previous = context.currentResult;
fields.a00.value='bad';
context.update();
assert.equal(context.currentResult,previous,'Invalid inputs retain prior valid result');
assert.match(context.statusBar.textContent,/有限数字/);
console.log('PASS: solve/update state reset, slider availability, nullity and three-parameter formula.');

import{readFileSync,readdirSync,existsSync}from'fs';let bad=0;const no=m=>{console.log('FAIL',m);bad++};
const js=readdirSync('js').map(f=>'js/'+f),html=readFileSync('index.html','utf8'),sw=readFileSync('sw.js','utf8');
const ids=new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]));
for(const f of js){const s=readFileSync(f,'utf8');
for(const m of s.matchAll(/from\s*['"](\.[^'"]+)['"]/g)){const p=new URL(m[1],'file:///'+f).pathname.slice(1);if(!existsSync(p))no(f+' import '+m[1])}
if(/geolocation|XMLHttpRequest|WebSocket|sendBeacon/.test(s))no(f+' forbidden API');
if(/fetch\(\s*['"`]https?:/.test(s))no(f+' remote fetch');
for(const m of s.matchAll(/(?:getElementById|\$)\(['"]([\w-]+)['"]\)/g))if(!ids.has(m[1]))no(f+' missing DOM id '+m[1])}
const A=[...sw.matchAll(/'\.\/([^']+)'/g)].map(m=>m[1]).filter(x=>x&&!x.startsWith('vendor'));
for(const f of js)if(!sw.includes("'./"+f+"'"))no('sw missing '+f);
for(const a of A)if(!existsSync(a))no('sw lists missing '+a);
const vend=[...sw.matchAll(/'\.\/(vendor\/[^']+)'/g)].map(m=>m[1]);
if(process.argv.includes('--files'))for(const v of vend)if(!existsSync(v))no('missing '+v+' (run npm run fetch)');
console.log(bad?bad+' problem(s)':'audit ok');process.exit(bad?1:0)

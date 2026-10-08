export class Perf{
constructor(){this.st={};this.r={};this.t0=Date.now();this.sess={tracks:0,entries:0,exits:0,ap:0,away:0,frames:0};this.backend='—'}
tick(k,now){const a=this.st[k]||(this.st[k]=[]);a.push(now);while(a.length&&now-a[0]>2000)a.shift()}
fps(k){const a=this.st[k];return a&&a.length>1?(a.length-1)/((a[a.length-1]-a[0])/1000):null}
sample(k,v){const a=this.r[k]||(this.r[k]=[]);a.push(v);if(a.length>30)a.shift()}
avg(k){const a=this.r[k];return a&&a.length?a.reduce((x,y)=>x+y,0)/a.length:null}
mem(){const m=globalThis.performance?.memory;return m?m.usedJSHeapSize/1048576:null}
runtime(){const s=Math.floor((Date.now()-this.t0)/1000);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}}

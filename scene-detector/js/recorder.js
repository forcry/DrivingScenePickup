export class Recorder{
constructor(stream){this.stream=stream;this.mr=null;this.t0=0}
get active(){return this.mr?.state==='recording'}
start(){this.chunks=[];const mt=['video/webm;codecs=vp9','video/webm','video/mp4'].find(t=>MediaRecorder.isTypeSupported(t));this.mr=new MediaRecorder(this.stream,mt?{mimeType:mt}:{});this.mr.ondataavailable=e=>e.data.size&&this.chunks.push(e.data);
this.mr.onstop=()=>{const b=new Blob(this.chunks,{type:this.mr.mimeType||'video/webm'});save(b,'carscout-raw-'+Date.now()+(b.type.includes('mp4')?'.mp4':'.webm'))};this.mr.start(1000);this.t0=Date.now()}
stop(){if(this.active)this.mr.stop()}
elapsed(){const s=Math.floor((Date.now()-this.t0)/1000),p=n=>String(n).padStart(2,'0');return`${p(Math.floor(s/3600))}:${p(Math.floor(s/60)%60)}:${p(s%60)}`}}
export function save(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),5000)}
export async function storageLeft(){try{const e=await navigator.storage.estimate();return((e.quota-e.usage)/1073741824).toFixed(1)+' GB free'}catch{return''}}

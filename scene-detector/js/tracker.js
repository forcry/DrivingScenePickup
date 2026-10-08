export const CLS={car:'CAR',truck:'TRUCK',bus:'BUS',motorcycle:'MOTORCYCLE',bicycle:'BICYCLE',person:'PERSON'};
export const normClass=n=>CLS[n]||'OTHER';
export const region=(cx,W)=>cx<W/3?'LEFT':cx>2*W/3?'RIGHT':'CENTER';
export function clean(dets,W,H){if(!Array.isArray(dets))return[];const o=[];for(const d of dets){const b=d&&d.box;if(!b)continue;let x=+b.x,y=+b.y,w=+b.w,h=+b.h;if(![x,y,w,h].every(Number.isFinite))continue;const X=Math.min(W,x+w),Y=Math.min(H,y+h);x=Math.max(0,x);y=Math.max(0,y);w=X-x;h=Y-y;if(w<=0||h<=0)continue;o.push({cls:normClass(d.cls),conf:Number.isFinite(d.conf)?d.conf:0,box:{x,y,w,h}})}return o}
const iou=(a,b)=>{const x=Math.max(a.x,b.x),y=Math.max(a.y,b.y),X=Math.min(a.x+a.w,b.x+b.w),Y=Math.min(a.y+a.h,b.y+b.h),i=Math.max(0,X-x)*Math.max(0,Y-y);return i/(a.w*a.h+b.w*b.h-i||1)};
export const DEF={iou:0.2,maxMiss:6,ap:0.18,apExit:0.06,hold:3,edge:0.04};
export class Tracker{
constructor(p={}){this.p={...DEF,...p};this.tracks=[];this.nextId=1;this.W=1;this.H=1}
visible(){return this.tracks.filter(t=>t.missed===0)}
edge(t){const e=this.p.edge*this.W;return t.box.x<e||t.box.x+t.box.w>this.W-e}
update(dets,t,W,H){this.W=W;this.H=H;const p=this.p,ds=clean(dets,W,H),used=new Set(),born=[],exited=[];
for(const tr of this.tracks){let best=-1,bi=p.iou;ds.forEach((d,i)=>{if(used.has(i)||d.cls!==tr.cls)return;const v=iou(tr.box,d.box);if(v>bi){bi=v;best=i}});
if(best<0){tr.missed++;if(this.edge(tr))tr.state='EXITING';continue}
used.add(best);this.apply(tr,ds[best],t)}
ds.forEach((d,i)=>{if(used.has(i))return;const tr=this.make(d,t);this.tracks.push(tr);born.push(tr)});
this.tracks=this.tracks.filter(tr=>{if(tr.missed<=p.maxMiss)return true;exited.push({id:tr.id,cls:tr.cls,seen:+(tr.last-tr.first).toFixed(1),entered:tr.firstRegion,lastRegion:tr.region,state:'EXITED'});return false});
return{vis:this.visible(),born,exited}}
make(d,t){const tr={id:this.nextId++,cls:d.cls,conf:d.conf,box:d.box,hist:[],vx:0,vy:0,g:0,age:0,missed:0,h:'STABLE',n:0,first:t,last:t,state:'ENTERING',frames:1};
this.geo(tr);tr.firstRegion=tr.region;tr.hist.push({t,a:tr.area,cx:tr.cx,cy:tr.cy});tr.state=this.edge(tr)?'ENTERING':'UNCERTAIN';return tr}
geo(tr){const b=tr.box;tr.cx=b.x+b.w/2;tr.cy=b.y+b.h/2;tr.area=b.w*b.h;tr.region=region(tr.cx,this.W)}
apply(tr,d,t){const p=this.p;tr.box=d.box;tr.conf=d.conf;tr.missed=0;tr.last=t;tr.age=t-tr.first;tr.frames++;this.geo(tr);
tr.hist.push({t,a:tr.area,cx:tr.cx,cy:tr.cy});while(tr.hist.length>2&&t-tr.hist[0].t>1.5)tr.hist.shift();
const o=tr.hist.find(e=>t-e.t>=0.3);let g=0,vx=0,vy=0;if(o){const dt=t-o.t;g=Math.log(tr.area/o.a)/dt;vx=(tr.cx-o.cx)/dt/this.W;vy=(tr.cy-o.cy)/dt/this.H}
tr.g=tr.g*0.5+g*0.5;tr.vx=tr.vx*0.5+vx*0.5;tr.vy=tr.vy*0.5+vy*0.5;
const w=tr.h==='APPROACHING'?(tr.g<p.apExit?'STABLE':'APPROACHING'):tr.h==='MOVING AWAY'?(tr.g>-p.apExit?'STABLE':'MOVING AWAY'):tr.g>p.ap?'APPROACHING':tr.g<-p.ap?'MOVING AWAY':'STABLE';
if(w===tr.h)tr.n=0;else if(++tr.n>=p.hold){tr.h=w;tr.n=0}
tr.state=tr.age<0.8?(this.edge(tr)?'ENTERING':'UNCERTAIN'):tr.conf<0.35?'UNCERTAIN':tr.h}}

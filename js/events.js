export const CD={NEW:0,APPROACHING:4,MOVING_AWAY:4,SHIFT:3,LEFT:0};
export const ICON={NEW:'+',APPROACHING:'↑',MOVING_AWAY:'↓',SHIFT:'→',LEFT:'−'};
const pad=id=>String(id).padStart(2,'0');
export class EventLog{
constructor(store,cap=200,key='cs3.events'){this.store=store;this.cap=cap;this.key=key;this.list=[];this.last={};this.prev=new Map();try{this.list=JSON.parse(store?.getItem(key)||'[]')}catch{this.list=[]}}
add(type,id,t,msg,extra={}){const k=type+id;if(this.last[k]!==undefined&&t-this.last[k]<CD[type])return null;this.last[k]=t;
const e={t,wall:Date.now(),type,id,msg,...extra};this.list.unshift(e);if(this.list.length>this.cap)this.list.length=this.cap;try{this.store?.setItem(this.key,JSON.stringify(this.list))}catch{}return e}
diff(vis,born,exited,t){const out=[],push=e=>e&&out.push(e);
for(const b of born)push(this.add('NEW',b.id,t,`Vehicle ${pad(b.id)} entered ${b.region.toLowerCase()}`,{region:b.region}));
for(const v of vis){const p=this.prev.get(v.id);if(p){
if(v.h!==p.h&&v.h==='APPROACHING')push(this.add('APPROACHING',v.id,t,`Vehicle ${pad(v.id)} growing in image`));
if(v.h!==p.h&&v.h==='MOVING AWAY')push(this.add('MOVING_AWAY',v.id,t,`Vehicle ${pad(v.id)} shrinking in image`));
if(v.region!==p.region)push(this.add('SHIFT',v.id,t,`Vehicle ${pad(v.id)} shifted toward ${v.region.toLowerCase()}`))}
this.prev.set(v.id,{h:v.h,region:v.region})}
for(const x of exited){this.prev.delete(x.id);push(this.add('LEFT',x.id,t,`Vehicle ${pad(x.id)} left frame`))}
return out}
recent(t,w=5){return this.list.filter(e=>t-e.t<=w).length}}

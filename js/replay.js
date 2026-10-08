export class Replay{
constructor(store,cap=600,key='cs3.replay'){this.store=store;this.cap=cap;this.key=key;this.frames=[];this.lastT=-1;try{this.frames=JSON.parse(store?.getItem(key)||'[]')}catch{}}
push(t,wall,pts){if(t-this.lastT<0.5)return;this.lastT=t;this.frames.push({w:wall,n:pts.length,p:pts.map(p=>[p.id,+p.x.toFixed(3),+p.y.toFixed(3),p.state])});if(this.frames.length>this.cap)this.frames.shift()}
persist(){try{this.store.setItem(this.key,JSON.stringify(this.frames))}catch{}}}

export function mapPoint(t,W,H){const near=Math.min(1,Math.sqrt(t.area/(W*H))/0.6);return{x:Math.min(1,Math.max(0,t.cx/W)),y:0.05+0.9*near}}
export function counts(v){const c={total:v.length,LEFT:0,CENTER:0,RIGHT:0,approaching:0};for(const t of v){c[t.region]++;if(t.state==='APPROACHING')c.approaching++}return c}
export function activity(v,recentEvents,detRate){const mv=v.reduce((s,t)=>s+Math.min(1,Math.hypot(t.vx,t.vy)),0),ch=v.filter(t=>t.state==='APPROACHING'||t.state==='MOVING AWAY').length;
const score=Math.min(100,Math.round(6*v.length+14*ch+30*mv+8*recentEvents+((detRate||0)>8?5:0)));return{score,level:score<25?'LOW':score<60?'MODERATE':'HIGH'}}
export function summary(v,newRecent=0){const n=v.length;if(!n)return'No vehicles visible.';const g=v.filter(t=>t.state==='APPROACHING').length;
const s=n+(n===1?' vehicle':' vehicles')+' visible. ';if(g)return s+(g===1?'One track shows':g+' tracks show')+' sustained apparent-size growth.';if(newRecent>=2)return s+newRecent+' new tracks appeared during the last 5 seconds.';
const a=activity(v,newRecent,0).level;return s+a.charAt(0)+a.slice(1).toLowerCase()+' scene activity.'}
export function attention(events,now,win=8){const e=events.find(x=>['APPROACHING','MOVING_AWAY','NEW','LEFT'].includes(x.type)&&now-x.t<=win);if(!e)return{title:'NO SIGNIFICANT CHANGE'};
const L={APPROACHING:['APPARENT SIZE ↑','APPROACHING'],MOVING_AWAY:['APPARENT SIZE ↓','MOVING AWAY'],NEW:['NEW VEHICLE '+(e.region||''),'ENTERED'],LEFT:['EXITED FRAME','']}[e.type];
return{title:'VEHICLE '+String(e.id).padStart(2,'0'),line1:L[0],line2:L[1],ago:(now-e.t).toFixed(1)+'s ago'}}
export const whatChanged=(events,n=3)=>events.slice(0,n);

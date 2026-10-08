export const $=id=>document.getElementById(id);
export const COL={STABLE:'#4fd8ff',APPROACHING:'#ffb547','MOVING AWAY':'#a78bfa',ENTERING:'#4fd8ff',EXITING:'#8a94a6',UNCERTAIN:'#8a94a6'};
export const arrow=t=>{const m=Math.hypot(t.vx,t.vy);if(m<0.03)return'';return'→↘↓↙←↖↑↗'[Math.round(Math.atan2(t.vy,t.vx)/(Math.PI/4)+8)%8]};
export const pad=n=>String(n).padStart(2,'0');
export function renderMap(el,pts,sel,onSel){const seen=new Set();for(const p of pts){let d=el.querySelector('[data-id="'+p.id+'"]');if(!d){d=document.createElement('button');d.className='dot';d.dataset.id=p.id;d.onclick=()=>onSel(p.id);el.appendChild(d)}
d.style.left=p.x*100+'%';d.style.top=p.y*100+'%';d.style.setProperty('--c',COL[p.state]||COL.UNCERTAIN);d.textContent=pad(p.id)+(p.arrow||'');d.classList.toggle('sel',p.id===sel);seen.add(String(p.id))}
el.querySelectorAll('.dot').forEach(d=>{if(!seen.has(d.dataset.id))d.remove()})}
export function fit(cv,vw,vh){cv.width=cv.clientWidth;cv.height=cv.clientHeight;const s=Math.max(cv.width/vw,cv.height/vh);return{s,ox:(cv.width-vw*s)/2,oy:(cv.height-vh*s)/2}}
export function drawBoxes(cv,vw,vh,vis,o){const g=cv.getContext('2d'),f=fit(cv,vw,vh);g.clearRect(0,0,cv.width,cv.height);if(!o.boxes)return f;g.lineWidth=1;g.font='600 10px system-ui';
for(const t of vis){const c=COL[t.state]||COL.UNCERTAIN,x=t.box.x*f.s+f.ox,y=t.box.y*f.s+f.oy,w=t.box.w*f.s,h=t.box.h*f.s;g.strokeStyle=c;g.globalAlpha=t.id===o.sel?1:.75;g.strokeRect(x,y,w,h);
if(o.trails)t.trail?.forEach((p,i,a)=>{g.globalAlpha=(i+1)/a.length*.5;g.fillStyle=c;g.fillRect(p[0]*f.s+f.ox-1.5,p[1]*f.s+f.oy-1.5,3,3)});
g.globalAlpha=1;g.fillStyle=c;const lab=pad(t.id)+arrow(t)+(o.debug?' '+t.cls+' '+Math.round(t.conf*100)+'%':'');g.fillText(lab,x+3,y+11)}return f}
export function hit(f,vis,px,py){return vis.find(t=>{const x=t.box.x*f.s+f.ox,y=t.box.y*f.s+f.oy;return px>=x&&px<=x+t.box.w*f.s&&py>=y&&py<=y+t.box.h*f.s})}
const ev=e=>`<li style="color:${e.type==='APPROACHING'?'#ffb547':e.type==='MOVING_AWAY'?'#a78bfa':'#4fd8ff'}">${new Date(e.wall).toLocaleTimeString([],{hour12:false})} ${e.msg}</li>`;
export function update(S){const c=S.counts;$('c-t').textContent=pad(c.total);$('c-l').textContent=pad(c.LEFT);$('c-c').textContent=pad(c.CENTER);$('c-r').textContent=pad(c.RIGHT);$('c-a').textContent=pad(c.approaching);
$('actbar').style.width=S.act.score+'%';$('actlbl').textContent=S.act.level;$('sumtxt').textContent=S.summary;
const a=S.att;$('atx').innerHTML=a.line1?`${a.title}<br>${a.line1}<br>${a.line2}<br><small>${a.ago}</small>`:a.title;
$('chl').innerHTML=S.chg.length?S.chg.map(e=>`<li>${S.icon[e.type]} ${e.msg}</li>`).join(''):'<li>—</li>';
$('evl').innerHTML=S.events.slice(0,5).map(ev).join('')||'<li>—</li>';
const t=S.sel;$('seltx').innerHTML=t?`<b>VEHICLE ${pad(t.id)}</b> · ${t.cls}<br>${t.region} · ${t.state}<br>confidence ${Math.round(t.conf*100)}%<br>track age ${t.age.toFixed(1)}s<br>size change ${(t.g*100).toFixed(0)}%/s <small>(image-space)</small>`:S.hist?`<b>VEHICLE ${pad(S.hist.id)}</b> · ${S.hist.cls}<br>Seen ${S.hist.seen}s · Entered ${S.hist.entered}<br>Last position ${S.hist.lastRegion} · EXITED`:'Tap a dot or box.';
if(S.mode!=='drive'){const P=S.perf,f=(v,u='',d=0)=>v==null?'n/a':v.toFixed(d)+u,s=P.sess;
$('perftx').innerHTML=`CAMERA ${f(P.fps('cam'),' FPS')}<br>DETECT ${f(P.fps('det'),' FPS',1)}<br>INFERENCE ${f(P.avg('inf'),' ms')}<br>FRAME PROC ${f(P.avg('proc'),' ms')}<br>TRACKER ${f(P.avg('trk'),' ms',2)}<br>DROPPED ${S.dropped??'n/a'}<br>MEMORY ${f(P.mem(),' MB')}<br>BACKEND ${P.backend}`;
$('sestx').innerHTML=`Tracks created ${s.tracks}<br>New entries ${s.entries}<br>Exited frame ${s.exits}<br>Approaching states ${s.ap}<br>Moving-away states ${s.away}<br>Runtime ${P.runtime()}<br>Detection frames ${s.frames}`}}
export const eventsAll=list=>{$('evall').innerHTML=list.map(ev).join('')||'<li>No events yet.</li>'};

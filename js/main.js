import{Detector}from'./detector.js';import{Tracker}from'./tracker.js';import{mapPoint,counts,activity,summary,attention,whatChanged}from'./scene.js';
import{EventLog,ICON}from'./events.js';import{loadSettings,saveSettings,SPEC}from'./settings.js';import{Perf}from'./performance.js';import{Recorder,save,storageLeft}from'./recorder.js';
import{Replay}from'./replay.js';import*as H from'./hud.js';
const{$}=H,ls=localStorage,cfg=loadSettings(ls),perf=new Perf(),log=new EventLog(ls),rp=new Replay(ls),det=new Detector(),tk=new Tracker(cfg);
let rec,sel=null,lastDet=0,hist=null,fitInfo=null,last={vis:[]},replaying=false,stats={},mode='drive';
const vid=$('vid'),cv=$('cv'),setSize=s=>{cfg.size=s;document.body.dataset.size=s;saveSettings(ls,cfg)};setSize(cfg.size);
document.querySelectorAll('#tabs button').forEach(b=>b.onclick=()=>{mode=document.body.dataset.m=b.dataset.m});
document.querySelectorAll('#camsz button').forEach(b=>b.onclick=()=>setSize(b.dataset.s));
$('minbtn').onclick=()=>{$('cam').classList.toggle('min');$('minbtn').textContent=$('cam').classList.contains('min')?'RESTORE':'MINIMIZE'};
$('evbtn').onclick=()=>{H.eventsAll(log.list);$('evpanel').classList.add('on')};$('evclose').onclick=()=>$('evpanel').classList.remove('on');
const sl=$('sliders');for(const[k,l,mn,mx,st]of SPEC){const r=document.createElement('label');r.innerHTML=`<span>${l}</span><b>${cfg[k]}</b><input type="range" min="${mn}" max="${mx}" step="${st}" value="${cfg[k]}">`;const i=r.querySelector('input');i.oninput=()=>{cfg[k]=+i.value;r.querySelector('b').textContent=i.value;Object.assign(tk.p,cfg);saveSettings(ls,cfg)};sl.appendChild(r)}
for(const c in cfg.cats){const l=document.createElement('label');l.innerHTML=`<input type="checkbox" ${cfg.cats[c]?'checked':''}> ${c}`;l.firstChild.onchange=e=>{cfg.cats[c]=e.target.checked?1:0;saveSettings(ls,cfg)};$('cats').appendChild(l)}
for(const k of['boxes','trails','debug']){const e=$('o-'+k);e.checked=cfg[k];e.onchange=()=>{cfg[k]=e.checked;saveSettings(ls,cfg)}}
$('snapbtn').onclick=()=>{const c=document.createElement('canvas');c.width=vid.videoWidth;c.height=vid.videoHeight;const g=c.getContext('2d');g.drawImage(vid,0,0);if(cfg.boxes){g.strokeStyle='#4fd8ff';g.lineWidth=2;last.vis.forEach(t=>g.strokeRect(t.box.x,t.box.y,t.box.w,t.box.h))}g.fillStyle='#fff';g.font='20px system-ui';g.fillText(new Date().toLocaleString()+' · '+last.vis.length+' tracked',12,28);c.toBlob(b=>save(b,'carscout-'+Date.now()+'.png'))};
$('recbtn').onclick=async()=>{if(!rec)return;if(rec.active){rec.stop();$('rec').textContent='';$('recbtn').textContent='REC'}else{rec.start();$('recbtn').textContent='STOP'}};
$('rpbtn').onclick=()=>{replaying=!replaying;rp.persist();$('rpsl').max=Math.max(0,rp.frames.length-1);$('rpsl').value=$('rpsl').max;$('rpbtn').classList.toggle('on',replaying);show()};
$('rpsl').oninput=show;
function show(){if(!replaying){$('rptx').textContent='';return}const f=rp.frames[+$('rpsl').value];if(!f)return;$('rptx').textContent=new Date(f.w).toLocaleTimeString([],{hour12:false})+' · '+f.n+' tracked';H.renderMap($('mapel'),f.p.map(([id,x,y,state])=>({id,x,y,state})),null,()=>{})}
const pick=id=>{sel=id;hist=null;render()};
cv.onclick=e=>{if(!fitInfo)return;const r=cv.getBoundingClientRect(),t=H.hit(fitInfo,last.vis,e.clientX-r.left,e.clientY-r.top);if(t)pick(t.id)};
function render(){if(replaying)return;const now=performance.now()/1000,v=last.vis,W=vid.videoWidth,Hh=vid.videoHeight;
const pts=v.map(t=>({id:t.id,...mapPoint(t,W,Hh),state:t.state,arrow:H.arrow(t)}));H.renderMap($('mapel'),pts,sel,pick);
H.update({counts:counts(v),act:activity(v,log.recent(now),perf.fps('det')),summary:summary(v,log.list.filter(e=>e.type==='NEW'&&now-e.t<=5).length),att:attention(log.list,now),chg:whatChanged(log.list),icon:ICON,events:log.list,sel:v.find(t=>t.id===sel),hist,perf,mode,dropped:vid.getVideoPlaybackQuality?.().droppedVideoFrames});
fitInfo=H.drawBoxes(cv,W,Hh,v,{...cfg,sel})}
async function loop(){const T0=performance.now();if(T0-lastDet>=cfg.interval&&vid.readyState>=2){lastDet=T0;const W=vid.videoWidth,Hh=vid.videoHeight;
let d=[];const i0=performance.now();try{d=det.detect(vid,T0)}catch{}perf.sample('inf',performance.now()-i0);perf.tick('det',T0);perf.sess.frames++;
d=d.filter(x=>x.conf>=cfg.conf&&cfg.cats[(x.cls&&H.COL&&({car:'CAR',truck:'TRUCK',bus:'BUS',motorcycle:'MOTORCYCLE',bicycle:'BICYCLE',person:'PERSON'})[x.cls])||'OTHER']);
const k0=performance.now(),t=T0/1000,r=tk.update(d,t,W,Hh);perf.sample('trk',performance.now()-k0);
for(const x of r.vis){x.trail=x.trail||[];x.trail.push([x.cx,x.cy,t]);while(x.trail.length&&t-x.trail[0][2]>1.5)x.trail.shift()}
const es=log.diff(r.vis,r.born,r.exited,t);perf.sess.tracks+=r.born.length;perf.sess.entries+=r.born.length;perf.sess.exits+=r.exited.length;es.forEach(e=>{if(e.type==='APPROACHING')perf.sess.ap++;if(e.type==='MOVING_AWAY')perf.sess.away++});
if(r.exited.some(x=>x.id===sel))hist=r.exited.find(x=>x.id===sel),sel=null;last=r;rp.push(t,Date.now(),r.vis.map(x=>({id:x.id,...mapPoint(x,W,Hh),state:x.state})));
$('tdet').textContent=(perf.fps('det')||0).toFixed(1);if(rec?.active)$('rec').textContent='REC ● '+rec.elapsed();perf.sample('proc',performance.now()-T0);render()}
requestAnimationFrame(loop)}
$('go').onclick=async()=>{$('err').textContent='';try{const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment',width:{ideal:1280}},audio:false});vid.srcObject=s;
await new Promise(resolve=>{
  if(vid.readyState>=2) resolve();
  else vid.addEventListener('loadedmetadata',resolve,{once:true});
});
await vid.play();
rec=new Recorder(s);
const tick=n=>{perf.tick('cam',performance.now());vid.requestVideoFrameCallback(tick)};if(vid.requestVideoFrameCallback)vid.requestVideoFrameCallback(tick);
$('onb').classList.add('off');await det.init();perf.backend=det.backend;$('tmodel').textContent='MODEL READY';storageLeft().then(x=>{stats.st=x});loop()}catch(e){$('onb').classList.remove('off');$('err').textContent='Could not start: '+e.message;$('tmodel').textContent='MODEL ERROR'}};
addEventListener('pagehide',()=>rp.persist());
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js');

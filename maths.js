/* ================= Maths: UK Year 7 (National Curriculum for England, Key Stage 3) =================
   The question bank (MATHS, MATHS_TOPICS) comes from maths-bank.js, built by tools/build_maths.py.
   Progress lives in book.maths: q (per question), days (the daily 20), log (answered per day). */
const MDAY=20, MTOPIC=10;
/* Year 7 and below only. Checked against the White Rose Maths Year 7 and Year 8 blocks: these kinds of question
   belong to Year 8 or later (ratio and scale, the Cartesian plane, brackets, angles in parallel lines and polygons,
   area of trapezia, the nth term, two-event tables, compound units, error intervals), so they are left out. */
const Y8_PLUS=["Simplify ratios","Divide a quantity in a given ratio","Solve ratio problems","Relate ratios to fractions",
  "Recognise the gradient and intercept of y = mx + c","Work with coordinates on straight-line graphs","Find the midpoint of a line segment","Recognise horizontal and vertical lines",
  "Expand a single bracket","Expand and simplify","Factorise by taking out a common factor","Solve linear equations with the unknown on both sides",
  "Use alternate, corresponding and co-interior angles with parallel lines","Find the sum of interior angles of a polygon","Find interior angles of regular polygons","Find exterior angles of regular polygons",
  "Calculate the area of trapezia","Find the nth term of a linear sequence","Decide whether a number is in a sequence","List outcomes systematically","Calculate expected outcomes",
  "Use compound units such as speed","Use error intervals","Calculate the surface area of cuboids","Calculate the mean from a frequency table"];
for(let i=MATHS.length-1;i>=0;i--)if(Y8_PLUS.includes(MATHS[i].o))MATHS.splice(i,1);
for(let i=MATHS_TOPICS.length-1;i>=0;i--)if(!MATHS.some(q=>q.t===MATHS_TOPICS[i]))MATHS_TOPICS.splice(i,1);
const MQ=Object.fromEntries(MATHS.map(q=>[q.id,q]));
const TI=t=>MATHS_TOPICS.indexOf(t);
const TCOL=["blue","teal","purple","pink","orange","green"];
const topicColor=t=>`var(--c-${TCOL[TI(t)%TCOL.length]})`;
const TOPIC_COUNT={}; MATHS.forEach(q=>TOPIC_COUNT[q.t]=(TOPIC_COUNT[q.t]||0)+1);

/* Daily sets and tests are filed as "y7:<date>" so this site never picks up the other site's sets when
   both children use the same account. Older entries without the prefix still count if their questions are ours. */
const DAYP="y7:";
function dayOf(key){const M=MB();const d=M.days[DAYP+key];if(d)return d;const o=M.days[key];return o&&(o.ids||[]).length&&o.ids.every(id=>MQ[id])?o:null;}
function MB(){const b=B();b.maths=b.maths||{};b.maths.q=b.maths.q||{};b.maths.days=b.maths.days||{};b.maths.log=b.maths.log||{};b.maths.hist=b.maths.hist||{};return b.maths;}
function seedRand(str){let h=2166136261;for(const c of str){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}
  return ()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}

/* Today's 20 follows what the class has covered so far (the units in checkup.js, by date or as a parent set):
   up to 4 questions got wrong before, 8 from the unit taught now, 6 from earlier Year 7 units (never primary-school work)
   and 2 of the school test-paper types (bar charts, averages, Venn diagrams, factors, frequency), made fresh and
   saved with the day so they stay the same on every device. Unseen questions come first. */
/* ---------- 不会的题型 · the types she could not do: taught first the next day, mastered types are skipped ----------
   A type (objective) she got wrong or needed Help with in the last 3 days comes first in the next day's 20:
   a worked example of that type (the teacher shows it on the board; not counted), then 2 of the same type to do herself.
   Types she has mastered (at least 5 answers, 90% right, the last one right) are left out of the new questions. */
const mEx=q=>!!(q&&(q.example||(typeof MS!=="undefined"&&MS&&MS.exIds&&MS.exIds.has(q.id))));
function weakTypes(days=3,date=today()){
  const st=MB().q, from=addDays(date,-days), out={};
  for(const [id,s] of Object.entries(st)){
    if(!s||s.ok!==false||(s.last||"")<from||/^(f:|fl:|uc:|ct:|p:)/.test(id))continue;
    const q=MQ[id]||(id.startsWith("w:")&&s.q?{...s.q,id}:null); if(!q||!q.o)continue;
    const o=out[q.o]=out[q.o]||{o:q.o,t:q.t||"",ids:[],qs:[],last:""}; o.ids.push(id); if(o.qs.length<3)o.qs.push(q.q); if((s.last||"")>o.last)o.last=s.last;
  }
  return Object.values(out).sort((a,b)=>b.ids.length-a.ids.length||(a.last<b.last?1:-1));
}
function masteredTypes(){
  const st=MB().q, by={};
  for(const [id,s] of Object.entries(st)){const q=MQ[id];if(!q||!q.o||!s)continue;const o=by[q.o]=by[q.o]||{n:0,r:0,last:"",ok:true};o.n+=s.n||0;o.r+=s.r||0;if((s.last||"")>=o.last){o.last=s.last||"";o.ok=s.ok!==false;}}
  return new Set(Object.entries(by).filter(([,o])=>o.n>=5&&o.r/o.n>=.9&&o.ok).map(([k])=>k));
}
/* the start of a day's set: per weak type a worked example and 2 to do */
function weakBlock(date,skip){
  const st=MB().q, used=new Set(skip), block=[], ex=[];
  const okQ=q=>!used.has(q.id)&&!(typeof PAPER_TYPES!=="undefined"&&typeof isPrimary==="function"&&isPrimary(q));
  for(const w of weakTypes(3,date).filter(w=>w.last<date).slice(0,4)){
    const pool=MATHS.filter(q=>q.o===w.o&&okQ(q)), fresh=pool.filter(q=>!st[q.id]), seen=pool.filter(q=>st[q.id]&&st[q.id].ok!==false);
    const e=(fresh[0]||seen[0]); if(!e)continue; used.add(e.id); block.push(e.id); ex.push(e.id);
    const own=w.ids.filter(id=>MQ[id]&&!id.startsWith("w:")&&!used.has(id)).slice(0,1); own.forEach(id=>{used.add(id);block.push(id);});
    for(const q of [...fresh.slice(1),...seen.slice(1)]){if(block.length-block.lastIndexOf(e.id)>2)break;if(!used.has(q.id)){used.add(q.id);block.push(q.id);}}
  }
  return {block,ex};
}
/* the questions of the last day with a set (up to 5 days back) that were never answered */
function mCarry(date){
  for(let k=1;k<=5;k++){const d=dayOf(addDays(date,-k)); if(!d||!(d.ids||[]).length)continue;
    return d.ids.filter(id=>!(id in (d.ans||{}))&&MQ[id]&&!/^g/.test(id)).slice(0,12);}
  return [];
}
function dailySet(date,create=true){
  const M=MB(), ex=dayOf(date);
  if(ex&&(ex.ids||[]).length){if(ex.gq)for(const [id,q] of Object.entries(ex.gq))MQ[id]=q;return ex;}
  if(!create)return null;
  const rnd=seedRand((Store.user||"")+"|"+date), st=M.q, used=new Set();
  const mix=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const take=(pool,n)=>{pool=pool.filter(id=>!used.has(id));
    const MT=take.mt||(take.mt=masteredTypes()); pool=pool.filter(id=>!(MQ[id]&&MT.has(MQ[id].o)));
    const fresh=mixKinds(mix(pool.filter(id=>!st[id]&&!SERVED[id]))), older=pool.filter(id=>!fresh.includes(id)).sort((a,b)=>lastSeen(a,st)-lastSeen(b,st));
    const out=[...fresh,...older].slice(0,n); out.forEach(id=>used.add(id)); return out;};
  const retry=Object.entries(st).filter(([id,s])=>MQ[id]&&!(typeof isPrimary==="function"&&isPrimary(MQ[id]))&&!id.startsWith("w:")&&s.ok===false&&(s.last||"")<date).sort((a,b)=>(a[1].last||"")<(b[1].last||"")?-1:1).slice(0,4).map(x=>x[0]);
  // spaced check: a question put right about a week ago comes back once, to see that it has stuck
  retry.push(...Object.entries(st).filter(([id,s])=>MQ[id]&&!id.startsWith("w:")&&s.ok===true&&s.fx&&!s.cf&&dayDiff(s.fx,date)>=6&&!retry.includes(id)).sort((a,b)=>(a[1].fx<b[1].fx?-1:1)).slice(0,2).map(x=>x[0]));
  retry.unshift(...mCarry(date).filter(id=>!retry.includes(id))); // a day missed or not finished: those questions come first today
  retry.forEach(id=>used.add(id));
  let ids=[...retry];
  if(typeof CU_UNITS!=="undefined"){
    const cur=cuCurrent(date).unit, earlier=CU_UNITS.filter(u=>u.from<cur.from).flatMap(u=>u.ids);
    const weak=weakTopics(), wpool=[...cur.ids,...earlier].filter(id=>weak.includes(MQ[id].t)); // topics under 70% right get extra practice
    ids.push(...take(cur.ids,8),...take(wpool,4),...take(earlier.length?earlier:cur.ids,6-Math.min(4,wpool.length)+(wpool.length?0:0))); // Year 7 units only
    var taught=[...cur.ids,...earlier]; // only units already reached fill any gap
  }
  const gq={};
  if(typeof PAPER_TYPES!=="undefined"){const day=Math.floor(pdate(date)/864e5);
    for(let i=0;i<2;i++){const p=PAPER_TYPES[(day*2+i)%PAPER_TYPES.length];let q=null;for(let g=0;g<30&&!q;g++){q=p.gen();if(q&&q.k==="n"&&!Number.isFinite(q.a))q=null;}
      if(q){const id=`gd:${date}:${i}`;gq[id]={...q,id,gen:p.k};MQ[id]=gq[id];ids.push(id);}}}
  if(ids.length<MDAY)ids.push(...take(typeof taught!=="undefined"?taught:MATHS.map(q=>q.id),MDAY-ids.length));
  const WB=weakBlock(date,[]); ids=[...WB.block,...ids.filter(id=>!WB.block.includes(id))].slice(0,MDAY); // 不会的题型 first, with worked examples
  M.days[DAYP+date]={ids,ans:{},u:Date.now(),...(Object.keys(gq).length?{gq}:{}),...(WB.ex.length?{ex:WB.ex}:{})}; Store.save(); markServed(ids.filter(id=>MQ[id]&&!id.startsWith("gd:")));
  return M.days[DAYP+date];
}
// Take one question of each kind in turn, so a set of 10 mixes the kinds instead of repeating one
function mixKinds(ids){
  const g={}; for(const id of ids)(g[MQ[id].o]=g[MQ[id].o]||[]).push(id);
  const ks=shuffle(Object.keys(g)), out=[];
  for(let i=0;out.length<ids.length;i++)for(const k of ks)if(g[k][i])out.push(g[k][i]);
  return out;
}
/* Questions already shown on this device (answered or not), so a new set does not repeat them until the
   topic has run out; then the ones seen longest ago come back first. Wrong answers return at most 3 per set,
   and not on the same day they were last seen. */
const SERVED=(()=>{try{return JSON.parse(localStorage.getItem("m-served")||"{}");}catch(e){return {};}})();
function markServed(ids){const t=Date.now();ids.forEach(id=>{if(MQ[id]&&!String(id).startsWith("g:"))SERVED[id]=t;});try{localStorage.setItem("m-served",JSON.stringify(SERVED));}catch(e){}}
const lastSeen=(id,st)=>Math.max(SERVED[id]||0,(st[id]&&st[id].u)||0);
function topicSet(t){
  const st=MB().q, all=MATHS.filter(q=>q.t===t).map(q=>q.id), now=Date.now();
  const wrong=shuffle(all.filter(id=>st[id]&&st[id].ok===false&&now-lastSeen(id,st)>18*3600e3)).slice(0,3);
  const fresh=mixKinds(shuffle(all.filter(id=>!st[id]&&!SERVED[id])));
  let ids=[...wrong,...fresh].slice(0,MTOPIC);
  if(ids.length<MTOPIC&&typeof reviewTopUp==="function")ids=ids.concat(reviewTopUp(t,MTOPIC-ids.length)); // brush-up: brand-new generated questions
  if(ids.length<MTOPIC){const used=new Set(ids);ids=ids.concat(all.filter(id=>!used.has(id)).sort((a,b)=>lastSeen(a,st)-lastSeen(b,st)).slice(0,MTOPIC-ids.length));}
  markServed(ids);
  return ids;
}
/* ---------- 错题本 · mistakes to practise again ----------
   Every question whose latest answer was wrong: bank questions by id, generated ones (test paper, brush-up,
   formulas, daily paper questions) saved with their text under "w:<id>". Answering one right takes it off. */
function registerMistakes(){const st=MB().q;for(const [k,v] of Object.entries(st))if(k.startsWith("w:")&&v.q&&!MQ[k])MQ[k]={...v.q,id:k};}
function mistakeIds(){
  registerMistakes(); const st=MB().q;
  return Object.entries(st).filter(([id,s])=>s.ok===false&&MQ[id]&&!(typeof isPrimary==="function"&&isPrimary(MQ[id]))&&!/^(p:|f:)/.test(id)).sort((a,b)=>(a[1].u||0)-(b[1].u||0)).map(x=>x[0]);
}
function mistakesCard(){
  const ids=mistakeIds(), byT={}; ids.forEach(id=>{const t=MQ[id].t;byT[t]=(byT[t]||0)+1;});
  return `<div class="card mk-card row" style="justify-content:space-between;gap:14px;flex-wrap:wrap">
    <div class="stack tight" style="gap:4px;flex:1;min-width:240px"><span class="kind-tag" style="--kc:var(--c-red,#d64545)">${ic("x")}错题本 · Mistakes to fix</span>
      <h3 style="margin:0">${ids.length?`${ids.length} question${ids.length>1?"s":""} to try again`:"No mistakes waiting. Brilliant!"}</h3>
      <span class="muted small">${ids.length?Object.entries(byT).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([t,n])=>`${esc(t)} ${n}`).join(" · "):"Questions you get wrong are saved here so you can practise them again."}</span></div>
    ${ids.length?`<button class="btn primary big" data-mistakes style="background:var(--red)">${ic("check")}Practise ${Math.min(10,ids.length)} again</button>`:""}
  </div>`;
}
/* redo the ones just got wrong, straight away, again and again until all are right */
function redoIds(ids){registerMistakes();const st=MB().q;
  return [...new Set(ids.filter(id=>MS.res[id]===false).map(id=>{const q=MQ[id];return q&&q.gen?"w:"+String(id).replace(/^g[a-z]*:/,""):id;}))].filter(id=>MQ[id]&&st[id]&&st[id].ok===false);}
function redoBtn(){const r=redoIds(MS.ids);MS.redo=r;
  if(!r.length)return MS.fix?`<div class="notice" style="text-align:center">${ic("check")} 全部改对了！All fixed. Brilliant!</div>`:"";
  return `<button class="btn primary big" id="mRedo" style="background:var(--red)">${ic("check")}马上重做错题 · Redo the ${r.length} wrong one${r.length>1?"s":""}</button>
    <div class="muted small" style="text-align:center">${MS.fix?"Keep going until every one is right. 直到全部做对为止。":"Fix them now while you remember. 做错的题现在马上重做一遍。"}</div>`;}
function bindRedo(){const b=document.getElementById("mRedo");if(b)b.onclick=()=>{const r=MS.redo.slice(0,10);openMaths({kind:"topic",topic:"错题本 · Mistakes to fix",ids:r,fix:true});};}
function openMistakes(){const ids=mistakeIds().slice(0,10);if(!ids.length)return;openMaths({kind:"topic",topic:"错题本 · Mistakes to fix",ids,fix:true});}
function topicStats(){
  const st=MB().q, out={};
  for(const t of MATHS_TOPICS)out[t]={seen:0,n:0,r:0,total:TOPIC_COUNT[t]};
  for(const [id,s] of Object.entries(st)){const q=MQ[id];if(!q||id.startsWith("w:")||!out[q.t])continue;const o=out[q.t];o.seen++;o.n+=s.n||0;o.r+=s.r||0;}
  return out;
}
/* the weakest topics: answered at least 4 times and under 70% right, weakest first (at most 3) */
function weakTopics(){const ts=topicStats();return Object.entries(ts).filter(([t,s])=>s.n>=4&&s.r/s.n<.7).sort((a,b)=>a[1].r/a[1].n-b[1].r/b[1].n).slice(0,3).map(x=>x[0]);}
const dayScore=d=>{const a=Object.values(d.ans||{});return {done:a.length,right:a.filter(x=>x.ok).length,n:(d.ids||[]).length};};

/* ---------- answers ---------- */
const MINUS=/[−–—]/g;
const mt=s=>fracHtml(esc(s).replace(/(^|[\s(,:])-(\d)/g,"$1−$2"));
const fmtN=n=>(n<0?"−":"")+Math.abs(n).toLocaleString("en-GB",{maximumFractionDigits:3});
function showAns(q){
  if(q.k==="c")return q.c[q.a];
  if(q.k==="n"){if(q.u==="£")return "£"+Math.abs(q.a).toFixed(Number.isInteger(q.a)?0:2);return fmtN(q.a)+(q.u?(/^[°%]/.test(q.u)?"":" ")+q.u:"");}
  return String(q.a).replace(/-/g,"−");
}
function numOf(s){s=String(s).replace(MINUS,"-").replace(/[£,\s]/g,"");return /^-?(\d+\.?\d*|\.\d+)$/.test(s)?parseFloat(s):NaN;}
function frOf(s){s=String(s).trim().replace(/\s+/g," ");let m=s.match(/^(\d+)$/);if(m)return {w:+m[1],n:0,d:1};
  m=s.match(/^(?:(\d+) )?(\d+)\/(\d+)$/);if(!m||+m[3]===0)return null;return {w:m[1]?+m[1]:0,n:+m[2],d:+m[3]};}
const gcd=(a,b)=>b?gcd(b,a%b):a;
function checkAns(q,v){
  v=String(v).trim(); if(!v)return false;
  if(q.k==="n")return Math.abs(numOf(v)-q.a)<1e-9;
  if(q.k==="r")return v.toUpperCase().replace(/\s/g,"")===q.a;
  if(q.k==="t"){
    const nz=s=>String(s).replace(MINUS,"-").replace(/[\s()]/g,"");
    if(/^\d\d:\d\d$/.test(q.a)){const m=v.replace(/[.\s]/g,":").match(/^(\d{1,2}):?(\d\d)$/);return !!m&&`${m[1].padStart(2,"0")}:${m[2]}`===q.a;}
    return nz(v)===nz(q.a);
  }
  if(q.k==="f"){
    if(v.replace(/\s+/g," ")===q.a)return true;
    const a=frOf(q.a), b=frOf(v); if(!a||!b)return false;
    if((a.w*a.d+a.n)*b.d!==(b.w*b.d+b.n)*a.d)return false;
    const kind=f=>f.n===0?"whole":f.w?"mixed":f.n>=f.d?"improper":"proper";
    const loose=k=>k==="mixed"||k==="improper"?"over1":k;
    if(/mixed number|improper/i.test(q.q)?kind(a)!==kind(b):loose(kind(a))!==loose(kind(b)))return false;
    if(b.n&&b.n>=b.d&&b.w)return false;
    const den=q.q.match(/denominator (\d+)/); if(den&&b.d!==+den[1])return false;
    return gcd(b.n,b.d)===1||(!/simplest/i.test(q.q)&&gcd(a.n,a.d)===1);
  }
  return false;
}
function sayMaths(q,btn){readAloud(q.q,btn,mathsSpeech(q));} // the question and its answers to choose from

/* ---------- figures (inline SVG, colours from the page) ---------- */
const P=(cx,cy,r,a)=>[cx+r*Math.cos(a*Math.PI/180),cy-r*Math.sin(a*Math.PI/180)];
function arc(cx,cy,r,a0,a1){const [x0,y0]=P(cx,cy,r,a0),[x1,y1]=P(cx,cy,r,a1);return `M${x0.toFixed(1)} ${y0.toFixed(1)}A${r} ${r} 0 ${a1-a0>180?1:0} 0 ${x1.toFixed(1)} ${y1.toFixed(1)}`;}
function lbl(cx,cy,r,a,t,cls=""){const [x,y]=P(cx,cy,r,a);return `<text x="${x.toFixed(1)}" y="${(y+6).toFixed(1)}" text-anchor="middle" class="${cls}">${t}</text>`;}
function ray(cx,cy,r,a){const [x,y]=P(cx,cy,r,a);return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" class="stroke"/>`;}
function mFig(f){
  if(!f)return "";
  if(String(f.t).startsWith("p-"))return paperFig(f); // test paper figures (paper.js)
  if(f.t==="sh"||f.t==="sh-grid")return shapeFig(f); // shapes and formulas (shapes.js)
  if(f.t==="table")return `<div class="m-table"><table><thead><tr>${f.head.map(h=>`<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${f.rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  let s="", vb="0 0 300 220";
  if(f.t==="fracbar"){
    const W=340/f.n; vb=`0 0 360 64`;
    for(let i=0;i<f.n;i++)s+=`<rect x="${(10+i*W).toFixed(1)}" y="8" width="${(W-3).toFixed(1)}" height="48" rx="6" class="${i<f.k?"fill":"empty"}"/>`;
  }else if(f.t==="angle"){
    const cx=150,cy=110; s=ray(cx,cy,100,0)+ray(cx,cy,100,f.d)+`<path d="${arc(cx,cy,f.d===90?0:30,0,f.d)}" class="arcl"/>`;
    if(f.d===90)s+=`<path d="M${cx+20} ${cy}V${cy-20}H${cx}" class="arcl"/>`;
    s+=lbl(cx,cy,f.d>180?52:58,f.d/2,f.d+"°")+`<circle cx="${cx}" cy="${cy}" r="3.5" class="dotf"/>`;
  }else if(f.t==="line"){
    const cx=150,cy=150; vb="0 0 300 170";
    s=`<line x1="14" y1="${cy}" x2="286" y2="${cy}" class="stroke"/>`+ray(cx,cy,118,f.a)+`<path d="${arc(cx,cy,32,0,f.a)}" class="arcl"/><path d="${arc(cx,cy,24,f.a,180)}" class="arcl q"/>`
      +lbl(cx,cy,62,f.a/2,f.a+"°")+lbl(cx,cy,52,(f.a+180)/2,"?","qt")+`<circle cx="${cx}" cy="${cy}" r="3.5" class="dotf"/>`;
  }else if(f.t==="point"){
    const cx=150,cy=110,a=f.a,b=f.b;
    s=ray(cx,cy,100,0)+ray(cx,cy,100,a)+ray(cx,cy,100,a+b)+`<path d="${arc(cx,cy,30,0,a)}" class="arcl"/><path d="${arc(cx,cy,36,a,a+b)}" class="arcl"/><path d="${arc(cx,cy,24,a+b,360)}" class="arcl q"/>`
      +lbl(cx,cy,62,a/2,a+"°")+lbl(cx,cy,66,a+b/2,b+"°")+lbl(cx,cy,52,(a+b+360)/2,"?","qt")+`<circle cx="${cx}" cy="${cy}" r="3.5" class="dotf"/>`;
  }else if(f.t==="tri"){
    // triangle with two known angles at the base and the unknown at the top
    const A=[40,190], k=220, a=f.a*Math.PI/180, b=f.b*Math.PI/180;
    const t=k*Math.sin(b)/Math.sin(a+b), C=[A[0]+t*Math.cos(a),A[1]-t*Math.sin(a)], Bp=[A[0]+k,A[1]];
    const sc=Math.min(1,170/(A[1]-C[1])), P2=p=>[150+(p[0]-150)*sc,190-(190-p[1])*sc], [a1,b1,c1]=[A,Bp,C].map(P2);
    s=`<path d="M${a1}L${b1}L${c1}Z" class="shape"/>`+lbl(a1[0],a1[1],34,f.a/2,f.a+"°")+lbl(b1[0],b1[1],34,180-f.b/2,f.b+"°")+lbl(c1[0],c1[1],30,270-(f.b-f.a)/2,"?","qt");
  }else if(f.t==="para"){
    // two parallel lines cut by a transversal; the known angle and x
    vb="0 0 300 200"; const ang=f.a, y1=60, y2=150, dx=(y2-y1)/Math.tan(ang*Math.PI/180), x1=150-dx/2, x2=150+dx/2;
    s=`<line x1="20" y1="${y1}" x2="280" y2="${y1}" class="stroke"/><line x1="20" y1="${y2}" x2="280" y2="${y2}" class="stroke"/>`
      +(()=>{const ex=50/Math.tan(ang*Math.PI/180);return `<line x1="${x2+ex}" y1="${y1-50}" x2="${x1-ex}" y2="${y2+50}" class="stroke"/>`;})()
      +`<path d="M262 ${y1}l-8 -5v10z M262 ${y2}l-8 -5v10z" class="dotf"/>`;
    // known angle: at the top crossing, below the line and left of the transversal (an interior angle)
    s+=`<path d="${arc(x2,y1,22,180,180+ang)}" class="arcl"/>`+lbl(x2,y1,44,180+ang/2,ang+"°");
    const sp={corr:[x1,y2,180,180+ang],alt:[x1,y2,0,ang],coint:[x1,y2,ang,180]}[f.k];
    s+=`<path d="${arc(sp[0],sp[1],22,sp[2],sp[3])}" class="arcl q"/>`+lbl(sp[0],sp[1],44,(sp[2]+sp[3])/2,"x","qt");
  }else if(f.t==="shape"){
    vb="0 0 300 220"; const u=f.u||"cm", B=200, H=120, x0=50, y0=160;
    if(f.k==="tri")s=`<path d="M${x0} ${y0}H${x0+B}L${x0+B*.62} ${y0-H}Z" class="shape"/><line x1="${x0+B*.62}" y1="${y0-H}" x2="${x0+B*.62}" y2="${y0}" class="cut"/>`;
    else if(f.k==="par")s=`<path d="M${x0} ${y0}H${x0+B-40}L${x0+B} ${y0-H}H${x0+40}Z" class="shape"/><line x1="${x0+40}" y1="${y0-H}" x2="${x0+40}" y2="${y0}" class="cut"/>`;
    else{const top=B*Math.max(.25,f.a/f.b);s=`<path d="M${x0} ${y0}H${x0+B}L${x0+B/2+top/2} ${y0-H}H${x0+B/2-top/2}Z" class="shape"/><line x1="${x0+B/2-top/2}" y1="${y0-H}" x2="${x0+B/2-top/2}" y2="${y0}" class="cut"/>
      <text x="${x0+B/2}" y="${y0-H-8}" text-anchor="middle">${f.a} ${u}</text>`;}
    const hx=f.k==="tri"?x0+B*.62:f.k==="par"?x0+40:x0+B/2-B*Math.max(.25,f.a/f.b)/2;
    s+=`<text x="${(f.k==="par"?x0+(B-40)/2:x0+B/2)}" y="${y0+24}" text-anchor="middle">${f.b} ${u}</text><text x="${hx+6}" y="${y0-H/2+5}" class="cutl">${f.h} ${u}</text>`;
  }else if(f.t==="cuboid"){
    vb="0 0 300 220"; const k=Math.min(150/(f.l+f.w*.5),120/(f.h+f.w*.5)), L=f.l*k, Hh=f.h*k, D=f.w*k*.5, x=(300-L-D)/2, y=200-14-Hh;
    s=`<path d="M${x} ${y}h${L}v${Hh}h${-L}Z" class="shape"/><path d="M${x} ${y}l${D} ${-D}h${L}l${-D} ${D}Z M${x+L} ${y}l${D} ${-D}v${Hh}l${-D} ${D}Z" class="shape side"/>`
      +`<text x="${x+L/2}" y="${y+Hh+20}" text-anchor="middle">${f.l} cm</text><text x="${x-8}" y="${y+Hh/2+5}" text-anchor="end">${f.h} cm</text><text x="${x+L+D/2+8}" y="${y+Hh-D/2+5}">${f.w} cm</text>`;
  }else if(f.t==="rect"||f.t==="lshape"){
    const W=f.t==="rect"?f.a:f.W, H=f.t==="rect"?f.b:f.H, k=Math.min(210/W,140/H), w=W*k, h=H*k, x=(300-w)/2+6, y=(200-h)/2+4, u=f.u||"cm";
    if(f.t==="rect")s=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" class="shape"/>`;
    else{const cw=f.w*k, ch=f.h*k;
      s=`<rect x="${x+w-cw}" y="${y}" width="${cw}" height="${ch}" class="cut"/><path d="M${x} ${y}H${x+w-cw}V${y+ch}H${x+w}V${y+h}H${x}Z" class="shape"/>`
        +`<text x="${x+w-cw/2}" y="${y-8}" text-anchor="middle" class="cutl">${f.w} ${u}</text><text x="${x+w+8}" y="${y+ch/2+5}" class="cutl">${f.h} ${u}</text>`;}
    s+=`<text x="${x+w/2}" y="${y+h+24}" text-anchor="middle">${W} ${u}</text><text x="${x-8}" y="${y+h/2+5}" text-anchor="end">${H} ${u}</text>`;
    vb="0 0 300 235";
  }else if(f.t==="bar"||f.t==="lgraph"){
    const vals=f.values, lo=Math.min(0,...vals), hi=Math.max(...vals), step=hi-lo>10?2:1, top=Math.ceil((hi+1)/step)*step, bot=Math.floor(lo/step)*step;
    const L=40,R=340,T=30,Bm=190, Y=v=>Bm-(v-bot)/(top-bot)*(Bm-T), n=vals.length, bw=(R-L)/n;
    vb="0 0 350 222";
    for(let v=bot;v<=top;v+=step)s+=`<line x1="${L}" x2="${R}" y1="${Y(v)}" y2="${Y(v)}" class="${v===0?"axis":"grid"}"/>`+`<text x="${L-6}" y="${Y(v)+4}" text-anchor="end" class="tick">${v<0?"−"+(-v):v}</text>`;
    if(f.t==="bar")vals.forEach((v,i)=>{const x=L+i*bw+bw*.22, wd=bw*.56, y=Y(v);s+=`<path d="M${x} ${Y(0)}V${y+4}Q${x} ${y} ${x+4} ${y}H${x+wd-4}Q${x+wd} ${y} ${x+wd} ${y+4}V${Y(0)}Z" class="bar"/>`;});
    else{const pts=vals.map((v,i)=>[L+i*bw+bw/2,Y(v)]);s+=`<polyline points="${pts.map(p=>p.join(",")).join(" ")}" class="gline"/>`+pts.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="4.5" class="gdot"/>`).join("");}
    f.labels.forEach((l,i)=>s+=`<text x="${L+i*bw+bw/2}" y="${Bm+20}" text-anchor="middle" class="tick">${esc(l)}</text>`);
    s=`<text x="${L}" y="16" class="ttl">${esc(f.title)}</text>`+s;
  }
  return `<svg class="m-fig ${f.t}" viewBox="${vb}" role="img" aria-label="Diagram">${s}</svg>`;
}

/* ---------- Maths tab ---------- */
// "Brush up" topics (primes, factors, rounding, place value, numbers in words, fractions) come from maths-review.js
const REVIEW_SET=typeof REVIEW_TOPICS!=="undefined"?REVIEW_TOPICS:[];
const topicTile=(t,s)=>`<button class="topic" data-maths="topic" data-topic="${esc(t)}" style="--tc:${topicColor(t)}">
      <b>${esc(t)}</b><span class="muted small">${s.n?`${Math.round(s.r/s.n*100)}% correct · `:""}${s.seen} of ${s.total} done</span>
      <span class="bar"><i style="width:${s.seen/s.total*100}%"></i></span></button>`;
function mathsCard(){
  const t=today(), d=dailySet(t,false), sc=d?dayScore(d):{done:0,right:0,n:MDAY}, p=Math.round(sc.done/sc.n*100);
  return `<div class="card maths-card">
    <div class="badge lg teal">${ic("maths")}</div>
    <div class="grow stack tight" style="gap:4px"><span class="kind-tag teal">${ic("maths")}Daily maths · Year 7</span><h3 style="margin:0">Today’s ${MDAY} questions</h3>
      <div class="muted small">${sc.done===0?"Number, algebra, ratio, geometry and more":sc.done<sc.n?`${sc.done} of ${sc.n} answered`:`Finished: ${sc.right} out of ${sc.n} correct`}</div></div>
    <div class="ring" style="--p:${p}"><span>${sc.done}/${sc.n}</span></div>
    <button class="btn primary" data-maths="day">${sc.done===0?"Start":sc.done<sc.n?"Continue":"See results"}</button>
  </div>`;
}
function viewMaths(){
  const t=today(), d=dailySet(t), sc=dayScore(d), M=MB(), ts=topicStats();
  const week=[...Array(7)].map((_,k)=>addDays(t,k-6));
  const dl=Object.entries(M.log).filter(([k])=>/^\d{4}-/.test(k)).map(x=>x[1]), total=dl.reduce((s,x)=>s+(x.n||0),0), right=dl.reduce((s,x)=>s+(x.r||0),0);
  const seen=Object.keys(M.q).filter(id=>MQ[id]).length; // only bank questions (not "p:" test-paper summaries)
  return `<div class="stack">
    <div class="page-head"><div><div class="eyebrow">Maths · Year 7</div><h1>Daily maths</h1></div></div>
    <div class="card maths-hero">
      <div class="stack" style="gap:12px">
        <div class="muted">${MDAY} questions every day that follow your class: now <b>${esc(typeof cuCurrent==="function"?cuCurrent().unit.name:"Year 7")}</b>, plus earlier units, your school test-paper question types and brush-up skills. Questions you got wrong come back. You get two tries.</div>
        <div class="row" style="gap:14px">${week.map(w=>{const x=dayOf(w),s=x?dayScore(x):null;return `<div class="wk"><div class="ring" style="--p:${s?s.done/s.n*100:0}"><span>${s&&s.done?s.right:""}</span></div><div class="muted">${w===t?"Today":WEEK[pdate(w).getDay()]}</div></div>`;}).join("")}</div>
        <div class="row"><button class="btn primary big" data-maths="day">${ic("maths")}${sc.done===0?"Start today’s 20":sc.done<sc.n?`Continue · ${sc.n-sc.done} left`:"See today’s results"}</button>
          ${sc.done===sc.n?`<span class="muted">${sc.right}/${sc.n} correct today</span>`:""}</div>
      </div>
      <div class="hero-num"><b>${sc.done}<small>/${sc.n}</small></b><span class="muted small">answered today</span></div>
    </div>
    <div class="kpis">
      <div class="kpi"><b>${total}</b><span>questions answered</span></div>
      <div class="kpi"><b>${total?Math.round(right/total*100)+"%":"–"}</b><span>correct</span></div>
      <div class="kpi"><b>${seen}<small>/${MATHS.length}</small></b><span>of the question bank</span></div>
    </div>
    ${checkupCard()}
    ${typeof paperDailyCard==="function"?paperDailyCard():""}
    ${mistakesCard()}
    ${REVIEW_SET.length?`<div class="section-title"><h3 style="margin:0">Fractional thinking</h3><span class="muted small">Year 7 fraction calculations · ${MTOPIC} questions at a time</span></div>
    <div class="topics">${REVIEW_SET.map(t=>topicTile(t,ts[t])).join("")}</div>`:""}
    ${shapesEntry()}
    ${paperSection()}
    <div class="section-title"><h3 style="margin:0">Practise a Year 7 topic</h3><span class="muted small">${MTOPIC} questions at a time</span></div>
    <div class="topics">${MATHS_TOPICS.filter(t=>!REVIEW_SET.includes(t)).map(t=>topicTile(t,ts[t])).join("")}</div>
  </div>`;
}
function bindMaths(){
  document.querySelectorAll("#view [data-mistakes]").forEach(b=>b.onclick=openMistakes);
  bindPaper();
  document.querySelectorAll("#view [data-cu]").forEach(b=>b.onclick=()=>openCheckup());
  document.querySelectorAll("#view [data-shapes]").forEach(b=>b.onclick=()=>openShapes());
  document.querySelectorAll("#view [data-maths]").forEach(b=>b.onclick=()=>{
    if(b.dataset.maths==="day"){const d=dailySet(today());openMaths({kind:"day",date:today(),ids:d.ids});}
    else openMaths({kind:"topic",topic:b.dataset.topic,ids:topicSet(b.dataset.topic)});
  });
}

/* ---------- the question screen ---------- */
let MS=null;
function openMaths(o){
  MS={...o,i:0,tries:0,input:"",state:"ask",res:{},wrongPick:[]};
  if(o.kind==="day"){const d=dayOf(o.date);MS.exIds=new Set((d&&d.ex)||[]);} // worked examples at the start of the day (not counted)
  if(o.kind==="day"||o.kind==="test"){const d=dayOf(o.kind==="test"?o.key:o.date);Object.entries(d.ans||{}).forEach(([id,a])=>MS.res[id]=a.ok);
    const first=o.ids.findIndex(id=>!(id in d.ans)); MS.i=first<0?o.ids.length:first;}
  window.__busy=true; $("#maths").hidden=false; document.body.style.overflow="hidden";
  $("#mLabel").textContent=o.kind==="day"?`Daily maths · ${shortDate(o.date)}`:o.kind==="test"?`Daily maths test · ${shortDate(o.date)}`:o.topic;
  renderMQ();
}
function closeMaths(){MS=null;window.__busy=false;$("#maths").hidden=true;document.body.style.overflow="";Store.save();render();}
function keysFor(q){
  const D=["7","8","9","4","5","6","1","2","3"];
  if(q.k==="r")return ["I","V","X","L","C","D","M","⌫"];
  if(q.k==="f")return [...D,"space","0","/","⌫"];
  if(q.k==="t")return /:/.test(q.a)?[...D,":","0","⌫"]:[...D,"−","0",",","⌫"];
  return [...D,"−","0",".","⌫"];
}
function renderMQ(){
  const body=$("#mBody"), n=MS.ids.length;
  if(MS.t0i!==MS.i){MS.t0i=MS.i;MS.t0=Date.now();}
  $("#mProg").style.width=(Math.min(MS.i,n)/n*100)+"%";
  if(MS.i>=n){renderMResults();return;}
  const q=MQ[MS.ids[MS.i]], st=MS.state, done=st==="right"||st==="shown";
  $("#maths").style.setProperty("--tc",topicColor(q.t));
  if(typeof lessonGate==="function"&&lessonGate(q,body))return; // a type she often gets wrong: the cartoon lesson first (lessons.js)
  const unit=q.u&&q.k==="n"?q.u:"", pre=unit==="£"?"£":"", post=unit&&unit!=="£"?unit:"";
  body.innerHTML=`<div class="m-q">
    <div class="row" style="justify-content:space-between"><span class="kind-tag" style="--kc:${topicColor(q.t)}">${esc(q.t)}${mEx(q)?" · 例题 Example":""}</span><span class="muted small">Question ${MS.i+1} of ${n}</span></div>
    <div class="m-text">${mt(q.q)} <span class="m-tools"><button class="icon-btn sm" id="mSay" aria-label="Read the question">${ic("speaker")}</button>${zhBtnHtml()}</span></div>${zhLine(q.q,"q")}
    ${mFig(q.f)}
    ${q.k==="c"?`<div class="m-opts">${q.c.map((c,i)=>`<button class="opt-btn m-opt ${done&&i===q.a?"right":""} ${MS.wrongPick.includes(i)?"wrong":""}" data-opt="${i}" ${done||MS.wrongPick.includes(i)?"disabled":""}>${fracHtml(esc(c))}${zhLine(c,"opt")}</button>`).join("")}</div>`
    :`<div class="m-answer ${st}"><span class="pre">${pre}</span><span class="val">${(q.k==="f"?fracHtml:x=>x)(esc(q.k==="n"?MS.input.replace(/^(−?)(\d{4,})/,(m,s,d)=>s+(+d).toLocaleString("en-GB")):MS.input))}${done?"":`<i class="caret"></i>`}</span><span class="post">${esc(post)}</span></div>
      ${done?"":`<div class="keypad ${q.k}">${keysFor(q).map(k=>`<button data-key="${k}" class="${k==="⌫"?"del":k==="space"?"sp":""}">${k==="⌫"?ic("back"):k==="space"?"space":k}</button>`).join("")}</div>
      <button class="btn primary big" id="mCheck" ${MS.input.trim()&&!(MS.wait&&Date.now()<MS.wait)?"":"disabled"}>${MS.kind==="test"?(MS.i+1<n?"Next":"Finish"):"Check"}</button>`}`}
    <div class="m-feedback">${feedback(q)}</div>
    ${typeof teachBtnHtml==="function"?teachBtnHtml(q):""}
  </div>`;
  $("#mSay").onclick=()=>sayMaths(q,$("#mSay"));
  $("#mZh").onclick=()=>{zhToggle();renderMQ();};
  bindExplain(body,renderMQ); if(typeof bindTeach==="function")bindTeach(body,q);
  zhFill(body);
  body.querySelectorAll("[data-opt]").forEach(b=>b.onclick=()=>answer(q,+b.dataset.opt));
  body.querySelectorAll("[data-key]").forEach(b=>b.onclick=()=>press(b.dataset.key));
  const c=$("#mCheck"); if(c)c.onclick=()=>answer(q,MS.input);
  const nx=$("#mNext"); if(nx){nx.onclick=nextQ;nx.focus({preventScroll:true});}
}
function feedback(q){
  const st=MS.state, nx=`<button class="btn primary big" id="mNext">${MS.i+1<MS.ids.length?"Next question":"See results"}</button>`;
  if(st==="retry")return `<div class="mfb warn">${ic("x")}<div><b>Not quite. Have another go.</b><span>Stuck? Tap 答疑 for help, one step at a time.</span></div></div>${explainBox(q,false)}`;
  if(st==="right"&&mEx(q))return `<div class="mfb ok">${ic("check")}<div><b>That was the example. Now try ones like it by yourself! 例题做完了，下面的同类题自己做！</b><span>${mt(q.w||"")}</span></div></div>`;
  if(st==="right"&&MS.helped&&MS.helped[q.id])return `<div class="mfb warn">${ic("check")}<div><b>Right, well done! But you used Help, so this one does not count yet.</b><span>A similar question comes next: try it by yourself. 答对了！不过用了帮助，这题先不算分。下一题是类似的，自己试试！</span></div></div>`;
  if(st==="right")return `<div class="mfb ok">${ic("check")}<div><b>${MS.tries>1?"Correct on your second try!":"Correct!"}</b><span>${mt(q.w)}</span></div></div>${explainBox(q,true)}${nx}`;
  if(st==="shown")return `<div class="mfb bad">${ic("x")}<div><b>The answer is ${fracHtml(esc(showAns(q)))}</b><span>Here is how to work it out, step by step:</span></div></div>${explainBox(q,true)}${nx}`;
  return MS.kind==="test"?"":explainBox(q,false); // before answering: help with the method only (not in a check-up)
}
function press(k){
  if(!MS||MS.state==="right"||MS.state==="shown")return;
  const q=MQ[MS.ids[MS.i]];
  if(k==="⌫")MS.input=MS.input.slice(0,-1);
  else if(MS.input.length<14){
    if(k==="space")k=" ";
    if(k==="−"&&q.k==="n"&&MS.input)return;
    MS.input+=k;
  }
  if(MS.state==="retry")MS.state="ask2";
  renderMQ();
}
/* A wild guess (keys tapped at random, e.g. 3333 or 55255, or a wrong number typed within 4 seconds) is not
   accepted: the child is asked to work it out, the first steps are shown, and Check waits a few seconds.
   Guesses are counted per day in book.maths.log["gs:<date>"] for the parent page. */
function looksLikeGuess(q,v){
  if(q.k==="c")return false; const d=String(v).replace(/[^\d]/g,""), a=String(q.a).replace(/[^\d]/g,"");
  if(/^(\d)\1{2,}$/.test(d)&&!/^(\d)\1{2,}$/.test(a))return true;            // 222, 3333
  if(/(\d\d)\1/.test(d)&&d.length>=4&&!a.includes(d.slice(0,2)))return true;   // 5252…
  if(Date.now()-(MS.t0||0)<4000&&String(v).length>0)return true;                  // no time to think
  if(q.k==="n"&&a.length>=3&&d.length&&(d.length<=a.length-3||d.length>=a.length+3))return true; // far too short or long
  return false;
}
function answer(q,v){
  const ok=q.k==="c"?v===q.a:checkAns(q,v);
  if(!ok&&looksLikeGuess(q,v)){
    const M=MB(),t=today(),G=M.log["gs:"+t]=M.log["gs:"+t]||{n:0};G.n++;G.u=Date.now();Store.save();
    if(typeof beep==="function")beep(false); MS.input=""; MS.exp=Math.max(MS.exp||0,1); MS.wait=Date.now()+6000;
    if(typeof toast==="function")toast("That looks like a guess. Work it out first: use paper or tap “Stuck?”. 这像是乱猜的，请先算一算。");
    renderMQ(); setTimeout(()=>{if(MS&&MS.wait&&Date.now()>=MS.wait){MS.wait=0;renderMQ();}},6100); return;
  }
  if(MS.kind==="test"){MS.tries=1;record(q,ok,q.k==="c"?q.c[v]:v);nextQ();return;} // a test: one try, marks only at the end
  MS.tries++;
  if(ok){MS.state="right";MS.exp=0;beep(true,false);}
  else if(MS.tries<2){MS.state="retry";beep(false);if(q.k==="c")MS.wrongPick.push(v);else MS.input="";renderMQ();return;}
  else{MS.state="shown";MS.exp=99;beep(false);if(q.k==="c")MS.wrongPick.push(v);}
  record(q,ok,q.k==="c"?q.c[v]:v);
  if(typeof teachTwin==="function")teachTwin(q); // used Help: a similar question comes next
  renderMQ();
}
function record(q,ok,given){
  const hp=!!(MS.helped&&MS.helped[q.id])||!!mEx(q), real=ok; if(hp&&!mEx(q))ok=false; // a worked example is not counted either // answered with Help: not counted as right, and it comes back later
  const M=MB(), t=today(), key=q.gen?"p:"+q.gen:q.id, s=M.q[key]||{}; // generated questions keep one record per type
  M.q[key]={n:(s.n||0)+1,r:(s.r||0)+(ok?1:0),ok,last:t,u:Date.now(),...(s.q?{q:s.q}:{}),
    ...(s.wr||!ok?{wr:1}:{}),...(ok&&s.ok===false?{fx:t}:s.fx?{fx:s.fx}:{}),...(s.cf?{cf:s.cf}:ok&&s.fx&&dayDiff(s.fx,t)>=6?{cf:t}:{})}; // wr: once wrong, fx: the day it was put right, cf: still right a week later (spaced check)
  if(q.gen&&!ok){const {id,gen,...keep}=q;M.q["w:"+String(q.id).replace(/^g[a-z]*:/,"")]={n:1,r:0,ok:false,last:t,u:Date.now(),q:{...keep,pg:gen}};} // generated question got wrong: keep it for the mistakes list
  if(!hp){const L=M.log[t]=M.log[t]||{n:0,r:0}; L.n++; if(ok)L.r++;}
  if(q.gen&&!hp){const g=q.gen.startsWith("fm-")?"fm":q.gen.startsWith("rv-")?"rv":"pp",G=M.log[g+":"+t]=M.log[g+":"+t]||{n:0,r:0};G.n++;if(ok)G.r++;G.u=Date.now();} // per-day counts for formulas, brush-up and test paper (must.js)
  if(MS.kind==="day"&&(dayOf(MS.date).ids||[]).includes(q.id)){const d=dayOf(MS.date);d.ans[q.id]={v:String(given).slice(0,20),ok,tries:MS.tries};d.u=Date.now();}
  if(MS.kind==="test"){const d=dayOf(MS.key);d.ans[q.id]={v:String(given).slice(0,20),ok};d.u=Date.now();}
  if(MS.fix){const F=M.log["fx:"+t]=M.log["fx:"+t]||{n:0,r:0};F.n++;if(ok)F.r++;F.left=mistakeIds().length;F.start=Math.max(F.start||0,F.left+(ok?1:0));F.u=Date.now();} // 错题重做 progress (must.js)
  // every answer of the day, for the parent page: the question, the child's answer, the right answer
  try{const H=M.hist[t]=M.hist[t]||[],n=new Date();if(H.length<400)H.push({...(MS.helped&&MS.helped[q.id]?{h:1}:{}),q:String(q.q||"").slice(0,240),a:String(showAns(q)).slice(0,40),v:String(given==null?"":given).slice(0,40),ok:real,t:String(q.t||"").slice(0,40),...(ok?{}:{w:String(q.w||(q.steps||[]).join(" ")||"").slice(0,320)}),
    s:MS.kind==="day"?"Daily 20":MS.kind==="test"?"Test":MS.fix?"Fix mistakes":String(MS.topic||"Practice").slice(0,40),tr:MS.tries||1,f:q.fig?1:0,tm:String(n.getHours()).padStart(2,"0")+":"+String(n.getMinutes()).padStart(2,"0")});}catch(e){}
  if(MS.ppDay){const d=dayOf(MS.ppDay);if(d&&(d.ids||[]).includes(q.id)){d.ans[q.id]={v:String(given).slice(0,20),ok,tries:MS.tries};d.u=Date.now();}} // 每日试卷题 progress
  MS.res[q.id]=ok; Store.save();
}
function nextQ(){MS.i++;MS.exp=0;MS.tries=0;MS.input="";MS.state="ask";MS.wrongPick=[];renderMQ();window.scrollTo(0,0);$("#mBody").scrollTop=0;}
function renderMResults(){
  if(MS.kind==="test"){renderCheckupReport();return;}
  const ids=MS.ids, right=ids.filter(id=>MS.res[id]).length, n=ids.length, pct=right/n;
  const stars=pct>=.9?3:pct>=.7?2:pct>=.4?1:0;
  if(!MS.cheered){MS.cheered=true;beep(true,true);}
  $("#mBody").innerHTML=`<div class="m-q m-results">
    <div class="stars">${"★".repeat(stars)}${"☆".repeat(3-stars)}</div>
    <h2>${right} out of ${n} correct</h2>
    <p class="muted">${pct>=.9?"Superb work!":pct>=.7?"Great effort. Check the ones you missed below.":pct>=.4?"Good try. Read through the working for the ones you missed.":"Keep going. Every question you try helps you learn."}${MS.kind==="day"?" Wrong ones are saved in 错题本 to fix.":""}</p>
    <div class="group">${ids.map(id=>{const q=MQ[id],ok=MS.res[id];return `<div class="cell m-row"><div class="badge ${ok?"green":"red"}">${ic(ok?"check":"x")}</div><div class="grow"><div class="ttl">${mt(q.q)}</div>${ok?"":`<div class="sub">Answer: <b>${fracHtml(esc(showAns(q)))}</b></div>`}${resultSteps(q)}</div></div>`;}).join("")}</div>
    ${redoBtn()}
    <button class="btn ${MS.redo.length?"":"primary "}big" id="mDone">Done</button>
  </div>`;
  $("#mDone").onclick=closeMaths; bindRedo();
  zhFill($("#mBody"));
}
document.addEventListener("keydown",e=>{
  if(!MS||$("#maths").hidden||e.metaKey||e.ctrlKey)return;
  const q=MQ[MS.ids[MS.i]]; if(!q)return;
  if(e.key==="Enter"){const b=$("#mNext")||$("#mCheck");if(b&&!b.disabled)b.click();e.preventDefault();return;}
  if(e.key==="Escape"){closeMaths();return;}
  if(q.k==="c"){const i=+e.key-1;if(i>=0&&i<q.c.length){const b=document.querySelector(`[data-opt="${i}"]`);if(b&&!b.disabled)b.click();}return;}
  let k=e.key;
  if(k==="Backspace")k="⌫"; else if(k==="-")k="−"; else if(k===" ")k="space"; else if(q.k==="r")k=k.toUpperCase();
  if(keysFor(q).includes(k)||(q.k==="t"&&/^[\d:,−]$/.test(k))){press(k);e.preventDefault();}
});

/* ---------- 每天做题记录 · every question of a day, for the parent page ----------
   From M.hist (saved since this was added); for older days, rebuilt from the daily 20 and the daily test. */
function histOf(date){
  const M=MB(); if((M.hist[date]||[]).length)return M.hist[date];
  const out=[], add=(d,src)=>{if(!d)return;for(const id of d.ids||[]){const a=(d.ans||{})[id],q=MQ[id];if(!a||!q)continue;
    out.push({q:String(q.q||""),a:String(showAns(q)),v:String(a.v==null?"":a.v),ok:!!a.ok,s:src,tr:a.tries||1,f:q.fig?1:0,tm:""});}};
  add(typeof dailySet==="function"?dailySet(date,false):dayOf(date),"Daily 20");
  if(typeof cuGet==="function")add(cuGet(date),"Test");
  return out;
}
let HIST_DAY=null, HIST_BAD=false, HIST_MON=null;
const H_FULL=60; // days with every answer kept; older days keep only the wrong answers (core.js)
const hMins=d=>Math.round(Object.values((B().time||{})[d]||{}).reduce((s,x)=>s+x,0)/60);
/* a month calendar: every day with its minutes and maths %, tap a day to see everything done that day */
function histCal(sel){
  const t=today(), m=HIST_MON||sel.slice(0,7), first=pdate(m+"-01"), y=first.getFullYear(), mo=first.getMonth(), nd=new Date(y,mo+1,0).getDate(), lead=(first.getDay()+6)%7;
  const ML=(MB().log)||{}, cells=[];
  for(let i=0;i<lead;i++)cells.push(`<span class="hc-e"></span>`);
  for(let k=1;k<=nd;k++){const d=`${m}-${String(k).padStart(2,"0")}`, mi=hMins(d), L=ML[d]||{}, di=((B().eng||{}).diary||{})[d], fut=d>t;
    const lv=fut?"fut":mi>=45?"h3":mi>=20?"h2":mi>0||L.n?"h1":"h0";
    cells.push(`<button class="hc-d ${lv} ${d===sel?"on":""} ${d===t?"today":""}" data-hday="${d}" ${fut?"disabled":""}><b>${k}</b>${!fut&&(mi||L.n)?`<small>${mi?mi+"′":""}${L.n?` ${Math.round((L.r||0)/L.n*100)}%`:""}</small>`:""}${di&&di.done?`<i class="hc-w" title="writing">✎</i>`:""}</button>`);}
  const prevM=dstr(new Date(y,mo-1,1)).slice(0,7), nextM=dstr(new Date(y,mo+1,1)).slice(0,7);
  return `<div class="hcal"><div class="hcal-h"><button class="icon-btn sm" data-hmon="${prevM}" aria-label="Previous month">‹</button><b>${first.toLocaleDateString("en-GB",{month:"long",year:"numeric"})}</b><button class="icon-btn sm" data-hmon="${nextM}" ${nextM>t.slice(0,7)?"disabled":""} aria-label="Next month">›</button></div>
    <div class="hcal-g">${["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(w=>`<span class="hc-wd">${w}</span>`).join("")}${cells.join("")}</div>
    <div class="muted tiny">颜色越深学得越久 · 每格：分钟 和 数学正确率 · ✎ = 交了作文/日记</div></div>`;
}
/* everything else done on a day (not only maths) */
function histDay(d){
  const b=B(), E=b.eng||{}, M=MB(), out=[], T=(b.time||{})[d]||{};
  const secs=Object.entries(T).filter(([,s])=>s>=30).sort((x,y)=>y[1]-x[1]);
  if(typeof mustCfg==="function"){try{const items=mustCfg().items, st=items.map(k=>({k,...mustStatus(k,d)})), dn=st.filter(x=>x.done).length;
    out.push(`<div><b>今日必做 Must-do</b> <span class="muted small">${dn}/${st.length} done · ${hMins(d)} min</span><div class="hd-must">${st.map(x=>`<span class="${x.done?"ok":x.p>0?"part":""}" title="${esc(x.sub)}">${x.done?"✓":x.p>0?Math.round(x.p*100)+"%":"–"} ${esc(typeof mustTitle==="function"?mustTitle(x.k):x.k)}</span>`).join("")}</div>
      ${secs.length?`<div class="muted small">Time 时间: ${secs.map(([k,s])=>`${esc(k)} ${Math.round(s/60)} min`).join(" · ")}</div>`:""}</div>`);}catch(e){}}
  const dl=(E.daily||{})[d]; if(dl&&(dl.words||[]).length){const set=new Set(dl.words.map(norm)), ws=Object.values(b.words).filter(w=>set.has(norm(w.w)));
    out.push(`<div><b>New words 新单词</b> <span class="muted small">${dl.words.length}${dl.carried?` · ${dl.carried} carried over from an earlier day 前一天没学完的`:""}</span><div class="hd-words">${dl.words.map(w=>{const o=ws.find(x=>norm(x.w)===norm(w));return `<span class="${o&&o.stage>0?"ok":""}">${esc(w)}${o?`<small>${o.stage>0?"learned":"not yet"}${o.seen?` · ${o.right||0}/${o.seen}`:""}</small>`:""}</span>`;}).join("")}</div></div>`);}
  const wl=(b.log||{})[d]; if(wl&&wl.done)out.push(`<div class="small"><b>Spelling practice 拼写练习</b>: ${wl.right||0}/${wl.done} right</div>`);
  const rd=Object.entries((b.reading||{}).done||{}).filter(([,x])=>x.date===d);
  if(rd.length)out.push(`<div><b>Reading 阅读</b>${rd.map(([id,x])=>{const r=typeof READINGS!=="undefined"&&READINGS.find(y=>y.id===id);
    return `<details class="hd-read"><summary>${esc(x.title||(r&&r.title)||id)}${x.kind?` <span class="muted small">${esc(x.kind)}</span>`:""} · <b>${x.score}/${x.n}</b></summary>${r&&r.questions&&x.answers?`<ol class="small">${r.questions.map((q,i)=>{const ok=x.answers[i];return `<li><span class="${ok?"hist-right":"hist-wrong"}">${ok?"✓":ok===false?"✗":"–"}</span> ${esc(q.q)}${ok?"":`<br><span class="muted">Correct answer 正确答案:</span> <b>${esc(q.o?q.o[q.a]:String(q.a))}</b>${q.why?` <span class="muted">(${esc(q.why)})</span>`:""}`}${q.skill?` <span class="hist-t">${esc(q.skill)}</span>`:""}</li>`;}).join("")}</ol>`:`<div class="muted small">Answers not saved for this one.</div>`}</details>`;}).join("")}</div>`);
  const di=(E.diary||{})[d]; if(di&&di.text)out.push(`<details class="hd-read"><summary><b>Writing 作文/日记</b> · ${wordsOfText(di.text).length} words${di.kind&&di.kind!=="diary"?` · ${esc(di.kind)}`:""}${di.done?"":" · not handed in"}${di.ai?` · <b>AI ${di.ai.score}/10</b>`:""}${(di.fix||[]).length?` · ${(di.fix||[]).length} spelling mistakes`:""}</summary>
    <p class="dv-text">${typeof diaryMarked==="function"?diaryMarked(di.text,di.fix||[]):esc(di.text)}</p>${di.ai?`<div class="small">${esc(di.ai.praise_zh||di.ai.praise_en||"")}${(di.ai.improve||[]).map(x=>`<div>· ${esc(x.zh||x.en)}</div>`).join("")}</div>`:""}</details>`);
  const fl=M.log["fl:"+d], uc=M.log["uc:"+d], hp=M.log["hp:"+d];
  if(fl&&fl.n)out.push(`<div class="small"><b>Formulas 公式四步</b>: ${fl.r}/${fl.n} right first time${fl.done?" · all done ✓":""}${(fl.items||[]).length?` · ${fl.items.map(x=>esc((typeof FM_BY!=="undefined"&&FM_BY[x.k]?FM_BY[x.k].f:x.k))+` (step ${x.step})`).join(", ")}`:""}</div>`);
  if(uc&&uc.n)out.push(`<div class="small"><b>Units 单位换算</b>: ${uc.r}/${uc.n} right first time${uc.done?" · all done ✓":""}</div>`);
  if(hp&&hp.n)out.push(`<div class="small"><b>Help used 用了帮助</b>: ${hp.n} time${hp.n>1?"s":""} (those answers do not count)</div>`);
  return out.length?`<div class="hd">${out.join("")}</div>`:"";
}
function histBlock(){
  const t=today(), d=HIST_DAY||t, ML=(MB().log||{})[d]||{}, old=d<addDays(t,-H_FULL);
  const byQ=histOf.byQ||(histOf.byQ=Object.fromEntries(Object.values(MQ).map(q=>[String(q.q||"").slice(0,240),q])));
  const all=histOf(d).map(x=>{const q=byQ[x.q];return {...x,t:x.t||(q&&q.t)||"",w:x.w||(!x.ok&&q?String(q.w||(q.steps||[]).join(" ")).slice(0,320):"")};}),
    list=HIST_BAD?all.filter(x=>!x.ok):all, right=all.filter(x=>x.ok).length;
  const tp={}; all.forEach(x=>{const k=x.t||x.s;const o=tp[k]=tp[k]||{n:0,r:0};o.n++;if(x.ok)o.r++;});
  const E=(B().eng||{}), pl=(E.plog||{})[d]||{}, mk=pl.mk||[], di=(E.diary||{})[d];
  const by={}; list.forEach(x=>(by[x.s]=by[x.s]||[]).push(x));
  const nm=x=>x===t?"今天 Today":x===addDays(t,-1)?"昨天 Yesterday":x===addDays(t,-2)?"前天":shortDate(x);
  return `<div class="card stack" id="hist">
    <div class="row" style="justify-content:space-between;flex-wrap:wrap;gap:8px"><h3 style="margin:0">每天做题记录 · Every question, every day</h3>
      <span class="muted small">${ML.n?`Maths ${ML.r||0} / ${ML.n} right (${Math.round((ML.r||0)/ML.n*100)}%)`:all.length?`${right} / ${all.length} right`:"Nothing answered"}</span></div>
    <div class="hnav"><button class="btn sm" data-hday="${addDays(d,-1)}">‹ Previous day 前一天</button><input type="date" id="histDate" value="${d}" max="${t}"><button class="btn sm" data-hday="${addDays(d,1)}" ${d>=t?"disabled":""}>Next day 后一天 ›</button>${d!==t?`<button class="btn sm" data-hday="${t}">Today 今天</button>`:""}</div>
    ${histCal(d)}
    <h4 style="margin:4px 0 0">${esc(niceDate(d))} · ${esc(nm(d))}</h4>
    ${histDay(d)}
    ${old?`<div class="notice">这一天比较久了：只保存了做错的题（每天的总数和正确率一直保存）。 Older than ${H_FULL} days: only the wrong answers are kept.</div>`:""}
    ${all.length?`<div><div class="muted small" style="margin-bottom:4px"><b>By topic 按题型</b> (weakest first 最弱的在前)</div><div class="hist-topics">${Object.entries(tp).sort((a,b)=>a[1].r/a[1].n-b[1].r/b[1].n).map(([k,o])=>`<span class="${o.r/o.n<.7?"bad":"ok"}">${esc(k)} <b>${o.r}/${o.n}</b></span>`).join("")}</div></div>`:""}
    ${mk.length||pl.n||pl.cn||di?`<div class="hist-eng"><b>English this day 英语</b>
      ${pl.n||pl.sn||pl.cn||pl.bn?`<div class="muted small">Phonics 拼读: ${[pl.cn?`sounds ${pl.cr||0}/${pl.cn}`:"",pl.bn?`build ${pl.br||0}/${pl.bn}`:"",pl.n?`letters ${pl.r||0}/${pl.n}`:"",pl.sn?`spell ${pl.sr||0}/${pl.sn}`:""].filter(Boolean).join(" · ")}</div>`:""}
      ${mk.length?`<div class="small">Spelling mistakes 拼写错误 (${mk.length}): ${mk.map(m=>`<span class="hist-mk2" title="${esc(m.k)}"><s>${esc(m.v||"—")}</s> → <b>${esc(m.w)}</b> <span class="muted tiny">${esc(m.k)}</span></span>`).join(" ")}</div>`:""}
      ${di&&di.text?`<div class="small">Diary 日记: ${wordsOfText(di.text).length} words${di.done?` · ${(di.fix||[]).length} spelling mistakes`:" · not handed in"}${di.ai?` · <b>AI score ${di.ai.score}/10</b>`:""} <span class="muted">(full text in the Diary section below 日记全文在下面)</span></div>`:""}</div>`:""}
    <label class="row" style="gap:6px"><input type="checkbox" id="histBad" ${HIST_BAD?"checked":""}> 只看做错的 · Only the wrong ones</label>
    ${list.length?Object.entries(by).map(([s,xs])=>`<div><div class="muted small" style="margin:6px 0 4px"><b>${esc(s)}</b> · ${xs.filter(x=>x.ok).length}/${xs.length} right</div>
      <div class="hist-list">${xs.map(x=>`<div class="hist-row ${x.ok?"ok":"bad"}"><span class="hist-mk">${x.ok?"✓":"✗"}</span>${x.h?`<span class="tag" title="用了 Help 老师讲解">Help</span>`:""}
        <div class="grow"><div>${mt(x.q)}${x.f?` <span class="muted tiny">(with a picture)</span>`:""}</div>
        <div class="small">Answer given · 孩子的答案: <b class="${x.ok?"":"hist-wrong"}">${x.v?fracHtml(esc(x.v)):"(blank)"}</b>${x.ok?(x.tr>1?` <span class="muted">· right on the 2nd try</span>`:""):` · Correct · 正确答案: <b class="hist-right">${fracHtml(esc(x.a))}</b>`}${x.t?` <span class="hist-t">${esc(x.t)}</span>`:""}</div>
        ${!x.ok&&x.w?`<details class="hist-why"><summary>Why / how to do it 为什么错、怎么做</summary><div class="small">${mt(x.w)}</div></details>`:""}</div>
        <span class="muted tiny">${esc(x.tm||"")}</span></div>`).join("")}</div></div>`).join("")
      :`<div class="muted small">${all.length?"No wrong answers on this day. 这天没有做错的题。":"No questions answered on this day. 这天没有做题。"}</div>`}
  </div>`;
}
function histBind(){
  const hd=document.getElementById("histDate"); if(hd)hd.onchange=()=>{if(!hd.value)return;HIST_DAY=hd.value>today()?today():hd.value;HIST_MON=null;render();setTimeout(()=>{const h=document.getElementById("hist");if(h)h.scrollIntoView({block:"start"});},50);};
  document.querySelectorAll("[data-hmon]").forEach(b=>b.onclick=()=>{HIST_MON=b.dataset.hmon;render();setTimeout(()=>{const h=document.getElementById("hist");if(h)h.scrollIntoView({block:"start"});},50);});
  document.querySelectorAll("[data-hday]").forEach(b=>b.onclick=()=>{HIST_DAY=b.dataset.hday;HIST_MON=null;render();setTimeout(()=>{const h=document.getElementById("hist");if(h)h.scrollIntoView({block:"start"});},50);});
  const hb=document.getElementById("histBad"); if(hb)hb.onchange=()=>{HIST_BAD=hb.checked;render();};
}

/* the parent page: 不会的题型 in the last 7 days */
function weakTypesParent(){
  const ws=weakTypes(7), t=today();
  return `<div class="card stack no-zh"><h3 style="margin:0">${ic("x")} 不会的题型 · Types she can’t do yet</h3>
    <div class="muted small">最近 7 天做错或用了 Help 的题型。第二天的每日数学一开始，每个题型先由老师讲一道例题（不算分），再自己做 2 道同类题。已经掌握的题型（至少 5 题、90% 正确）不再出新题。</div>
    ${ws.length?`<div class="wt-list">${ws.map(w=>`<details><summary><b>${esc(w.o)}</b> <span class="muted small">${esc(w.t)} · ${w.ids.length} 题 · 最近 ${esc(shortDate(w.last))}${w.last<t?" · 已安排讲解":""}</span></summary><div class="small">${w.qs.map(q=>`<div>· ${mt(q)}</div>`).join("")}</div></details>`).join("")}</div>`:`<div class="notice">最近 7 天没有做错的题型。</div>`}
  </div>`;
}

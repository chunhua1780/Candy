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
function dailySet(date,create=true){
  const M=MB(), ex=dayOf(date);
  if(ex&&(ex.ids||[]).length){if(ex.gq)for(const [id,q] of Object.entries(ex.gq))MQ[id]=q;return ex;}
  if(!create)return null;
  const rnd=seedRand((Store.user||"")+"|"+date), st=M.q, used=new Set();
  const mix=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const take=(pool,n)=>{pool=pool.filter(id=>!used.has(id));
    const fresh=mixKinds(mix(pool.filter(id=>!st[id]&&!SERVED[id]))), older=pool.filter(id=>!fresh.includes(id)).sort((a,b)=>lastSeen(a,st)-lastSeen(b,st));
    const out=[...fresh,...older].slice(0,n); out.forEach(id=>used.add(id)); return out;};
  const retry=Object.entries(st).filter(([id,s])=>MQ[id]&&!(typeof isPrimary==="function"&&isPrimary(MQ[id]))&&!id.startsWith("w:")&&s.ok===false&&(s.last||"")<date).sort((a,b)=>(a[1].last||"")<(b[1].last||"")?-1:1).slice(0,4).map(x=>x[0]);
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
  ids=ids.slice(0,MDAY);
  M.days[DAYP+date]={ids,ans:{},u:Date.now(),...(Object.keys(gq).length?{gq}:{})}; Store.save(); markServed(ids.filter(id=>MQ[id]&&!id.startsWith("gd:")));
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
  const unit=q.u&&q.k==="n"?q.u:"", pre=unit==="£"?"£":"", post=unit&&unit!=="£"?unit:"";
  body.innerHTML=`<div class="m-q">
    <div class="row" style="justify-content:space-between"><span class="kind-tag" style="--kc:${topicColor(q.t)}">${esc(q.t)}</span><span class="muted small">Question ${MS.i+1} of ${n}</span></div>
    <div class="m-text">${mt(q.q)} <span class="m-tools"><button class="icon-btn sm" id="mSay" aria-label="Read the question">${ic("speaker")}</button>${zhBtnHtml()}</span></div>${zhLine(q.q,"q")}
    ${mFig(q.f)}
    ${q.k==="c"?`<div class="m-opts">${q.c.map((c,i)=>`<button class="opt-btn m-opt ${done&&i===q.a?"right":""} ${MS.wrongPick.includes(i)?"wrong":""}" data-opt="${i}" ${done||MS.wrongPick.includes(i)?"disabled":""}>${fracHtml(esc(c))}${zhLine(c,"opt")}</button>`).join("")}</div>`
    :`<div class="m-answer ${st}"><span class="pre">${pre}</span><span class="val">${(q.k==="f"?fracHtml:x=>x)(esc(q.k==="n"?MS.input.replace(/^(−?)(\d{4,})/,(m,s,d)=>s+(+d).toLocaleString("en-GB")):MS.input))}${done?"":`<i class="caret"></i>`}</span><span class="post">${esc(post)}</span></div>
      ${done?"":`<div class="keypad ${q.k}">${keysFor(q).map(k=>`<button data-key="${k}" class="${k==="⌫"?"del":k==="space"?"sp":""}">${k==="⌫"?ic("back"):k==="space"?"space":k}</button>`).join("")}</div>
      <button class="btn primary big" id="mCheck" ${MS.input.trim()&&!(MS.wait&&Date.now()<MS.wait)?"":"disabled"}>${MS.kind==="test"?(MS.i+1<n?"Next":"Finish"):"Check"}</button>`}`}
    <div class="m-feedback">${feedback(q)}</div>
  </div>`;
  $("#mSay").onclick=()=>sayMaths(q,$("#mSay"));
  $("#mZh").onclick=()=>{zhToggle();renderMQ();};
  bindExplain(body,renderMQ);
  zhFill(body);
  body.querySelectorAll("[data-opt]").forEach(b=>b.onclick=()=>answer(q,+b.dataset.opt));
  body.querySelectorAll("[data-key]").forEach(b=>b.onclick=()=>press(b.dataset.key));
  const c=$("#mCheck"); if(c)c.onclick=()=>answer(q,MS.input);
  const nx=$("#mNext"); if(nx){nx.onclick=nextQ;nx.focus({preventScroll:true});}
}
function feedback(q){
  const st=MS.state, nx=`<button class="btn primary big" id="mNext">${MS.i+1<MS.ids.length?"Next question":"See results"}</button>`;
  if(st==="retry")return `<div class="mfb warn">${ic("x")}<div><b>Not quite. Have another go.</b><span>Stuck? Tap 答疑 for help, one step at a time.</span></div></div>${explainBox(q,false)}`;
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
  renderMQ();
}
function record(q,ok,given){
  const M=MB(), t=today(), key=q.gen?"p:"+q.gen:q.id, s=M.q[key]||{}; // generated questions keep one record per type
  M.q[key]={n:(s.n||0)+1,r:(s.r||0)+(ok?1:0),ok,last:t,u:Date.now(),...(s.q?{q:s.q}:{})};
  if(q.gen&&!ok){const {id,gen,...keep}=q;M.q["w:"+String(q.id).replace(/^g[a-z]*:/,"")]={n:1,r:0,ok:false,last:t,u:Date.now(),q:{...keep,pg:gen}};} // generated question got wrong: keep it for the mistakes list
  const L=M.log[t]=M.log[t]||{n:0,r:0}; L.n++; if(ok)L.r++;
  if(q.gen){const g=q.gen.startsWith("fm-")?"fm":q.gen.startsWith("rv-")?"rv":"pp",G=M.log[g+":"+t]=M.log[g+":"+t]||{n:0,r:0};G.n++;if(ok)G.r++;G.u=Date.now();} // per-day counts for formulas, brush-up and test paper (must.js)
  if(MS.kind==="day"){const d=dayOf(MS.date);d.ans[q.id]={v:String(given).slice(0,20),ok,tries:MS.tries};d.u=Date.now();}
  if(MS.kind==="test"){const d=dayOf(MS.key);d.ans[q.id]={v:String(given).slice(0,20),ok};d.u=Date.now();}
  if(MS.fix){const F=M.log["fx:"+t]=M.log["fx:"+t]||{n:0,r:0};F.n++;if(ok)F.r++;F.left=mistakeIds().length;F.start=Math.max(F.start||0,F.left+(ok?1:0));F.u=Date.now();} // 错题重做 progress (must.js)
  // every answer of the day, for the parent page: the question, the child's answer, the right answer
  try{const H=M.hist[t]=M.hist[t]||[],n=new Date();if(H.length<400)H.push({q:String(q.q||"").slice(0,240),a:String(showAns(q)).slice(0,40),v:String(given==null?"":given).slice(0,40),ok,
    s:MS.kind==="day"?"Daily 20":MS.kind==="test"?"Test":MS.fix?"Fix mistakes":String(MS.topic||"Practice").slice(0,40),tr:MS.tries||1,f:q.fig?1:0,tm:String(n.getHours()).padStart(2,"0")+":"+String(n.getMinutes()).padStart(2,"0")});}catch(e){}
  if(MS.ppDay){const d=dayOf(MS.ppDay);if(d){d.ans[q.id]={v:String(given).slice(0,20),ok,tries:MS.tries};d.u=Date.now();}} // 每日试卷题 progress
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
let HIST_DAY=null, HIST_BAD=false;
function histBlock(){
  const t=today(), d=HIST_DAY||t, days=[...Array(10)].map((_,k)=>addDays(t,-k));
  const all=histOf(d), list=HIST_BAD?all.filter(x=>!x.ok):all, right=all.filter(x=>x.ok).length;
  const by={}; list.forEach(x=>(by[x.s]=by[x.s]||[]).push(x));
  const nm=x=>x===t?"今天 Today":x===addDays(t,-1)?"昨天 Yesterday":x===addDays(t,-2)?"前天":shortDate(x);
  return `<div class="card stack" id="hist">
    <div class="row" style="justify-content:space-between;flex-wrap:wrap;gap:8px"><h3 style="margin:0">每天做题记录 · Every question, every day</h3>
      <span class="muted small">${all.length?`${right} / ${all.length} right (${Math.round(right/all.length*100)}%)`:"Nothing answered"}</span></div>
    <div class="quick">${days.map(x=>{const h=histOf(x);return `<button class="${x===d?"on":""}" data-hday="${x}">${esc(nm(x))}${h.length?` <small>${h.filter(y=>y.ok).length}/${h.length}</small>`:""}</button>`;}).join("")}</div>
    <label class="row" style="gap:6px"><input type="checkbox" id="histBad" ${HIST_BAD?"checked":""}> 只看做错的 · Only the wrong ones</label>
    ${list.length?Object.entries(by).map(([s,xs])=>`<div><div class="muted small" style="margin:6px 0 4px"><b>${esc(s)}</b> · ${xs.filter(x=>x.ok).length}/${xs.length} right</div>
      <div class="hist-list">${xs.map(x=>`<div class="hist-row ${x.ok?"ok":"bad"}"><span class="hist-mk">${x.ok?"✓":"✗"}</span>
        <div class="grow"><div>${mt(x.q)}${x.f?` <span class="muted tiny">(with a picture)</span>`:""}</div>
        <div class="small">Answer given · 孩子的答案: <b class="${x.ok?"":"hist-wrong"}">${x.v?fracHtml(esc(x.v)):"(blank)"}</b>${x.ok?(x.tr>1?` <span class="muted">· right on the 2nd try</span>`:""):` · Correct · 正确答案: <b class="hist-right">${fracHtml(esc(x.a))}</b>`}</div></div>
        <span class="muted tiny">${esc(x.tm||"")}</span></div>`).join("")}</div></div>`).join("")
      :`<div class="muted small">${all.length?"No wrong answers on this day. 这天没有做错的题。":"No questions answered on this day. 这天没有做题。"}</div>`}
  </div>`;
}
function histBind(){
  document.querySelectorAll("[data-hday]").forEach(b=>b.onclick=()=>{HIST_DAY=b.dataset.hday;render();setTimeout(()=>{const h=document.getElementById("hist");if(h)h.scrollIntoView({block:"start"});},50);});
  const hb=document.getElementById("histBad"); if(hb)hb.onchange=()=>{HIST_BAD=hb.checked;render();};
}

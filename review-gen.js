/* ================= Brush up: brand-new questions once the fixed ones run out =================
   Each Brush up topic has 80 fixed questions (maths-review.js). When a topic has no unseen ones left,
   topicSet() asks reviewTopUp() for new questions made here with fresh numbers, so practice never repeats.
   They are the same kinds of question as the fixed ones, with their own step-by-step working (答疑).
   Like the test-paper questions they live in memory only (ids "g:rv…"), and their marks are saved as one
   summary per topic in book.maths.q under "p:rv-<topic>". */
const RG={
  R:(a,b)=>a+Math.floor(Math.random()*(b-a+1)),
  K:a=>a[Math.floor(Math.random()*a.length)],
  f:n=>Number(n).toLocaleString("en-GB"),
  gcd:(a,b)=>b?RG.gcd(b,a%b):a,
  prime:n=>{if(n<2)return false;for(let d=2;d*d<=n;d++)if(n%d===0)return false;return true;},
  facs:n=>{const f=[];for(let d=1;d<=n;d++)if(n%d===0)f.push(d);return f;},
};
// fractions as [numerator, denominator], always simplified
const fr=(n,d)=>{const g=RG.gcd(Math.abs(n),d)||1;return [n/g,d/g];};
const frS=([n,d])=>d===1?String(n):`${n}/${d}`;
const frM=([n,d])=>{if(d===1)return String(n);const w=Math.floor(n/d),r=n%d;return w?`${w} ${r}/${d}`:`${r}/${d}`;};
const ONES_W="zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split(" ");
const TENS_W=["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];
const w99=n=>n<20?ONES_W[n]:TENS_W[Math.floor(n/10)]+(n%10?"-"+ONES_W[n%10]:"");
const w999=n=>{const h=Math.floor(n/100),r=n%100;return h?ONES_W[h]+" hundred"+(r?" and "+w99(r):""):w99(r);};
function inWords(n){
  if(!n)return "zero"; const p=[];
  if(n>=1e6){p.push(w999(Math.floor(n/1e6))+" million");n%=1e6;}
  if(n>=1000){p.push(w999(Math.floor(n/1000))+" thousand");n%=1000;}
  if(n)p.push((p.length&&n<100?"and ":"")+w999(n));
  return p.join(" ");
}
const PLACES=["ones","tens","hundreds","thousands","ten thousands","hundred thousands","millions"];

const RV={
  "Prime numbers":()=>RG.K([
    ()=>{const n=RG.K([RG.R(11,150),RG.K([21,27,33,39,49,51,57,63,77,87,91,93,111,119,121,133,143])]),yes=RG.prime(n),ps=[2,3,5,7,11].filter(p=>p*p<=n);
      const d=ps.find(p=>n%p===0);
      return {o:"Decide whether a number is prime",q:`Is ${n} a prime number?`,k:"c",c:["Yes","No"],a:yes?0:1,
        w:yes?`Yes. ${n} has only the factors 1 and ${n}.`:`No. ${n} = ${d} × ${n/d}.`,
        steps:["A prime number has exactly two factors: 1 and itself.",`Try dividing ${n} by the primes up to √${n} ≈ ${Math.floor(Math.sqrt(n))}: ${ps.map(p=>`÷${p} ${n%p?"✗":"✓"}`).join(", ")}.`,
          yes?`Nothing divides exactly, so ${n} is prime.`:`${n} = ${d} × ${n/d}, so it has other factors.`,`So the answer is ${yes?"Yes":"No"}.`]};},
    ()=>{const n=RG.R(10,150);let p=n+1;while(!RG.prime(p))p++;const skip=[];for(let x=n+1;x<p;x++)skip.push(x);
      return {o:"Find prime numbers",q:`What is the first prime number after ${n}?`,k:"n",a:p,w:`${p} is the next prime after ${n}.`,
        steps:[`Check the numbers after ${n} one by one.`,...skip.slice(0,5).map(x=>{const d=[2,3,5,7,11,13].find(q=>x%q===0);return `${x} = ${d} × ${x/d}: not prime.`;}),`${p}: nothing divides it except 1 and ${p}, so it is prime.`]};},
    ()=>{const a=RG.R(1,60),b=a+RG.R(8,16),ps=[];for(let x=a;x<=b;x++)if(RG.prime(x))ps.push(x);if(!ps.length)return null;const s=ps.reduce((x,y)=>x+y,0);
      return {o:"Find prime numbers",q:`Add together all the prime numbers from ${a} to ${b}.`,k:"n",a:s,w:`The primes are ${ps.join(", ")}. Total ${s}.`,
        steps:[`List ${a} to ${b} and cross out numbers with other factors (even numbers, the 3 times table, the 5 times table, …).`,`The primes left are ${ps.join(", ")}.`,`Add them: ${ps.join(" + ")} = ${s}.`]};},
    ()=>{const a=RG.R(1,80),b=a+RG.R(8,20),ps=[];for(let x=a+1;x<b;x++)if(RG.prime(x))ps.push(x);
      return {o:"Find prime numbers",q:`How many prime numbers are there between ${a} and ${b}?`,k:"n",a:ps.length,w:`The primes are ${ps.join(", ")||"none"}.`,
        steps:[`Check the numbers from ${a+1} to ${b-1}. Skip even numbers (except 2) and numbers ending in 5 (except 5).`,`The primes are ${ps.join(", ")||"none"}.`,`Count them: ${ps.length}.`]};},
  ])(),
  "Factors":()=>RG.K([
    ()=>{const n=RG.K([12,16,18,20,24,28,30,32,36,40,42,45,48,50,54,56,60,64,72,80,84,90,96,100,108,120]),f=RG.facs(n);
      return {o:"List all the factors of a number",q:`How many factors does ${n} have?`,k:"n",a:f.length,w:`The factors are ${f.join(", ")}.`,
        steps:["Find factors in pairs, starting at 1. Stop when the pairs meet.",`Pairs: ${f.filter(x=>x*x<=n).map(x=>`${x} × ${n/x}`).join(", ")}.`,`All the factors: ${f.join(", ")}.`,`Count them: ${f.length}.`]};},
    ()=>{const g=RG.K([2,3,4,5,6,8,9,12]),a=g*RG.R(2,9),b=g*RG.R(2,9);if(a===b)return null;const h=RG.gcd(a,b),fa=RG.facs(a),fb=RG.facs(b);
      return {o:"Find common factors",q:`What is the highest common factor of ${a} and ${b}?`,k:"n",a:h,w:`The biggest number in both factor lists is ${h}.`,
        steps:[`Factors of ${a}: ${fa.join(", ")}.`,`Factors of ${b}: ${fb.join(", ")}.`,`In both lists: ${fa.filter(x=>b%x===0).join(", ")}.`,`The highest is ${h}.`]};},
    ()=>{const n=RG.K([24,36,40,48,56,60,72,84,90,96,100,120,144]),a=RG.K(RG.facs(n).slice(1,-1));
      return {o:"Find factor pairs",q:`${a} × ? = ${n}. What is the missing number?`,k:"n",a:n/a,w:`${n} ÷ ${a} = ${n/a}.`,
        steps:[`The missing number makes a factor pair with ${a}. Use the inverse: divide.`,`${n} ÷ ${a} = ${n/a}.`,`Check: ${a} × ${n/a} = ${n} ✓.`]};},
    ()=>{const n=RG.K([33,39,45,49,51,55,63,65,77,85,88,91,95,99,105,119,121,125,133,143]),f=RG.facs(n);
      return {o:"Recognise factors",q:`What is the largest factor of ${n}, apart from ${n} itself?`,k:"n",a:f[f.length-2],w:`${n} ÷ ${f[1]} = ${f[f.length-2]}.`,
        steps:["Factors come in pairs: the smallest factor (after 1) pairs with the largest (before the number).",`The smallest factor bigger than 1 is ${f[1]}.`,`Its partner: ${n} ÷ ${f[1]} = ${f[f.length-2]}.`]};},
  ])(),
  "Rounding to 10, 100 and 1,000":()=>RG.K([
    ()=>{const p=RG.K([10,100,1000]),n=RG.R(p*10,999999);if(n%p===0)return null;const r=Math.floor((n+p/2)/p)*p,c=PLACES[Math.log10(p)],s=PLACES[Math.log10(p)-1],d=Math.floor(n/(p/10))%10;
      return {o:`Round to the nearest ${RG.f(p)}`,q:`Round ${RG.f(n)} to the nearest ${RG.f(p)}.`,k:"n",a:r,w:`Look at the ${s} digit: ${d}.`,
        steps:[`Rounding to the nearest ${RG.f(p)}: the choices are ${RG.f(Math.floor(n/p)*p)} and ${RG.f(Math.floor(n/p)*p+p)}.`,`Look at the digit to the right of the ${c}: the ${s} digit is ${d}.`,
          d>=5?"5 or more, so round up.":"Less than 5, so round down.",`Everything after the ${c} becomes 0: ${RG.f(n)} → ${RG.f(r)}.`]};},
    ()=>{const p=RG.K([10,100,1000]),t=RG.R(2,90)*p,sm=Math.random()<.5,a=sm?t-p/2:t+p/2-1;
      return {o:"Reason about rounding",q:`A whole number rounds to ${RG.f(t)} to the nearest ${RG.f(p)}. What is the ${sm?"smallest":"largest"} it could be?`,k:"n",a,w:`Numbers from ${RG.f(t-p/2)} to ${RG.f(t+p/2-1)} round to ${RG.f(t)}.`,
        steps:[`Go half of ${RG.f(p)} = ${RG.f(p/2)} down and up from ${RG.f(t)}.`,`Halfway down, ${RG.f(t-p/2)}, rounds up to ${RG.f(t)}, so it counts.`,`Halfway up, ${RG.f(t+p/2)}, rounds up to ${RG.f(t+p)}, so the last one that works is ${RG.f(t+p/2-1)}.`,`The ${sm?"smallest":"largest"} is ${RG.f(a)}.`]};},
  ])(),
  "Numbers in words":()=>{
    const n=Number(String(RG.R(1,9))+Array.from({length:RG.K([3,4,4,5,5,6])},()=>RG.K("0000123456789".split(""))).join("")),th=Math.floor(n/1000)%1000,m=Math.floor(n/1e6),r=n%1000;
    return {o:"Write numbers given in words",q:`Write this number in digits: ${inWords(n)}.`,k:"n",a:n,w:`${inWords(n)} is ${RG.f(n)}.`,
      steps:["Split the words at 'million' and 'thousand'. Each part is a group of 3 digits.",...(m?[`Millions: ${w999(m)} → ${m}.`]:[]),...(n>=1000?[`Thousands: ${th?w999(th):"none"} → ${m?String(th).padStart(3,"0"):th}.`]:[]),
        `The rest: ${r?w999(r):"nothing"} → ${String(r).padStart(3,"0")} (always 3 digits: fill gaps with 0).`,`Together: ${RG.f(n)}.`]};
  },
  "Place value of digits":()=>RG.K([
    ()=>{const n=RG.R(100000,9999999),s=String(n),i=RG.R(0,s.length-1),d=+s[i],p=s.length-1-i;if(!d)return null;const v=d*10**p;
      return {o:"Know the value of each digit",q:`What is the value of the digit ${d} in ${RG.f(n)}?`,k:"n",a:v,w:`The ${d} is in the ${PLACES[p]} place.`,
        steps:[`Name the columns from the right: ${PLACES.slice(0,s.length).join(", ")}.`,`The ${d} is in the ${PLACES[p]} column.`,`So it is worth ${d} × ${RG.f(10**p)} = ${RG.f(v)}.`]};},
    ()=>{const n=RG.R(10000,999999),p=RG.K([10,100,1000,10000,100000]),up=Math.random()<.5;if(!up&&n<p)return null;const r=up?n+p:n-p,c=PLACES[Math.log10(p)];
      return {o:"Find more or less",q:`What is ${RG.f(p)} ${up?"more":"less"} than ${RG.f(n)}?`,k:"n",a:r,w:`${RG.f(n)} ${up?"+":"−"} ${RG.f(p)} = ${RG.f(r)}.`,
        steps:[`${RG.f(p)} ${up?"more":"less"} changes the ${c} digit by 1.`,`In ${RG.f(n)} the ${c} digit is ${Math.floor(n/p)%10}.`,`${RG.f(n)} ${up?"+":"−"} ${RG.f(p)} = ${RG.f(r)}`+((Math.floor(n/p)%10===9&&up)||(Math.floor(n/p)%10===0&&!up)?" (it goes past 9 or below 0, so the next column changes too).":".")]};},
  ])(),
};
// the four fraction operations share one maker
function frQ(op){
  const D=[2,3,4,5,6,8,9,10,12], cop=d=>{let n;do{n=RG.R(1,d-1);}while(RG.gcd(n,d)>1);return n;}, pro=()=>{const d=RG.K(D);return [cop(d),d];}, mix=()=>{const d=RG.K([2,3,4,5,6,8]);return [RG.R(1,3)*d+cop(d),d];};
  let a=Math.random()<.3&&op!=="×"&&op!=="÷"?mix():pro(), b=op==="×"&&Math.random()<.3?[RG.R(2,9),1]:pro();
  const val=x=>x[0]/x[1];
  if(op==="−"&&val(b)>val(a))[a,b]=[b,a];
  let rn,rd,st=[];
  const imp=x=>x[1]>1&&x[0]>x[1]?`${frM(x)} = ${x[0]}/${x[1]}`:"";
  if(imp(a))st.push(`Change the mixed number to an improper fraction: ${imp(a)}.`);
  if(op==="+"||op==="−"){
    const L=a[1]*b[1]/RG.gcd(a[1],b[1]),na=a[0]*L/a[1],nb=b[0]*L/b[1]; rn=op==="+"?na+nb:na-nb; rd=L;
    if(a[1]===b[1])st.push(`The denominators are the same, so ${op==="+"?"add":"subtract"} the tops.`);
    else st.push(`Find a common denominator: the lowest common multiple of ${a[1]} and ${b[1]} is ${L}.`,`${frS(a)} = ${na}/${L} and ${frS(b)} = ${nb}/${L}.`);
    st.push(`${na}/${L} ${op} ${nb}/${L} = ${rn}/${L}.`);
  }else if(op==="×"){rn=a[0]*b[0];rd=a[1]*b[1];st.push(b[1]===1?`Multiply only the top by ${b[0]}: ${a[0]} × ${b[0]} = ${rn}, so ${rn}/${rd}.`:`Multiply the tops and the bottoms: ${a[0]} × ${b[0]} = ${rn}, ${a[1]} × ${b[1]} = ${rd}. So ${rn}/${rd}.`);}
  else{rn=a[0]*b[1];rd=a[1]*b[0];st.push(`Keep ${frS(a)}, change ÷ to ×, flip ${frS(b)} to ${b[1]}/${b[0]}.`,`Multiply: ${a[0]} × ${b[1]} = ${rn}, ${a[1]} × ${b[0]} = ${rd}. So ${rn}/${rd}.`);}
  if(rn<=0)return null;
  const r=fr(rn,rd);
  if(r[1]!==rd)st.push(`Simplify: divide top and bottom by ${RG.gcd(rn,rd)} → ${frS(r)}.`);
  if(r[1]>1&&r[0]>r[1])st.push(`Change to a mixed number: ${r[0]} ÷ ${r[1]} = ${Math.floor(r[0]/r[1])} remainder ${r[0]%r[1]} → ${frM(r)}.`);
  st.push(`Answer: ${frM(r)}.`);
  const name={"+":"Add","−":"Subtract","×":"Multiply","÷":"Divide"}[op];
  return {o:`${name} fractions`,q:`Work out ${frM(a)} ${op} ${frM(b)}. Give your answer in its simplest form.`,k:"f",a:frM(r),w:st[st.length-2]||st[0],steps:st};
}
RV["Adding fractions"]=()=>frQ("+"); RV["Subtracting fractions"]=()=>frQ("−");
RV["Multiplying fractions"]=()=>frQ("×"); RV["Dividing fractions"]=()=>frQ("÷");

let rvSeq=0;
function reviewTopUp(t,n){
  const make=RV[t]; if(!make)return [];
  const slug="rv-"+t.toLowerCase().replace(/[^a-z]+/g,"-").replace(/^-|-$/g,""), seen=new Set([...MATHS.filter(q=>q.t===t).map(q=>q.q),...Object.values(MQ).filter(q=>q.gen===slug).map(q=>q.q)]), out=[]; // never repeat a fixed question or one already made
  for(let g=0;out.length<n&&g<400;g++){
    let q; try{q=make();}catch(e){q=null;}
    if(!q||seen.has(q.q))continue; seen.add(q.q);
    const id=`g:${slug}:${Date.now().toString(36)}:${++rvSeq}`;
    MQ[id]={...q,t,id,gen:slug}; out.push(id);
  }
  return out;
}
/* Year 7 topics with a smaller fixed bank: top up with the test-paper generators (paper.js) */
if(typeof genStats==="function"){
  RV["Statistics"]=()=>RG.K([genStats,genFreq,genBars])();
  RV["Factors, multiples and primes"]=()=>genFactors();
}

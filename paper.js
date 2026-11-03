/* ================= Test paper practice: question types from the school paper =================
   Five types (bar charts, averages, divisibility and Venn diagrams, factors/HCF/LCM, frequency and
   histograms). Every set is made fresh: the same kinds of question with new numbers each time.
   Each question carries step-by-step working (q.steps): a wrong first try shows the first steps,
   a second wrong try shows them all. Generated questions live only in memory (ids "g:..."), so the
   saved record is one summary per type in book.maths.q under "p:<type>". */
const PR=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const PK=a=>a[Math.floor(Math.random()*a.length)];
const pn=n=>(+n).toLocaleString("en-GB",{maximumFractionDigits:2});
const DAYS=["Mon","Tue","Wed","Thu","Fri"], DAYN={Mon:"Monday",Tue:"Tuesday",Wed:"Wednesday",Thu:"Thursday",Fri:"Friday"};
const sum=a=>a.reduce((s,x)=>s+x,0);
function pq(t,o,q,k,a,steps,extra={}){return {t,o,q,k,a,steps,w:steps[steps.length-1],...extra};}
function pmc(t,o,q,correct,wrong,steps,extra={}){
  const opts=[correct,...[...new Set(wrong.map(String))].filter(w=>w!==String(correct))].slice(0,4);
  if(opts.length<2)return null;
  const sh=shuffle(opts); return pq(t,o,q,"c",sh.indexOf(correct),steps,{c:sh,...extra});
}

/* ---------- 1. compound and comparative bar charts ---------- */
function genBars(){
  const stacked=Math.random()<.55;
  const [title,names,unit,ph]=PK(stacked
    ?[["Phone calls each day",["Made","Received"],"calls",["calls made","calls received"]],["Books borrowed and returned",["Borrowed","Returned"],"books",["books borrowed","books returned"]],["Lunches each day",["Hot dinners","Packed lunches"],"lunches",["hot dinners","packed lunches"]]]
    :[["Cinema visitors",["Men","Women"],"people",["men","women"]],["Goals scored",["Team A","Team B"],"goals",["goals by Team A","goals by Team B"]],["Ice creams sold",["Vanilla","Chocolate"],"ice creams",["vanilla ice creams","chocolate ice creams"]]]);
  const step=PK([1,2,2,5]), top=step===5?10:step===1?6:9;
  const vals=[0,1].map(()=>DAYS.map(()=>PR(1,top)*step));
  const fig={t:"p-bar",mode:stacked?"stack":"group",title,labels:DAYS,series:names.map((n,i)=>({name:n,values:vals[i]}))};
  const T="Statistics", O=stacked?"Read a compound bar chart":"Read a comparative bar chart";
  const key=`Check the key: ${names[0]} is the ${stacked?"bottom":"left"} bar${stacked?" part":""} (dark), ${names[1]} the ${stacked?"top part":"right bar"} (light).`;
  const d=PR(0,4), day=DAYN[DAYS[d]], a=vals[0], b=vals[1];
  const kinds=[
    ()=>pq(T,O,`How many ${ph[1]} were there on ${day}?`,"n",b[d],stacked
      ?[key,`On ${day} the whole bar reaches ${a[d]+b[d]}. The ${names[0]} part ends at ${a[d]}.`,`${names[1]} = top of the bar − top of the bottom part = ${a[d]+b[d]} − ${a[d]} = ${b[d]}.`]
      :[key,`Find ${day}, then the ${names[1]} (right) bar.`,`Read across to the scale: it reaches ${b[d]}.`],{f:fig}),
    ()=>pq(T,O,`How many ${ph[0]} were there altogether from Monday to Friday?`,"n",sum(a),
      [key,`Read only the ${names[0]} ${stacked?"parts":"bars"}: ${a.join(", ")}.`,`Add them: ${a.join(" + ")} = ${sum(a)}.`],{f:fig}),
    ()=>pq(T,O,`How many ${unit} were there in total on ${day}?`,"n",a[d]+b[d],
      stacked?[key,`For a compound bar the total is the top of the whole bar.`,`On ${day} the bar reaches ${a[d]+b[d]} (${a[d]} + ${b[d]}).`]
      :[key,`Read both bars for ${day}: ${a[d]} and ${b[d]}.`,`Total = ${a[d]} + ${b[d]} = ${a[d]+b[d]}.`],{f:fig}),
    ()=>{const diff=DAYS.map((_,i)=>Math.abs(a[i]-b[i])), mx=Math.max(...diff); if(diff.filter(x=>x===mx).length>1)return null;
      const i=diff.indexOf(mx);
      return pmc(T,O,`On which day was the difference between ${ph[0]} and ${ph[1]} the greatest?`,DAYN[DAYS[i]],DAYS.map(x=>DAYN[x]),
        [key,`Work out the difference for each day: ${DAYS.map((x,k)=>`${x} ${Math.max(a[k],b[k])} − ${Math.min(a[k],b[k])} = ${diff[k]}`).join("; ")}.`,`The biggest difference is ${mx}, on ${DAYN[DAYS[i]]}.`],{f:fig});},
    ()=>{const mx=Math.max(...b); if(b.filter(x=>x===mx).length>1)return null; const i=b.indexOf(mx);
      return pmc(T,O,`On which day were there the most ${ph[1]}?`,DAYN[DAYS[i]],DAYS.map(x=>DAYN[x]),
        [key,stacked?`Each ${names[1]} part = top of the bar − top of the bottom part: ${DAYS.map((x,k)=>`${x} ${a[k]+b[k]} − ${a[k]} = ${b[k]}`).join("; ")}.`:`Read the ${ph[1]}: ${DAYS.map((x,k)=>`${x} ${b[k]}`).join(", ")}.`,`The largest is ${mx}, on ${DAYN[DAYS[i]]}.`],{f:fig});},
    ()=>{const A=sum(a),B=sum(b); if(A===B)return null; const [hi,lo]=A>B?[ph[0],ph[1]]:[ph[1],ph[0]];
      return pq(T,O,`Over the whole week, how many more ${hi} than ${lo} were there?`,"n",Math.abs(A-B),
        [key,`${names[0]}: ${a.join(" + ")} = ${A}.`,`${names[1]}: ${b.join(" + ")} = ${B}.`,`Difference = ${Math.max(A,B)} − ${Math.min(A,B)} = ${Math.abs(A-B)}.`],{f:fig});},
  ];
  return PK(kinds)();
}

/* ---------- 2. mean, median, range, mode ---------- */
function genStats(){
  const T="Statistics";
  const n=PR(5,9), data=Array.from({length:n},()=>PR(1,30)), srt=d=>d.slice().sort((x,y)=>x-y);
  const kinds=[
    ()=>{const d=data.slice(); d[n-1]+=(n-sum(d)%n)%n; const S=sum(d);
      return pq(T,"Calculate the mean",`Find the mean of: ${d.join(", ")}`,"n",S/n,
        [`Mean = sum of all the values ÷ how many values there are.`,`Sum: ${d.join(" + ")} = ${S}.`,`There are ${n} values.`,`Mean = ${S} ÷ ${n} = ${pn(S/n)}.`]);},
    ()=>{const d=data.length%2?data:data.slice(0,n-1), m=d.length, s=srt(d), mid=(m+1)/2;
      return pq(T,"Find the median",`Find the median of: ${d.join(", ")}`,"n",s[mid-1],
        [`Put the numbers in order first: ${s.join(", ")}.`,`There are ${m} numbers (odd), so the median is the middle one: number ${mid} in the list.`,`Median = ${s[mid-1]}.`]);},
    ()=>{const d=data.length%2?data.slice(0,n-1):data, m=d.length, s=srt(d), A=s[m/2-1], B=s[m/2];
      return pq(T,"Find the median",`Find the median of: ${d.join(", ")}`,"n",(A+B)/2,
        [`Put the numbers in order first: ${s.join(", ")}.`,`There are ${m} numbers (even), so take the two middle ones: ${A} and ${B}.`,`Median = (${A} + ${B}) ÷ 2 = ${pn((A+B)/2)}.`]);},
    ()=>{const s=srt(data);if(s[0]===s[n-1])return null;
      return pq(T,"Find the range",`Find the range of: ${data.join(", ")}`,"n",s[n-1]-s[0],
        [`Range = largest value − smallest value.`,`Largest = ${s[n-1]}, smallest = ${s[0]}.`,`Range = ${s[n-1]} − ${s[0]} = ${s[n-1]-s[0]}.`]);},
    ()=>{const m=PR(2,20), d=shuffle([m,m,m,...data.slice(0,n-3).map(x=>x===m?x+1:x)]); const c={};d.forEach(x=>c[x]=(c[x]||0)+1);
      if(Object.values(c).filter(x=>x>=3).length>1)return null;
      return pq(T,"Find the mode",`Find the mode of: ${d.join(", ")}`,"n",m,
        [`The mode is the value that appears most often.`,`Count them: ${Object.entries(c).filter(([,k])=>k>1).map(([v,k])=>`${v} appears ${k} times`).join(", ")}; the rest appear once.`,`Mode = ${m}.`]);},
    ()=>{const k=n, d=data.slice(0,k); let S=sum(d); const fix=(k+1-S%(k+1))%(k+1); d[k-1]+=fix; S+=fix; if(S/k%1&&String(S/k).split(".")[1].length>2)return null;
      return pq(T,"Understand how the mean changes",`The numbers are ${d.join(", ")}. A score of 0 is added to the list. What is the new mean?`,"n",S/(k+1),
        [`Adding 0 does not change the total, but it adds one more value, so the mean goes down.`,`Sum = ${d.join(" + ")} = ${S} (still ${S} with the 0).`,`Now there are ${k} + 1 = ${k+1} values.`,`New mean = ${S} ÷ ${k+1} = ${pn(S/(k+1))}.`]);},
    ()=>{const A=Array.from({length:6},()=>PR(8,20)), B=Array.from({length:6},()=>PR(2,30));const rA=Math.max(...A)-Math.min(...A), rB=Math.max(...B)-Math.min(...B);if(rA===rB)return null;
      const who=rA<rB?"Amir":"Ben";
      return pmc(T,"Compare data using the range","Amir's scores: "+A.join(", ")+". Ben's scores: "+B.join(", ")+". Who is the more consistent player?",who,["Amir","Ben"],
        [`Consistent means the scores are close together, so compare the ranges. A smaller range is more consistent.`,`Amir: ${Math.max(...A)} − ${Math.min(...A)} = ${rA}.`,`Ben: ${Math.max(...B)} − ${Math.min(...B)} = ${rB}.`,`${who} has the smaller range, so ${who} is more consistent.`]);},
    ()=>{const m=PR(4,15), k=PR(4,6), others=Array.from({length:k-1},()=>PR(1,2*m)), last=m*k-sum(others); if(last<0||last>40)return null;
      return pq(T,"Use the mean to find a missing value",`The mean of ${k} numbers is ${m}. ${k-1} of them are ${others.join(", ")}. What is the missing number?`,"n",last,
        [`Total of all ${k} numbers = mean × how many = ${m} × ${k} = ${m*k}.`,`Total of the ones you know = ${others.join(" + ")} = ${sum(others)}.`,`Missing number = ${m*k} − ${sum(others)} = ${last}.`]);},
    ()=>{const cls=["0–9","10–19","20–29","30–39","40–49"], f=cls.map(()=>PR(1,12)), mx=Math.max(...f); if(f.filter(x=>x===mx).length>1)return null;
      return pmc(T,"Find the modal class",`The table shows the marks pupils scored in a quiz. What is the modal class?`,cls[f.indexOf(mx)],cls,
        [`The modal class is the group with the highest frequency.`,`Frequencies: ${cls.map((c,i)=>`${c}: ${f[i]}`).join(", ")}.`,`The highest is ${mx}, so the modal class is ${cls[f.indexOf(mx)]}.`],{f:{t:"table",head:["Marks","Frequency"],rows:cls.map((c,i)=>[c,String(f[i])])}});},
  ];
  return PK(kinds)();
}

/* ---------- 3. divisibility rules and Venn diagrams ---------- */
const dsum=n=>String(n).split("").reduce((s,c)=>s+ +c,0);
const RULE={3:n=>`digit sum ${String(n).split("").join(" + ")} = ${dsum(n)}, ${dsum(n)%3?"not ":""}a multiple of 3`,
  9:n=>`digit sum ${String(n).split("").join(" + ")} = ${dsum(n)}, ${dsum(n)%9?"not ":""}a multiple of 9`,
  4:n=>`last two digits ${String(n%100).padStart(2,"0")}, ${n%100%4?"not ":""}divisible by 4`};
const RULE_TEXT={3:"A number divides by 3 when the sum of its digits is a multiple of 3.",9:"A number divides by 9 when the sum of its digits is a multiple of 9.",4:"A number divides by 4 when the number made by its last two digits divides by 4."};
function genVenn(){
  const T="Factors, multiples and primes";
  const num=()=>PR(100,9999);
  const kinds=[
    ()=>{const d=PK([3,9,4]); let x=num(); if(Math.random()<.5)x=x-x%d+(x%d?d:0); const yes=x%d===0;
      return pmc(T,"Use divisibility rules",`Is ${pn(x)} divisible by ${d}?`,yes?"Yes":"No",["Yes","No"],[RULE_TEXT[d],`${pn(x)}: ${RULE[d](x)}.`,`So ${pn(x)} ${yes?"is":"is not"} divisible by ${d}.`]);},
    ()=>{const d=PK([3,9,4]); const good=num(), g=good-good%d+d, bad=[];while(bad.length<3){const b=num();if(b%d&&!bad.includes(b))bad.push(b);}
      return pmc(T,"Use divisibility rules",`Which of these numbers is divisible by ${d}?`,pn(g),bad.map(pn),[RULE_TEXT[d],...[g,...bad].map(x=>`${pn(x)}: ${RULE[d](x)}.`),`Only ${pn(g)} works.`]);},
    ()=>{const [A,B]=PK([[3,4],[4,9],[3,5],[2,9]]), x=PR(20,400), inA=x%A===0, inB=x%B===0;
      const R={a:`a (divisible by ${A} only)`,b:`b (divisible by both)`,c:`c (divisible by ${B} only)`,d:`d (neither: outside the circles)`}, r=inA&&inB?"b":inA?"a":inB?"c":"d";
      const why=n=>A===5||A===2||B===5||B===2?`${x} ÷ ${n} = ${pn(x/n)}${x%n?" (not a whole number)":""}`:`${RULE[n]?RULE[n](x):`${x} ÷ ${n} = ${pn(x/n)}`}`;
      return pmc(T,"Sort numbers in a Venn diagram",`${x} is put in the Venn diagram. Which region does it go in?`,R[r],Object.values(R),
        [`Test each circle. Circle A: divisible by ${A}? ${why(A)}, so ${inA?"yes":"no"}.`,`Circle B: divisible by ${B}? ${why(B)}, so ${inB?"yes":"no"}.`,`${inA&&inB?"It is in both circles, so it goes in the overlap":inA||inB?"It is in one circle only":"It is in neither circle, so it goes outside the circles but inside the box"}: region ${r}.`],
        {f:{t:"p-venn2",A:`Divisible by ${A}`,B:`Divisible by ${B}`}});},
    ()=>{const x=PR(10,300), m=[x%3===0,x%4===0,x%9===0];
      const L={"100":"a","010":"b","001":"c","110":"d","101":"e","011":"f","111":"g","000":"h"}, r=L[m.map(Number).join("")];
      const names={a:"a",b:"b",c:"c",d:"d",e:"e",f:"f",g:"g",h:"h (outside)"}, opts=shuffle(Object.keys(L).map(k=>L[k]).filter(v=>v!==r&&v!=="c"&&v!=="f")).slice(0,3);
      return pmc(T,"Sort numbers in a Venn diagram",`Which region does ${x} go in?`,names[r],opts.map(o=>names[o]),
        [`Test all three: ÷3? ${RULE[3](x)}. ÷4? ${RULE[4](x)}. ÷9? ${RULE[9](x)}.`,`So it is ${m[0]?"":"not "}in "divisible by 3", ${m[1]?"":"not "}in "divisible by 4" and ${m[2]?"":"not "}in "divisible by 9".`,`Remember every number that divides by 9 also divides by 3. That gives region ${names[r]}.`],
        {f:{t:"p-venn3",A:"÷ 3",B:"÷ 4",C:"÷ 9"}});},
    ()=>pmc(T,"Reason about Venn diagrams","In this Venn diagram, which two regions must be empty?","c and f",["a and b","d and g","e and h","b and d"],
        ["Look at the circle for ÷ 9.","Every number that divides by 9 also divides by 3 (9 = 3 × 3).","So no number can be in ÷ 9 but outside ÷ 3: regions c and f must be empty."],{f:{t:"p-venn3",A:"÷ 3",B:"÷ 4",C:"÷ 9"}}),
    ()=>{const [A,B]=PK([[3,4],[4,9],[2,3],[3,5]]), list=Array.from({length:7},()=>PR(10,120)); const both=list.filter(x=>x%A===0&&x%B===0);
      return pq(T,"Sort numbers in a Venn diagram",`These numbers go in a Venn diagram with circles "divisible by ${A}" and "divisible by ${B}": ${list.join(", ")}. How many go in the overlap?`,"n",both.length,
        [`The overlap holds numbers divisible by ${A} AND by ${B} (that is, by ${A*B/((x,y)=>{while(y)[x,y]=[y,x%y];return x;})(A,B)}).`,`Check each: ${list.map(x=>`${x} ${x%A===0&&x%B===0?"✓":"✗"}`).join(", ")}.`,`${both.length} number${both.length===1?"":"s"} go${both.length===1?"es":""} in the overlap${both.length?`: ${both.join(", ")}`:""}.`]);},
  ];
  return PK(kinds)();
}

/* ---------- 4. factors, multiples, HCF and LCM ---------- */
const facs=n=>{const f=[];for(let i=1;i<=n;i++)if(n%i===0)f.push(i);return f;};
const pairs=n=>facs(n).filter(a=>a*a<=n).map(a=>`${a} × ${n/a}`).join(", ");
const pgcd=(a,b)=>b?pgcd(b,a%b):a;
function genFactors(){
  const T="Factors, multiples and primes", RICH=[12,16,18,20,24,28,30,32,36,40,42,45,48,54,56,60,63,64,72,80,84,90,96,100];
  const kinds=[
    ()=>{const n=PK(RICH), f=facs(n), miss=PK(f.slice(1,-1)), extra=PK([5,7,8,9,11,12,14].filter(x=>n%x));
      return pmc(T,"List factors in pairs",`Which list shows all the factors of ${n}?`,f.join(", "),[f.filter(x=>x!==miss).join(", "),[...f,extra].sort((a,b)=>a-b).join(", "),f.slice(1,-1).join(", ")],
        [`Find factors in pairs, starting from 1: ${pairs(n)}.`,`Stop when the pairs meet.`,`Factors of ${n}: ${f.join(", ")}.`]);},
    ()=>{const n=PK(RICH), f=facs(n);
      return pq(T,"List factors in pairs",`How many factors does ${n} have?`,"n",f.length,[`Find factors in pairs: ${pairs(n)}.`,`List them: ${f.join(", ")}.`,`That is ${f.length} factors.`]);},
    ()=>{const n=PK(RICH), a=PK(facs(n).slice(1,-1));
      return pq(T,"List factors in pairs",`${n} = ${a} × ?`,"n",n/a,[`Factors come in pairs that multiply to ${n}.`,`${n} ÷ ${a} = ${n/a}.`,`So ${n} = ${a} × ${n/a}.`]);},
    ()=>{const g=PK([2,3,4,5,6,8,9,12]), a=g*PR(2,8), b=g*PR(2,8); if(a===b)return null; const h=pgcd(a,b), c=facs(a).filter(x=>b%x===0);
      return pq(T,"Find the highest common factor",`What is the highest common factor (HCF) of ${a} and ${b}?`,"n",h,
        [`Factors of ${a}: ${facs(a).join(", ")}.`,`Factors of ${b}: ${facs(b).join(", ")}.`,`Common factors: ${c.join(", ")}.`,`The highest is ${h}, so HCF = ${h}.`]);},
    ()=>{const a=PR(3,12), b=PR(3,15); if(a===b)return null; const l=a*b/pgcd(a,b), ma=[],mb=[];for(let k=1;k*a<=l;k++)ma.push(k*a);for(let k=1;k*b<=l;k++)mb.push(k*b);
      return pq(T,"Find the lowest common multiple",`What is the lowest common multiple (LCM) of ${a} and ${b}?`,"n",l,
        [`Multiples of ${a}: ${ma.join(", ")}…`,`Multiples of ${b}: ${mb.join(", ")}…`,`The first number in both lists is ${l}, so LCM = ${l}.`]);},
    ()=>{const [a,b]=PK([[24,36],[18,30],[20,30],[16,24],[12,18],[28,42],[30,45],[32,48],[36,48],[40,60]]), c=facs(a).filter(x=>b%x===0);
      const wrong=[facs(a).join(", "),c.slice(0,-1).join(", "),[...c,PK(facs(a).filter(x=>b%x))].sort((x,y)=>x-y).join(", ")];
      return pmc(T,"Use a Venn diagram of factors",`The factors of ${a} and the factors of ${b} are put in a Venn diagram. Which numbers go in the overlap?`,c.join(", "),wrong,
        [`Factors of ${a}: ${facs(a).join(", ")}.`,`Factors of ${b}: ${facs(b).join(", ")}.`,`The overlap holds the numbers in both lists: ${c.join(", ")}. (The biggest, ${c[c.length-1]}, is the HCF.)`],{f:{t:"p-venn2",A:`Factors of ${a}`,B:`Factors of ${b}`,plain:true}});},
    ()=>{const [a,b]=PK([[6,8],[4,10],[12,15],[6,9],[8,12],[10,15],[9,12],[14,21],[20,30],[6,10]]), l=a*b/pgcd(a,b);
      return pq(T,"Solve problems with HCF and LCM",`Bus A leaves every ${a} minutes and bus B every ${b} minutes. Both leave at 9:00. How many minutes until they next leave together?`,"n",l,
        [`They leave together at times that are multiples of both ${a} and ${b}: that is the LCM.`,`Multiples of ${a}: ${Array.from({length:l/a},(_,k)=>(k+1)*a).join(", ")}. Multiples of ${b}: ${Array.from({length:l/b},(_,k)=>(k+1)*b).join(", ")}.`,`LCM = ${l}, so after ${l} minutes.`],{u:"min"});},
    ()=>{const g=PK([3,4,5,6,8]), x=g*PR(3,9), y=g*PR(3,9); if(x===y)return null; const h=pgcd(x,y);
      return pq(T,"Solve problems with HCF and LCM",`${x} pencils and ${y} rubbers are shared into identical packs with none left over. What is the greatest number of packs?`,"n",h,
        [`The number of packs must divide both ${x} and ${y}: that is the HCF.`,`Factors of ${x}: ${facs(x).join(", ")}. Factors of ${y}: ${facs(y).join(", ")}.`,`HCF = ${h}, so ${h} packs.`]);},
  ];
  return PK(kinds)();
}

/* ---------- 5. tally charts, frequency tables and histograms ---------- */
function genFreq(){
  const T="Statistics";
  const [thing,unit,w,start]=PK([["apples","g",100,100],["parcels","g",100,200],["pupils' heights","cm",10,120],["journeys","min",10,0]]);
  const k=5, cls=Array.from({length:k},(_,i)=>[start+i*w,start+(i+1)*w]), f=cls.map(()=>PR(1,12));
  const lab=([a,b])=>`${a} ≤ x < ${b}`, tot=sum(f);
  const tally={t:"p-tally",head:[`${unit==="g"?"Mass":unit==="cm"?"Height":"Time"} (${unit})`,"Tally","Frequency"],rows:cls.map((c,i)=>[lab(c),f[i]])};
  const hist={t:"p-hist",title:`${thing[0].toUpperCase()+thing.slice(1)}`,unit,edges:[...cls.map(c=>c[0]),cls[k-1][1]],f};
  const kinds=[
    ()=>{const i=PR(0,k-1); return pq(T,"Read a tally chart",`The tally chart shows the ${thing}. What is the frequency for ${lab(cls[i])}?`,"n",f[i],
      [`Each ⧸ crossing four lines is a bundle of 5.`,`For ${lab(cls[i])}: ${Math.floor(f[i]/5)} bundle${Math.floor(f[i]/5)===1?"":"s"} of 5 and ${f[i]%5} more.`,`Frequency = ${Math.floor(f[i]/5)} × 5 + ${f[i]%5} = ${f[i]}.`],{f:{...tally,hide:true}});},
    ()=>{const i=PR(1,k-1), t=cls[i][0], s=f.slice(i);
      return pq(T,"Use cumulative frequency",`Use the ${Math.random()<.5?"frequency diagram":"tally chart"}. How many ${thing} are at least ${t} ${unit}?`,"n",sum(s),
        [`"At least ${t}" means ${t} or more: every group from ${lab(cls[i])} upwards.`,...(s.length>1?[`Those frequencies: ${s.join(", ")}.`,`Add them: ${s.join(" + ")} = ${sum(s)}.`]:[`That frequency is ${s[0]}, so the answer is ${s[0]}.`])],{f:Math.random()<.5?hist:tally});},
    ()=>{const i=PR(1,k-1), t=cls[i][0], s=f.slice(0,i);
      return pq(T,"Use cumulative frequency",`Use the frequency diagram. How many ${thing} are less than ${t} ${unit}?`,"n",sum(s),
        [`"Less than ${t}" means every group below ${t}: ${cls.slice(0,i).map(lab).join(", ")}.`,...(s.length>1?[`Those frequencies: ${s.join(", ")}.`,`Add them: ${s.join(" + ")} = ${sum(s)}.`]:[`That frequency is ${s[0]}, so the answer is ${s[0]}.`])],{f:hist});},
    ()=>{const mx=Math.max(...f); if(f.filter(x=>x===mx).length>1)return null; const i=f.indexOf(mx);
      return pmc(T,"Find the modal class","Use the frequency diagram. What is the modal class?",lab(cls[i]),cls.map(lab),
        [`The modal class is the tallest bar (the highest frequency).`,`Frequencies: ${cls.map((c,j)=>`${lab(c)}: ${f[j]}`).join("; ")}.`,`The highest is ${mx}: ${lab(cls[i])}.`],{f:hist});},
    ()=>pq(T,"Read a frequency diagram",`Use the frequency diagram. How many ${thing} were there altogether?`,"n",tot,
        [`Read the height of every bar: ${f.join(", ")}.`,`Add them: ${f.join(" + ")} = ${tot}.`],{f:hist}),
    ()=>{const i=PR(1,k-1), v=cls[i][0];
      return pmc(T,"Group continuous data",`One of the ${thing} measures exactly ${v} ${unit}. Which group does it go in?`,lab(cls[i]),[lab(cls[i-1]),...cls.filter((_,j)=>j!==i&&j!==i-1).map(lab)],
        [`Read the signs: a ≤ x < b includes a but not b.`,`${v} is not less than ${v}, so it does not go in ${lab(cls[i-1])}.`,`${v} ≤ x < ${cls[i][1]} includes ${v}: it goes in ${lab(cls[i])}.`]);},
    ()=>pmc(T,"Draw frequency diagrams","When you draw a frequency diagram for grouped continuous data (like masses or times), what must the bars do?","Touch, with no gaps between them",["Have equal gaps between them","Be different colours","Be drawn in order of height"],
        ["Continuous data has no gaps: one group ends exactly where the next begins.","So the bars sit side by side.","The bars must touch, with no gaps between them."]),
  ];
  return PK(kinds)();
}

const PAPER_TYPES=[
  {k:"bars",name:"Bar charts",about:"Compound and comparative bar charts: read the key, totals, differences",gen:genBars},
  {k:"stats",name:"Mean, median, range and mode",about:"Averages, comparing two sets of data, the modal class",gen:genStats},
  {k:"venn",name:"Divisibility and Venn diagrams",about:"Rules for 3, 4 and 9; sorting numbers into Venn diagrams",gen:genVenn},
  {k:"factors",name:"Factors, HCF and LCM",about:"Factor pairs, factor Venn diagrams, highest common factor, lowest common multiple",gen:genFactors},
  {k:"freq",name:"Tally charts and frequency diagrams",about:"Tallies, grouped data, histograms, \"at least\" questions",gen:genFreq},
];
const PAPER_BY=Object.fromEntries(PAPER_TYPES.map(p=>[p.k,p]));
let paperSeq=0;
/* A fresh set of n questions of one type (or all types mixed), registered in MQ for this session */
function paperSet(key,n=MTOPIC){
  const types=key==="mix"?PAPER_TYPES:[PAPER_BY[key]], ids=[], seen=new Set();
  for(let g=0;ids.length<n&&g<500;g++){
    const p=key==="mix"?types[ids.length%types.length]:types[0], q=p.gen();
    if(!q||seen.has(q.q+JSON.stringify(q.f||""))||(q.k==="n"&&!Number.isFinite(q.a)))continue;
    seen.add(q.q+JSON.stringify(q.f||"")); const id=`g:${p.k}:${Date.now().toString(36)}:${++paperSeq}`;
    MQ[id]={...q,id,gen:p.k}; ids.push(id);
  }
  return ids;
}
const paperStat=k=>MB().q["p:"+k]||{n:0,r:0};
function paperSection(){
  return `<div class="section-title"><h3 style="margin:0">Test paper practice</h3><span class="muted small">New numbers every time · step-by-step working</span></div>
    <div class="topics">${PAPER_TYPES.map(p=>{const s=paperStat(p.k);return `<button class="topic" data-paper="${p.k}" style="--tc:var(--c-purple)"><b>${esc(p.name)}</b><span class="muted small">${esc(p.about)}</span><span class="muted small">${s.n?`${Math.round(s.r/s.n*100)}% correct · ${s.n} answered`:"Not tried yet"}</span></button>`;}).join("")}
      <button class="topic" data-paper="mix" style="--tc:var(--c-purple)"><b>Whole paper mixed</b><span class="muted small">Two of each type</span><span class="muted small">${MTOPIC} questions</span></button></div>`;
}
function bindPaper(){
  document.querySelectorAll("#view [data-paper]").forEach(b=>b.onclick=()=>{
    const k=b.dataset.paper; openMaths({kind:"topic",topic:k==="mix"?"Test paper: mixed":`Test paper: ${PAPER_BY[k].name}`,ids:paperSet(k)});});
}

/* ---------- figures ---------- */
function paperFig(f){
  let s="", vb="0 0 380 250";
  const tx=(x,y,t,c="tick",a="middle")=>`<text x="${x}" y="${y}" text-anchor="${a}" class="${c}">${esc(t)}</text>`;
  if(f.t==="p-bar"){
    const L=44,R=360,T=44,B=200, totals=f.labels.map((_,i)=>f.mode==="stack"?f.series[0].values[i]+f.series[1].values[i]:Math.max(f.series[0].values[i],f.series[1].values[i]));
    const mx=Math.max(...totals), step=mx>40?10:mx>20?5:2, top=Math.ceil(mx/step)*step, Y=v=>B-v/top*(B-T), bw=(R-L)/f.labels.length;
    for(let v=0;v<=top;v+=step)s+=`<line x1="${L}" x2="${R}" y1="${Y(v)}" y2="${Y(v)}" class="${v?"grid":"axis"}"/>`+tx(L-6,Y(v)+4,String(v),"tick","end");
    f.labels.forEach((l,i)=>{const x=L+i*bw;
      if(f.mode==="stack"){const a=f.series[0].values[i],b=f.series[1].values[i],w=bw*.5,x0=x+bw*.25;
        s+=`<rect x="${x0}" y="${Y(a)}" width="${w}" height="${Y(0)-Y(a)}" class="p-s0"/><rect x="${x0}" y="${Y(a+b)}" width="${w}" height="${Y(a)-Y(a+b)}" class="p-s1"/>`;}
      else{const w=bw*.32;f.series.forEach((sr,j)=>{const v=sr.values[i];s+=`<rect x="${x+bw*.16+j*w}" y="${Y(v)}" width="${w}" height="${Y(0)-Y(v)}" class="p-s${j}"/>`;});}
      s+=tx(x+bw/2,B+18,l);});
    s=tx(L,16,f.title,"ttl","start")+f.series.map((sr,j)=>`<rect x="${L+j*120}" y="24" width="12" height="12" rx="2" class="p-s${j}"/>`+tx(L+j*120+18,34,sr.name,"tick","start")).join("")+s;
    vb="0 0 380 226";
  }else if(f.t==="p-venn2"){
    vb="0 0 360 230";
    s=`<rect x="6" y="6" width="348" height="218" rx="8" class="p-box"/><circle cx="135" cy="122" r="80" class="p-c0"/><circle cx="225" cy="122" r="80" class="p-c1"/>`
      +tx(110,30,f.A,"ttl")+tx(250,30,f.B,"ttl");
    if(!f.plain)s+=tx(95,128,"a","p-reg")+tx(180,128,"b","p-reg")+tx(265,128,"c","p-reg")+tx(28,212,"d","p-reg");
  }else if(f.t==="p-venn3"){
    vb="0 0 360 290";
    s=`<rect x="6" y="6" width="348" height="278" rx="8" class="p-box"/><circle cx="140" cy="115" r="72" class="p-c0"/><circle cx="220" cy="115" r="72" class="p-c1"/><circle cx="180" cy="183" r="72" class="p-c2"/>`
      +tx(80,34,f.A,"ttl")+tx(280,34,f.B,"ttl")+tx(180,276,f.C,"ttl");
    [["a",110,100],["b",250,100],["c",180,222],["d",180,88],["e",135,168],["f",225,168],["g",180,140],["h",26,272]].forEach(([l,x,y])=>s+=tx(x,y,l,"p-reg"));
  }else if(f.t==="p-hist"){
    const L=44,R=360,T=26,B=196, mx=Math.max(...f.f), step=mx>10?2:1, top=Math.ceil((mx+1)/step)*step, Y=v=>B-v/top*(B-T), n=f.f.length, bw=(R-L-10)/n;
    for(let v=0;v<=top;v+=step)s+=`<line x1="${L}" x2="${R}" y1="${Y(v)}" y2="${Y(v)}" class="${v?"grid":"axis"}"/>`+tx(L-6,Y(v)+4,String(v),"tick","end");
    f.f.forEach((v,i)=>s+=`<rect x="${L+5+i*bw}" y="${Y(v)}" width="${bw}" height="${Y(0)-Y(v)}" class="p-s0 p-hb"/>`);
    f.edges.forEach((e,i)=>s+=tx(L+5+i*bw,B+16,String(e)));
    s=tx(L,16,`${f.title}: frequency diagram`,"ttl","start")+s+tx((L+R)/2,B+34,`(${f.unit})`)+`<text x="12" y="${(T+B)/2}" transform="rotate(-90 12 ${(T+B)/2})" text-anchor="middle" class="tick">Frequency</text>`;
    vb="0 0 380 240";
  }else if(f.t==="p-tally"){
    const tal=n=>{let o="",x=4;for(let g=0;g<Math.floor(n/5);g++){for(let i=0;i<4;i++)o+=`<line x1="${x+i*6}" y1="4" x2="${x+i*6}" y2="22"/>`;o+=`<line x1="${x-3}" y1="20" x2="${x+21}" y2="6"/>`;x+=34;}for(let i=0;i<n%5;i++)o+=`<line x1="${x+i*6}" y1="4" x2="${x+i*6}" y2="22"/>`;return `<svg class="p-tal" viewBox="0 0 ${Math.max(40,x+(n%5)*6+6)} 26" height="26">${o}</svg>`;};
    return `<div class="m-table"><table><thead><tr>${f.head.map(h=>`<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${f.rows.map(([l,n])=>`<tr><td>${esc(l)}</td><td>${tal(n)}</td><td>${f.hide?"":n}</td></tr>`).join("")}</tbody></table></div>`;
  }
  return `<svg class="m-fig p-fig" viewBox="${vb}" role="img" aria-label="Diagram">${s}</svg>`;
}

/* ---------- step-by-step working ---------- */
function stepsHtml(steps,cls=""){return `<ol class="p-steps ${cls}">${steps.map((t,i)=>`<li style="--d:${i*.35}s">${mt(t)}</li>`).join("")}</ol>`;}

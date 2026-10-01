#!/usr/bin/env node
/* Builds readings.js from tools/readings/*.js and checks every article:
   unique ids, 6 questions each with 4 options and a valid answer, glossary words that really appear in the text,
   a known illustration theme, and a sensible length. Run from the repo root: node tools/build_readings.js */
const fs=require("fs"), path=require("path");
const dir=path.join(__dirname,"readings");
const THEMES=["sea","nature","cottage","rome","storm","arctic","bridge","victorian","volcano","sport","space","rain","forest","fossil","clockwork","garden",
  "castle","city","desert","ship","stage","lab","jungle","books","computer","poppy","music","mountain"];
const SKILLS=["Retrieval","Inference","Language","Structure","Summary","Evaluation","Vocabulary"];
let all=[], problems=0;
const warn=(id,msg)=>{problems++;console.log(`  ${id}: ${msg}`);};
for(const f of fs.readdirSync(dir).filter(f=>/^\d+\.js$/.test(f)).sort()){
  const part=require(path.join(dir,f));
  part.forEach(r=>r._file=f); all=all.concat(part);
}
const ids=new Set(), titles=new Set();
for(const r of all){
  const id=r.id||"(no id)";
  if(ids.has(id))warn(id,"duplicate id"); ids.add(id);
  if(titles.has(r.title))warn(id,"duplicate title"); titles.add(r.title);
  for(const k of ["title","kind","theme","text","glossary","questions"])if(!r[k])warn(id,"missing "+k);
  if(!THEMES.includes(r.theme))warn(id,"unknown theme "+r.theme);
  const text=r.text.join("\n"), words=text.split(/\s+/).length;
  if(r.kind!=="Poem"&&(words<250||words>750))warn(id,`length ${words} words`);
  const low=text.toLowerCase().replace(/[’'](?![a-z])/g," ").replace(/’/g,"'");
  for(const g of Object.keys(r.glossary)){
    const re=new RegExp("(^|[^a-z'-])"+g.toLowerCase().replace(/’/g,"'").replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"($|[^a-z'-])");
    if(!re.test(low))warn(id,`glossary word not in text: ${g}`);
  }
  if(Object.keys(r.glossary).length<4)warn(id,"glossary has fewer than 4 words");
  if(r.questions.length!==6)warn(id,`${r.questions.length} questions`);
  r.questions.forEach((q,i)=>{
    if(!Array.isArray(q.o)||q.o.length!==4)warn(id,`question ${i+1} needs 4 options`);
    if(!(q.a>=0&&q.a<q.o.length))warn(id,`question ${i+1} bad answer index`);
    if(new Set(q.o).size!==q.o.length)warn(id,`question ${i+1} duplicate options`);
    if(!SKILLS.includes(q.skill))warn(id,`question ${i+1} unknown skill ${q.skill}`);
    if(!q.why)warn(id,`question ${i+1} missing explanation`);
  });
}
// answer positions should be spread out, not always the same letter
const pos=[0,0,0,0]; all.forEach(r=>r.questions.forEach(q=>pos[q.a]++));
all.forEach(r=>delete r._file);
const out="/* Year 7 reading: "+all.length+" passages for a UK Year 7 reader (age 11–12), built from tools/readings by tools/build_readings.js.\n"+
  "   All passages are original except the poems marked with an author, which are out of copyright. Each has a glossary and six questions\n"+
  "   covering Key Stage 3 reading skills: retrieval, inference, language, structure, summary and evaluation. */\n\"use strict\";\nconst READINGS="+
  JSON.stringify(all)+";\nif(typeof module!==\"undefined\"&&module.exports)module.exports={READINGS};\n";
fs.writeFileSync(path.join(__dirname,"..","readings.js"),out);
const kinds={}; all.forEach(r=>kinds[r.kind]=(kinds[r.kind]||0)+1);
console.log(`${all.length} passages, ${Math.round(out.length/1024)} KB, ${problems} problems. Answer positions:`,pos.join("/"));
console.log(kinds);
if(problems)process.exitCode=1;

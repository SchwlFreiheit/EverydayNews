import fs from "node:fs/promises";
import { articlesA } from "../data/articles-a.js";
import { articlesB } from "../data/articles-b.js";
import { articlesC } from "../data/articles-c.js";
import { articlesD } from "../data/articles-d.js";

const articles=[...articlesA,...articlesB,...articlesC,...articlesD];
let errors=[];
const ids=new Set();

for(const a of articles){
  if(ids.has(a.id)) errors.push(`duplicate id: ${a.id}`);
  ids.add(a.id);
  if([...a.title].length>24) errors.push(`${a.id}: title too long (${[...a.title].length})`);
  if(/[。！？!?]$/.test(a.title)) errors.push(`${a.id}: title must not be a sentence`);
  if([...a.deck].length<20||[...a.deck].length>120) errors.push(`${a.id}: deck length ${[...a.deck].length}`);
  const vals=Object.values(a.scores||{});
  if(vals.length!==4||vals.some(v=>!Number.isInteger(v)||v<0||v>100)) errors.push(`${a.id}: invalid scores`);
  if(Math.max(...vals)-Math.min(...vals)<15) errors.push(`${a.id}: score axes are not differentiated`);
  const terms=a.terms||{};
  const texts=[];
  for(const mode of ["overview","explain","detail"]){
    if(!a[mode]?.sections?.length) errors.push(`${a.id}: missing ${mode}`);
    for(const s of a[mode]?.sections||[]){
      texts.push(...(s.paragraphs||[]));
      for(const p of s.points||[]) texts.push(p.label,p.text);
      if(s.callout) texts.push(s.callout.text);
      if(s.table){texts.push(...s.table.headers);for(const r of s.table.rows)texts.push(...r)}
    }
  }
  const refs=new Set(texts.flatMap(t=>[...t.matchAll(/\[\[([^|\]]+)\|[^\]]+\]\]/g)].map(m=>m[1])));
  for(const ref of refs) if(!terms[ref]) errors.push(`${a.id}: undefined term ${ref}`);
  for(const key of Object.keys(terms)) if(!refs.has(key)) errors.push(`${a.id}: unused term ${key}`);
  const intro=a.overview.sections[0]?.paragraphs?.[0]||"";
  if(intro.length<45) errors.push(`${a.id}: overview opening too thin`);
}

const index=await fs.readFile(new URL("../index.html",import.meta.url),"utf8");
const app=await fs.readFile(new URL("../assets/app.js",import.meta.url),"utf8");
for(const [name,text] of [["index.html",index],["assets/app.js",app]]){
  if(/parts\//.test(text)) errors.push(`${name}: legacy parts reference`);
  if(/document\.write/.test(text)) errors.push(`${name}: document.write forbidden`);
  if(/TreeWalker/.test(text)) errors.push(`${name}: blanket DOM text scanning forbidden`);
}
if(!/data\/articles-[a-d]\.js/.test(app)) errors.push("app.js: structured article modules not imported");

const axes=["importance","confidence","novelty","fit"];
for(const axis of axes){
  const vals=articles.map(a=>a.scores[axis]);
  const min=Math.min(...vals),max=Math.max(...vals);
  if(max-min<20) errors.push(`score axis ${axis}: global spread too small (${min}-${max})`);
}

if(errors.length){
  console.error("EverydayNews validation failed:");
  for(const e of errors) console.error(" -",e);
  process.exit(1);
}
console.log(`EverydayNews validation passed: ${articles.length} articles`);

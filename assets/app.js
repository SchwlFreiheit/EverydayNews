import { articlesA } from "../data/articles-a.js";
import { articlesB } from "../data/articles-b.js";
import { articlesC } from "../data/articles-c.js";
import { articlesD } from "../data/articles-d.js";

const articles=[...articlesA,...articlesB,...articlesC,...articlesD];

const feed=document.getElementById("feed");
const layer=document.getElementById("articleLayer");
const termPopover=document.getElementById("termPopover");
document.getElementById("articleCount").textContent=`${articles.length} ARTICLES`;

const ICONS={
  ai:'<circle cx="6" cy="12" r="2.2"/><circle cx="18" cy="6" r="2.2"/><circle cx="18" cy="18" r="2.2"/><path d="M8 11l7.8-4M8 13l7.8 4M18 8.2v7.6"/>',
  audio:'<path d="M3 12h2l2-6 3 12 3-15 3 12 2-6 3 3"/>',
  security:'<path d="M12 3 5 6v5c0 4.7 2.8 8 7 10 4.2-2 7-5.3 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-5"/>',
  space:'<circle cx="12" cy="12" r="3"/><path d="M3 12c3-5 15-7 18-2 2 4-5 8-11 9-4 .5-7-1-7-3"/><path d="m18.5 4 .6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6.6-1.6Z"/>',
  neuro:'<path d="M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-2 3c0 1.3.8 2.5 2 3v1a3 3 0 0 0 3 3c1.3 0 2.4-.8 3-1.8V6A3 3 0 0 0 9 4Z"/><path d="M15 4a3 3 0 0 1 3 3v1a3 3 0 0 1 2 3c0 1.3-.8 2.5-2 3v1a3 3 0 0 1-3 3c-1.3 0-2.4-.8-3-1.8V6A3 3 0 0 1 15 4Z"/>',
  chemistry:'<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3"/><path d="M7.5 16h9"/>',
  robot:'<rect x="5" y="7" width="14" height="11" rx="3"/><path d="M12 3v4M8.5 12h.01M15.5 12h.01M9 16h6M3 11v4M21 11v4"/>',
  chip:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 9h6v6H9zM9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
  image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m4 18 5-5 3 3 3-4 5 6"/>',
  physics:'<circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="9" ry="3.5"/><ellipse cx="12" cy="12" rx="3.5" ry="9" transform="rotate(35 12 12)"/>',
  bio:'<path d="M7 3c6 2 4 7 10 9M17 21c-6-2-4-7-10-9M8 5l7 3M6 10l12 5M9 16l7 3"/>',
  watch:'<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2M8 3l-2-2M16 3l2-2"/>'
};

function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function icon(kind,label){return `<span class="genre-icon" title="${esc(label)}" aria-label="${esc(label)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[kind]||ICONS.ai}</svg></span>`}

function rich(text,article){
  const re=/\[\[([^|\]]+)\|([^\]]+)\]\]|<<(core|proof|warn|risk)\|([^>]+)>>/g;
  let out="",last=0,m;
  while((m=re.exec(text))){
    out+=esc(text.slice(last,m.index));
    if(m[1]){
      const key=m[1],label=m[2],term=article.terms?.[key];
      if(term) out+=`<button class="term" data-term="${esc(key)}">${esc(label)}</button>`;
      else out+=esc(label);
    }else{
      out+=`<span class="semantic-${m[3]}">${esc(m[4])}</span>`;
    }
    last=re.lastIndex;
  }
  out+=esc(text.slice(last));
  return out;
}
function scoreRings(scores){
  const defs=[["i","重要度",scores.importance],["c","確度",scores.confidence],["n","新規性",scores.novelty],["f","関連度",scores.fit]];
  return `<div class="score-rings">${defs.map(([c,l,v])=>`<span class="score-ring ${c}" style="--score:${v}" data-label="${l}" data-score="${v}" aria-label="${l} ${v}"><span>${v}</span></span>`).join("")}</div>`;
}
function storyCard(a){
  return `<button class="story" data-open="${esc(a.id)}" style="--accent:${a.accent}">
    <div class="story-top">
      <div class="story-meta">${icon(a.genre,a.genreLabel)}<span class="story-date">${esc(a.date)}</span></div>
      ${scoreRings(a.scores)}
    </div>
    <h2>${esc(a.title)}</h2>
    <p>${esc(a.deck)}</p>
  </button>`;
}
function mediaBlock(media){
  if(!media)return "";
  if(media.type==="image") return `<figure class="media-block">
    <div class="media-head"><strong>${esc(media.label)}</strong>${media.source?`<a href="${esc(media.source)}" target="_blank" rel="noopener">原典 ↗</a>`:""}</div>
    <img src="${esc(media.url)}" alt="${esc(media.alt||"")}" loading="lazy">
    <figcaption class="media-caption">${esc(media.caption)}</figcaption>
  </figure>`;
  if(media.type==="video") return `<figure class="media-block">
    <div class="media-head"><strong>${esc(media.label)}</strong>${media.source?`<a href="${esc(media.source)}" target="_blank" rel="noopener">原典 ↗</a>`:""}</div>
    <video controls preload="metadata" src="${esc(media.url)}"></video>
    <figcaption class="media-caption">${esc(media.caption)}</figcaption>
  </figure>`;
  if(media.type==="link") return `<div class="callout"><strong>${esc(media.label)}</strong><br>${esc(media.caption)} ${media.source?`<a href="${esc(media.source)}" target="_blank" rel="noopener">実物を見る ↗</a>`:""}</div>`;
  return "";
}
function factRows(points,article){
  if(!points?.length)return "";
  return `<div class="fact-list">${points.map(x=>`<div class="fact-row"><strong>${rich(x.label,article)}</strong><span>${rich(x.text,article)}</span></div>`).join("")}</div>`;
}
function sectionBlocks(sections,article){
  return (sections||[]).map((s,i)=>`<section class="article-section" id="sec-${i}">
    ${s.title?`<h2>${esc(s.title)}</h2>`:""}
    ${(s.paragraphs||[]).map((p,j)=>`<p class="${i===0&&j===0?"lead":""}">${rich(p,article)}</p>`).join("")}
    ${s.points?factRows(s.points,article):""}
    ${s.callout?`<div class="callout ${esc(s.callout.kind||"")}">${rich(s.callout.text,article)}</div>`:""}
    ${s.table?tableBlock(s.table,article):""}
    ${s.media?mediaBlock(s.media):""}
  </section>`).join("");
}
function tableBlock(table,article){
  return `<table class="article-table"><thead><tr>${table.headers.map(x=>`<th>${rich(x,article)}</th>`).join("")}</tr></thead><tbody>${table.rows.map(row=>`<tr>${row.map(x=>`<td>${rich(x,article)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}
function sourceBlock(a){
  if(!a.sources?.length)return "";
  return `<div class="sources">${a.sources.map(s=>`<a class="source" href="${esc(s.url)}" target="_blank" rel="noopener"><strong>${esc(s.label)}</strong><span>${esc(s.note||"")}</span></a>`).join("")}</div>`;
}
function feedbackBlock(a){
  const key=`everyday-feedback:${a.id}`;
  let state={};
  try{state=JSON.parse(localStorage.getItem(key)||"{}")}catch{}
  const b=(name,label)=>`<button data-fb="${name}" class="${state[name]?"on":""}">${label}</button>`;
  return `<div class="feedback" data-feedback="${a.id}">
    <strong>この記事への反応</strong>
    <div class="feedback-row">${b("saved","保存")}${b("known","既知")}${b("track","追跡")}${b("hide","興味なし")}</div>
    <div class="feedback-row interest" aria-label="興味度">
      ${[1,2,3,4,5].map(n=>`<button data-interest="${n}" class="${state.interest===n?"on":""}" aria-label="興味度 ${n}">${n}</button>`).join("")}
    </div>
  </div>`;
}
function renderMode(a,mode){
  const data=a[mode];
  const sections=sectionBlocks(data.sections,a);
  const toc=(data.sections||[]).map((s,i)=>s.title?`<a href="#sec-${i}">${esc(s.title)}</a>`:"").join("");
  return `<div class="article-body"><main class="article-main">${sections}${sourceBlock(a)}${feedbackBlock(a)}</main><aside class="toc"><h3>${mode==="overview"?"概要":mode==="explain"?"解説":"詳細"}</h3>${toc}</aside></div>`;
}
function articleHtml(a){
  return `<div class="article-overlay" data-article="${esc(a.id)}" style="--accent:${a.accent}">
    <div class="article-shell">
      <div class="article-nav">
        <div class="article-nav-left">${icon(a.genre,a.genreLabel)}<strong>EverydayNews</strong></div>
        <div class="depth-switch">
          <button data-mode="overview" class="active">概要</button>
          <button data-mode="explain">解説</button>
          <button data-mode="detail">詳細</button>
        </div>
        <button class="close-article" aria-label="閉じる">×</button>
      </div>
      <header class="article-head">
        <div>
          <div class="article-kicker">${esc(a.meta)}</div>
          <h1>${esc(a.title)}</h1>
          <p class="article-deck">${esc(a.articleDeck||a.deck)}</p>
        </div>
        <aside class="article-aside">
          ${scoreRings(a.scores)}
          <div class="article-actions">
            <button data-copy>Chat用コピー</button>
            <button data-save>保存</button>
          </div>
        </aside>
      </header>
      <div data-mode-host>${renderMode(a,"overview")}</div>
    </div>
  </div>`;
}
function openArticle(id){
  const a=articles.find(x=>x.id===id);if(!a)return;
  layer.innerHTML=articleHtml(a);
  document.body.style.overflow="hidden";
  const overlay=layer.querySelector(".article-overlay");
  overlay.querySelector(".close-article").addEventListener("click",closeArticle);
  overlay.querySelectorAll("[data-mode]").forEach(btn=>btn.addEventListener("click",()=>{
    overlay.querySelectorAll("[data-mode]").forEach(x=>x.classList.toggle("active",x===btn));
    overlay.querySelector("[data-mode-host]").innerHTML=renderMode(a,btn.dataset.mode);
    bindArticleInteractions(a,overlay);
    overlay.scrollTo({top:0,behavior:"instant"});
  }));
  bindArticleInteractions(a,overlay);
}
function closeArticle(){layer.innerHTML="";document.body.style.overflow="";hideTerm()}
function bindArticleInteractions(a,overlay){
  overlay.querySelectorAll(".term").forEach(el=>el.addEventListener("click",e=>showTerm(e,a)));
  overlay.querySelector("[data-copy]")?.addEventListener("click",async e=>{
    await navigator.clipboard.writeText(a.chatPrompt||`「${a.title}」について、原典・条件・限界まで含めて詳しく説明して。`);
    e.currentTarget.textContent="コピー済み";
  });
  const save=overlay.querySelector("[data-save]");
  if(save){
    const k=`everyday-feedback:${a.id}`;let st={};try{st=JSON.parse(localStorage.getItem(k)||"{}")}catch{}
    save.classList.toggle("on",!!st.saved);
    save.addEventListener("click",()=>{let s={};try{s=JSON.parse(localStorage.getItem(k)||"{}")}catch{};s.saved=!s.saved;localStorage.setItem(k,JSON.stringify(s));save.classList.toggle("on",s.saved)});
  }
  overlay.querySelectorAll("[data-fb]").forEach(btn=>btn.addEventListener("click",()=>{
    const k=`everyday-feedback:${a.id}`;let s={};try{s=JSON.parse(localStorage.getItem(k)||"{}")}catch{};
    s[btn.dataset.fb]=!s[btn.dataset.fb];localStorage.setItem(k,JSON.stringify(s));btn.classList.toggle("on",s[btn.dataset.fb]);
  }));
  overlay.querySelectorAll("[data-interest]").forEach(btn=>btn.addEventListener("click",()=>{
    const k=`everyday-feedback:${a.id}`;let s={};try{s=JSON.parse(localStorage.getItem(k)||"{}")}catch{};
    s.interest=Number(btn.dataset.interest);localStorage.setItem(k,JSON.stringify(s));
    overlay.querySelectorAll("[data-interest]").forEach(x=>x.classList.toggle("on",x===btn));
  }));
}
function showTerm(e,a){
  e.stopPropagation();
  const key=e.currentTarget.dataset.term,t=a.terms?.[key];if(!t)return;
  termPopover.innerHTML=`<h4>${esc(t.title)}</h4>${t.original?`<div class="term-original">${esc(t.original)}</div>`:""}<p>${esc(t.description)}</p>`;
  termPopover.hidden=false;
  const r=e.currentTarget.getBoundingClientRect();
  const w=360,margin=12;
  let left=Math.min(window.innerWidth-w-margin,Math.max(margin,r.left));
  let top=r.bottom+8;if(top+220>window.innerHeight)top=Math.max(margin,r.top-190);
  termPopover.style.left=`${left}px`;termPopover.style.top=`${top}px`;
}
function hideTerm(){termPopover.hidden=true}
document.addEventListener("click",e=>{if(!termPopover.hidden&&!termPopover.contains(e.target)&&!e.target.closest(".term"))hideTerm()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){if(!termPopover.hidden)hideTerm();else if(layer.firstChild)closeArticle()}});

feed.innerHTML=articles.map(storyCard).join("");
feed.querySelectorAll("[data-open]").forEach(b=>b.addEventListener("click",()=>openArticle(b.dataset.open)));

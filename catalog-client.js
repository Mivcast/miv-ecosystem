(() => {
 const previousSections=structuredClone(EVOLUTION_DATA);
 function toEvolution(sections){return sections.map(s=>({...s,cards:s.cards.map(c=>({...c,qs:c.qs.map(q=>Object.assign([q.text,'',q.why],q))}))}));}
 function apply(sections){
  if(!Array.isArray(sections)||sections.length!==4||sections.some((s,si)=>s.id!==EVOLUTION_DATA[si]?.id||s.cards?.length!==5||s.cards.some((c,ci)=>c.id!==EVOLUTION_DATA[si].cards[ci]?.id||c.qs?.length!==3||c.qs.some((q,qi)=>q.id!==EVOLUTION_DATA[si].cards[ci].qs[qi]?.id))))return false;
  EVOLUTION_DATA.splice(0,EVOLUTION_DATA.length,...toEvolution(sections));return true;
 }
 MIV_DIAGNOSIS_EDITION.sections.forEach((s,si)=>{
  const section=EVOLUTION_DATA[si];section.title=s.title;section.desc=s.subtitle;section.intro=s.intro;
  section.cards.forEach((c,ci)=>{const edit=s.cards[ci];c.desc=edit.desc;c.qs.forEach((q,qi)=>{const [text,summary,assessment,keywords]=edit.qs[qi];q[0]=text;q.text=text;Object.assign(q,{summary,assessment,keywords});});});
 });
 window.MivCatalog={previousSections,toEvolution,revision:1};
 if(['http:','https:'].includes(location.protocol))fetch('/api/diagnoses?action=catalog',{cache:'no-store'}).then(async r=>{if(!r.ok)return;const data=await r.json();if(apply(data.sections)){MivCatalog.revision=data.revision;window.MivEvolution?.render();}}).catch(()=>{});
})();

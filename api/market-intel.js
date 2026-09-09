const send=(res,status,body)=>{res.setHeader('Cache-Control','no-store');return res.status(status).json(body)};
const clean=(v,max=4000)=>String(v??'').trim().slice(0,max);
function safeJson(text){try{return JSON.parse(text)}catch(e){const m=String(text||'').match(/\{[\s\S]*\}|\[[\s\S]*\]/);if(m){try{return JSON.parse(m[0])}catch(err){return null}}return null}}
async function sbFetch(url,key,path,opt={}){return fetch(`${url}/rest/v1/${path}`,{...opt,headers:{apikey:key,'Content-Type':'application/json',...(opt.headers||{})}})}
async function rows(url,key,path){const r=await sbFetch(url,key,path);const data=await r.json().catch(()=>[]);if(!r.ok)throw new Error(`Supabase ${r.status}: ${JSON.stringify(data).slice(0,400)}`);return Array.isArray(data)?data:[]}
function extractSources(data){const out=[],seen=new Set();for(const c of data?.candidates||[])for(const g of c?.groundingMetadata?.groundingChunks||[]){const w=g?.web;if(w?.uri&&!seen.has(w.uri)){seen.add(w.uri);out.push({title:w.title||w.uri,url:w.uri})}}return out.slice(0,12)}
async function getContext(su,sk,userId){
 const settings=(await rows(su,sk,'mark_ai_settings?id=eq.global&select=*'))[0]||{};
 const membership=(await rows(su,sk,`company_users?user_id=eq.${userId}&select=company_id,created_at&order=created_at.asc&limit=1`))[0]||null;
 let company=null,profile=null;
 if(membership?.company_id){
  company=(await rows(su,sk,`companies?id=eq.${membership.company_id}&select=id,name,niche,subniche,city,state&limit=1`))[0]||null;
  profile=(await rows(su,sk,`company_profiles?company_id=eq.${membership.company_id}&select=*&limit=1`))[0]||null;
 }
 return {settings,company,profile};
}
function companyText(company,profile,niche){return [
 `Empresa: ${company?.name||'não informada'}`,
 `Nicho solicitado: ${niche||company?.niche||'não informado'}`,
 `Nicho cadastrado: ${company?.niche||'não informado'}`,
 `Subnicho cadastrado: ${company?.subniche||'não informado'}`,
 `Cidade/UF: ${[company?.city,company?.state].filter(Boolean).join('/')||'não informada'}`,
 `Produtos/serviços: ${profile?.products_services||'não informado'}`,
 `Público: ${profile?.target_audience||'não informado'}`,
 `Objetivos: ${profile?.current_goals||'não informado'}`
].join('\n')}
async function generate(gk,model,prompt,maxOutputTokens=5200){
 const body={contents:[{role:'user',parts:[{text:prompt}]}],tools:[{google_search:{}}],generationConfig:{temperature:0.25,maxOutputTokens,responseMimeType:'application/json'}};
 const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,{method:'POST',headers:{'x-goog-api-key':gk,'Content-Type':'application/json'},body:JSON.stringify(body)});
 const data=await r.json().catch(()=>({}));
 if(!r.ok){console.error('[MARKET INTEL]',r.status,JSON.stringify(data).slice(0,1200));throw new Error('Não foi possível pesquisar o mercado agora.')}
 const text=(data.candidates?.[0]?.content?.parts||[]).map(p=>p.text||'').join('').trim();
 return {obj:safeJson(text)||{},sources:extractSources(data),model};
}
function cleanTrend(x,i){return {title:clean(x.title,160),description:clean(x.description,520),mark_strategy:clean(x.mark_strategy||x.strategy,720),importance:Math.max(0,Math.min(5,Number(x.importance)||3)),source:clean(x.source,140),source_url:clean(x.source_url||x.url,600)}}
function cleanCard(x,i){return {competitor:clean(x.competitor,120),title:clean(x.title,180),description:clean(x.description,520),mark_strategy:clean(x.mark_strategy||x.strategy,720),importance:Math.max(0,Math.min(5,Number(x.importance)||3)),source:clean(x.source,140),source_url:clean(x.source_url||x.url,600)}}
module.exports=async function handler(req,res){
 if(req.method!=='POST')return send(res,405,{error:'Método não permitido.'});
 try{
  const su=process.env.SUPABASE_URL,pk=process.env.SUPABASE_PUBLISHABLE_KEY,sk=process.env.SUPABASE_SECRET_KEY,gk=process.env.GEMINI_API_KEY;
  if(!su||!pk||!sk||!gk)return send(res,500,{error:'Configuração incompleta do servidor.'});
  const auth=String(req.headers.authorization||''),token=auth.startsWith('Bearer ')?auth.slice(7):'';
  if(!token)return send(res,401,{error:'Entre na sua conta para pesquisar tendências e concorrentes.'});
  const ur=await fetch(`${su}/auth/v1/user`,{headers:{apikey:pk,Authorization:`Bearer ${token}`}});
  if(!ur.ok)return send(res,401,{error:'Sua sessão expirou. Entre novamente.'});
  const user=await ur.json(),action=clean(req.body?.action,40);
  const {settings,company,profile}=await getContext(su,sk,user.id);
  let model=/^[a-zA-Z0-9._-]+$/.test(settings.model_name||'')?settings.model_name:'gemini-3.8-flash';
  if(model==='gemini-2.5-flash')model='gemini-3.8-flash';
  const niche=clean(req.body?.niche,240)||company?.subniche||company?.niche||'negócios locais';
  const today=new Date().toISOString().slice(0,10);
  if(action==='trends'){
   const limit=Math.max(5,Math.min(30,Number(req.body?.limit)||30));
   const prompt=`Hoje é ${today}. Pesquise na web tendências, notícias, mudanças de comportamento, tecnologia, regulação, consumo, marketing e oportunidades atuais no Brasil que sejam úteis para o nicho abaixo. Use fontes confiáveis e recentes quando possível.\n\n${companyText(company,profile,niche)}\n\nRetorne SOMENTE JSON válido no formato {"trends":[{"title":"...","description":"...","mark_strategy":"...","importance":0-5,"source":"nome do site","source_url":"https://..."}]}.\nCrie exatamente ${limit} cards. Cada card deve explicar por que o assunto importa e como usar a tendência no negócio. Não invente cura, lei, número ou fato específico sem fonte.`;
   const {obj,sources,model:used}=await generate(gk,model,prompt,6400);
   const trends=(Array.isArray(obj.trends)?obj.trends:[]).map(cleanTrend).filter(x=>x.title&&x.description).slice(0,limit);
   return send(res,200,{trends,sources,model:used});
  }
  if(action==='competitors'||action==='suggest_competitors'){
   const max=Math.max(1,Math.min(10,Number(req.body?.limit)||1));
   const names=(Array.isArray(req.body?.competitors)?req.body.competitors:[]).map(x=>clean(x,120)).filter(Boolean).slice(0,max);
   const prompt=action==='suggest_competitors'
    ?`Hoje é ${today}. Pesquise referências e concorrentes prováveis no Brasil para o nicho abaixo. Sugira até ${max} nomes que uma empresa poderia acompanhar e gere movimentos observáveis, ideias de conteúdo, oferta, presença digital ou posicionamento.\n\n${companyText(company,profile,niche)}\n\nRetorne SOMENTE JSON válido: {"competitors":["..."],"cards":[{"competitor":"...","title":"...","description":"...","mark_strategy":"...","importance":0-5,"source":"nome do site","source_url":"https://..."}]}. Gere até 3 cards por concorrente.`
    :`Hoje é ${today}. Pesquise na web novidades e movimentos públicos dos concorrentes abaixo para inspirar uma empresa do nicho informado. Não invente ações específicas sem fonte; se não encontrar fato recente, transforme em observação estratégica segura.\n\n${companyText(company,profile,niche)}\nConcorrentes: ${names.length?names.join(', '):'não informados'}\n\nRetorne SOMENTE JSON válido: {"cards":[{"competitor":"...","title":"...","description":"...","mark_strategy":"...","importance":0-5,"source":"nome do site","source_url":"https://..."}]}. Gere até 3 cards por concorrente.`;
   const {obj,sources,model:used}=await generate(gk,model,prompt,5200);
   const competitors=(Array.isArray(obj.competitors)?obj.competitors:[]).map(x=>clean(x,120)).filter(Boolean).slice(0,max);
   const cards=(Array.isArray(obj.cards)?obj.cards:[]).map(cleanCard).filter(x=>x.title&&x.description).slice(0,max*3);
   return send(res,200,{competitors,cards,sources,model:used});
  }
  return send(res,400,{error:'Ação inválida.'});
 }catch(e){console.error('[MARKET INTEL]',e);return send(res,500,{error:e.message||'Não foi possível pesquisar o mercado agora.'})}
};

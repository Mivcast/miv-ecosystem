const send=(res,status,body)=>{res.setHeader('Cache-Control','no-store');return res.status(status).json(body)};
const clean=(v,max=50000)=>String(v??'').trim().slice(0,max);
async function sbFetch(url,key,path,opt={}){return fetch(`${url}/rest/v1/${path}`,{...opt,headers:{apikey:key,'Content-Type':'application/json',...(opt.headers||{})}})}
async function rows(url,key,path){const r=await sbFetch(url,key,path);const data=await r.json().catch(()=>[]);if(!r.ok)throw new Error(`Supabase ${r.status}: ${JSON.stringify(data).slice(0,400)}`);return Array.isArray(data)?data:[]}
function safeJson(text){try{return JSON.parse(text)}catch(e){const m=String(text||'').match(/\{[\s\S]*\}|\[[\s\S]*\]/);if(m)try{return JSON.parse(m[0])}catch(_){ }return null}}
function extractSources(data){const out=[],seen=new Set();for(const c of data?.candidates||[])for(const g of c?.groundingMetadata?.groundingChunks||[]){const w=g?.web;if(w?.uri&&!seen.has(w.uri)){seen.add(w.uri);out.push({title:w.title||w.uri,url:w.uri})}}return out.slice(0,8)}
async function getContext(su,sk,userId){
  const settings=(await rows(su,sk,'mark_ai_settings?id=eq.global&select=*'))[0]||{};
  const membership=(await rows(su,sk,`company_users?user_id=eq.${userId}&select=company_id,created_at&order=created_at.asc&limit=1`))[0]||null;
  let company=null,profile=null;if(membership?.company_id){company=(await rows(su,sk,`companies?id=eq.${membership.company_id}&select=id,name,niche,subniche,city,state&limit=1`))[0]||null;profile=(await rows(su,sk,`company_profiles?company_id=eq.${membership.company_id}&select=*&limit=1`))[0]||null}
  return {settings,company,profile};
}
async function hasPaidAccess(su,sk,userId){
  const now=new Date().toISOString();
  const subs=await rows(su,sk,`user_subscriptions?user_id=eq.${userId}&status=eq.active&select=plan,current_period_end&order=created_at.desc&limit=1`);
  const s=subs[0];if(s&&['pro','premium'].includes(s.plan)&&(!s.current_period_end||s.current_period_end>now))return true;
  const buys=await rows(su,sk,`user_purchases?user_id=eq.${userId}&status=eq.paid&item_id=in.(calendario,tool-calendario)&select=id&limit=1`);return buys.length>0;
}
function companyText(company,profile,niche,city){return [
  `Empresa: ${company?.name||'não informada'}`,`Nicho: ${niche||company?.niche||'não informado'}`,`Subnicho: ${company?.subniche||'não informado'}`,`Cidade/UF: ${city||[company?.city,company?.state].filter(Boolean).join('/')||'não informada'}`,
  `Produtos/serviços: ${profile?.products_services||'não informado'}`,`Público: ${profile?.target_audience||'não informado'}`,`Objetivos: ${profile?.current_goals||'não informado'}`
].join('\n')}
module.exports=async function handler(req,res){
  if(req.method!=='POST')return send(res,405,{error:'Método não permitido.'});
  try{
    const su=process.env.SUPABASE_URL,pk=process.env.SUPABASE_PUBLISHABLE_KEY,sk=process.env.SUPABASE_SECRET_KEY,gk=process.env.GEMINI_API_KEY;if(!su||!pk||!sk||!gk)return send(res,500,{error:'Configuração incompleta do servidor.'});
    const auth=String(req.headers.authorization||''),token=auth.startsWith('Bearer ')?auth.slice(7):'';if(!token)return send(res,401,{error:'Entre na sua conta para usar os recursos inteligentes do calendário.'});
    const ur=await fetch(`${su}/auth/v1/user`,{headers:{apikey:pk,Authorization:`Bearer ${token}`}});if(!ur.ok)return send(res,401,{error:'Sua sessão expirou. Entre novamente.'});const user=await ur.json();
    const action=clean(req.body?.action,40),{settings,company,profile}=await getContext(su,sk,user.id);let model=/^[a-zA-Z0-9._-]+$/.test(settings.model_name||'')?settings.model_name:'gemini-3.8-flash';if(model==='gemini-2.5-flash')model='gemini-3.8-flash';
    const niche=clean(req.body?.niche,300)||company?.niche||'',city=clean(req.body?.city,300)||[company?.city,company?.state].filter(Boolean).join(' / '),year=Math.max(2025,Math.min(2032,Number(req.body?.year)||new Date().getFullYear())),month=Math.max(1,Math.min(12,Number(req.body?.month)||new Date().getMonth()+1));
    if(action==='discover_events'){
      const prompt=`Você está abastecendo um calendário de marketing empresarial no Brasil. Pesquise na web eventos e datas REAIS e úteis para ${calMonth(month)}/${year}, priorizando: (1) datas específicas do nicho/subnicho; (2) eventos, aniversários municipais, feiras, festivais ou acontecimentos relevantes de ${city||'cidade não informada'}; (3) datas comerciais/setoriais que não estejam em calendários nacionais óbvios.\n\n${companyText(company,profile,niche,city)}\n\nRetorne SOMENTE JSON válido no formato {"events":[{"date":"YYYY-MM-DD","name":"...","type":"niche|city|sector","relevance":"high|medium|low","reason":"explicação curta"}]}. Inclua no máximo 12 eventos. Não invente evento local; se não conseguir confirmar, não inclua. Datas devem pertencer ao mês solicitado.`;
      const body={contents:[{role:'user',parts:[{text:prompt}]}],tools:[{google_search:{}}],generationConfig:{temperature:0.15,maxOutputTokens:2200,responseMimeType:'application/json'}};
      const gr=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,{method:'POST',headers:{'x-goog-api-key':gk,'Content-Type':'application/json'},body:JSON.stringify(body)});const gd=await gr.json().catch(()=>({}));if(!gr.ok){console.error('[CAL discover]',gr.status,JSON.stringify(gd).slice(0,1000));return send(res,502,{error:'Não foi possível pesquisar eventos agora.'})}
      const text=(gd.candidates?.[0]?.content?.parts||[]).map(p=>p.text||'').join('').trim(),obj=safeJson(text)||{},events=(Array.isArray(obj.events)?obj.events:[]).map(e=>({date:clean(e.date,10),name:clean(e.name,300),type:['niche','city','sector'].includes(e.type)?e.type:'sector',relevance:['high','medium','low'].includes(e.relevance)?e.relevance:'medium',reason:clean(e.reason,600)})).filter(e=>/^\d{4}-\d{2}-\d{2}$/.test(e.date)&&Number(e.date.slice(0,4))===year&&Number(e.date.slice(5,7))===month&&e.name).slice(0,12);
      return send(res,200,{events,sources:extractSources(gd),model});
    }
    if(action==='generate_ideas'){
      if(!(await hasPaidAccess(su,sk,user.id)))return send(res,403,{error:'Ideias completas do calendário são liberadas nos planos pagos.',code:'paid_required'});
      const event=clean(req.body?.event,400),date=clean(req.body?.date,20),reason=clean(req.body?.reason,1000),objective=clean(req.body?.objective,600);
      if(!event)return send(res,400,{error:'Escolha uma data/evento.'});
      const methodology=clean(settings.methodology,18000),owner=clean(settings.owner_knowledge,10000);
      const prompt=`Crie uma oportunidade de marketing contextual para a empresa abaixo usando a data escolhida. Priorize a metodologia do proprietário e evite promoções forçadas. Se a conexão com o negócio for fraca, proponha conteúdo institucional, relacionamento, educação ou simplesmente diga que não vale priorizar.\n\nMETODOLOGIA: ${methodology||'Planejamento contextual, relevância antes de promoção e execução prática.'}\nCONHECIMENTO DO PROPRIETÁRIO: ${owner||'não cadastrado'}\n${companyText(company,profile,niche,city)}\nEVENTO: ${event}\nDATA: ${date}\nRELAÇÃO JÁ IDENTIFICADA: ${reason||'não informada'}\nOBJETIVO ADICIONAL: ${objective||'não informado'}\n\nRetorne SOMENTE JSON válido: {"strategy":"...","creative_ideas":["..."],"campaign":{"name":"...","objective":"...","mechanic":"..."},"copy":"...","cta":"...","channels":["..."],"timing":["..."],"avoid":["..."]}. Seja específico e aplicável.`;
      const body={contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{temperature:0.45,maxOutputTokens:2200,responseMimeType:'application/json'}};
      const gr=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,{method:'POST',headers:{'x-goog-api-key':gk,'Content-Type':'application/json'},body:JSON.stringify(body)});const gd=await gr.json().catch(()=>({}));if(!gr.ok){console.error('[CAL ideas]',gr.status,JSON.stringify(gd).slice(0,1000));return send(res,502,{error:'Não foi possível gerar as ideias agora.'})}
      const text=(gd.candidates?.[0]?.content?.parts||[]).map(p=>p.text||'').join('').trim(),obj=safeJson(text);if(!obj)return send(res,502,{error:'A IA retornou conteúdo em formato inesperado.'});return send(res,200,{idea:obj,model});
    }
    return send(res,400,{error:'Ação inválida.'});
  }catch(e){console.error('[CALENDAR.IA]',e);return send(res,500,{error:'Não foi possível executar o calendário inteligente agora.'})}
};
function calMonth(m){return ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'][m-1]||m}

const send=(res,status,body)=>{res.setHeader('Cache-Control','no-store');return res.status(status).json(body)};
const clean=(v,max=50000)=>String(v??'').trim().slice(0,max);
async function sbFetch(url,key,path,opt={}){return fetch(`${url}/rest/v1/${path}`,{...opt,headers:{apikey:key,'Content-Type':'application/json',...(opt.headers||{})}})}
async function rows(url,key,path){const r=await sbFetch(url,key,path);const data=await r.json().catch(()=>[]);if(!r.ok)throw new Error(`Supabase ${r.status}: ${JSON.stringify(data).slice(0,300)}`);return Array.isArray(data)?data:[]}
function companyBlock(company,profile){
  const fields={empresa:company?.name,nicho:company?.niche,subnicho:company?.subniche,cidade:company?.city,estado:company?.state,responsavel:profile?.owner_name,area_de_atuacao:profile?.service_area,produtos_servicos:profile?.products_services,publico:profile?.target_audience,ticket_medio:profile?.average_ticket,equipe:profile?.team_size,diferenciais:profile?.differentials,objetivos:profile?.current_goals,dificuldades:profile?.main_difficulties,canais:profile?.current_channels,outras_informacoes:profile?.other_info};
  return Object.entries(fields).filter(([,v])=>v!==null&&v!==undefined&&String(v).trim()!=='').map(([k,v])=>`${k}: ${v}`).join('\n')||'Perfil empresarial ainda pouco preenchido.';
}
async function hasAnalysisAiAccess(su,sk,userId){
  const now=new Date().toISOString();
  const subs=await rows(su,sk,`user_subscriptions?user_id=eq.${userId}&status=eq.active&select=plan,current_period_end&order=created_at.desc&limit=1`);
  const s=subs[0];
  return !!(s&&['pro','premium'].includes(s.plan)&&(!s.current_period_end||s.current_period_end>now));
}
function safeJson(text){try{return JSON.parse(text)}catch(e){const m=String(text||'').match(/\{[\s\S]*\}/);if(m)try{return JSON.parse(m[0])}catch(_){ }return null}}
module.exports=async function handler(req,res){
  if(req.method!=='POST')return send(res,405,{error:'Método não permitido.'});
  try{
    const su=process.env.SUPABASE_URL,pk=process.env.SUPABASE_PUBLISHABLE_KEY,sk=process.env.SUPABASE_SECRET_KEY,gk=process.env.GEMINI_API_KEY;
    if(!su||!pk||!sk||!gk)return send(res,500,{error:'Configuração incompleta do servidor.'});
    const auth=String(req.headers.authorization||''),token=auth.startsWith('Bearer ')?auth.slice(7):'';
    if(!token)return send(res,401,{error:'Entre na sua conta para gerar a análise inteligente.'});
    const ur=await fetch(`${su}/auth/v1/user`,{headers:{apikey:pk,Authorization:`Bearer ${token}`}});if(!ur.ok)return send(res,401,{error:'Sua sessão expirou. Entre novamente.'});
    const user=await ur.json();
    const analysisTitle=clean(req.body?.analysis_title,500),areaId=clean(req.body?.analysis_id,100),sub=clean(req.body?.sub,500),score=Math.max(0,Math.min(100,Number(req.body?.score)||0));
    if(!(await hasAnalysisAiAccess(su,sk,user.id)))return send(res,403,{error:'A interpretação completa com IA das análises é liberada nos planos PRO e Premium.',code:'analysis_pro_required'});
    const answers=Array.isArray(req.body?.answers)?req.body.answers.slice(0,30):[];
    const checklist=Array.isArray(req.body?.checklist)?req.body.checklist.slice(0,80):[];
    const settings=(await rows(su,sk,'mark_ai_settings?id=eq.global&select=*'))[0]||{};
    const knowledge=await rows(su,sk,'mark_ai_knowledge?active=eq.true&select=title,kind,content,sort_order&order=sort_order.asc&limit=30');
    const memberships=await rows(su,sk,`company_users?user_id=eq.${user.id}&select=company_id,created_at&order=created_at.asc&limit=1`);
    const companyId=memberships[0]?.company_id;let company=null,profile=null;
    if(companyId){company=(await rows(su,sk,`companies?id=eq.${companyId}&select=id,name,niche,subniche,city,state&limit=1`))[0]||null;profile=(await rows(su,sk,`company_profiles?company_id=eq.${companyId}&select=*&limit=1`))[0]||null;}
    const knowledgeText=knowledge.map((k,i)=>`[${i+1}] ${k.kind.toUpperCase()} — ${k.title}\n${clean(k.content,10000)}`).join('\n\n').slice(0,60000);
    const statusLabel=v=>v==='correct'?'está certo':v==='improve'?'precisa melhorar':v==='na'?'não se aplica':'não respondido';
    const userData=[`ANÁLISE: ${analysisTitle||areaId}${sub?` | SUBANÁLISE: ${sub}`:''}`,`SCORE CALCULADO PELO SISTEMA: ${score}%`,'\nRESPOSTAS:',...answers.map((x,i)=>`${i+1}. ${clean(x.question,1000)}\nResposta: ${clean(x.answer,3000)||'não respondida'}`),'\nCHECKLIST:',...checklist.map((x,i)=>`${i+1}. ${clean(x.point,1000)} — ${statusLabel(x.status)}`)].join('\n');
    const system=[
      'Você é o motor de análises empresariais do MARK.IA dentro do MIV Ecosystem.',
      'Sua função é interpretar respostas e checklist usando primeiro a metodologia privada cadastrada pelo proprietário e o contexto real da empresa.',
      '\nIDENTIDADE DO MARK',clean(settings.identity_prompt)||'Consultor empresarial prático, criterioso e contextual.',
      '\nMETODOLOGIA MIVCAST',clean(settings.methodology)||'Priorize gargalos, impacto, dependências e ordem de execução.',
      '\nCONHECIMENTO DO PROPRIETÁRIO',clean(settings.owner_knowledge)||'Nenhum conteúdo adicional.',
      '\nREGRAS DE RESPOSTA',clean(settings.response_rules)||'Não invente fatos. Seja específico e aplicável.',
      '\nBASE DE CONHECIMENTO',knowledgeText||'Nenhum material adicional cadastrado.',
      '\nCONTEXTO DA EMPRESA',companyBlock(company,profile),
      '\nREGRAS DE ANÁLISE',
      '1. Não altere o score numérico recebido; ele é calculado pelo sistema.',
      '2. Diferencie forças, gargalos e riscos. Não trate item não respondido como problema confirmado.',
      '3. Priorize no máximo 5 ações, em ordem lógica de execução.',
      '4. As recomendações devem considerar equipe, orçamento, estágio e limitações informadas.',
      '5. Não alegue revisão humana. A análise representa metodologia + IA aplicada aos dados fornecidos.',
      '6. Retorne SOMENTE JSON válido, sem markdown, com as chaves: summary, score_interpretation, strengths, bottlenecks, priorities, next_steps, watchouts.',
      '7. strengths, bottlenecks, priorities, next_steps e watchouts devem ser arrays de strings. priorities deve ter entre 1 e 5 itens quando houver dados suficientes.',
      '\nDADOS DA ANÁLISE',userData
    ].join('\n');
    let model=/^[a-zA-Z0-9._-]+$/.test(settings.model_name||'')?settings.model_name:'gemini-3.8-flash';if(model==='gemini-2.5-flash')model='gemini-3.8-flash';
    const body={contents:[{role:'user',parts:[{text:'Gere a interpretação estruturada desta análise empresarial.'}]}],systemInstruction:{parts:[{text:system}]},generationConfig:{temperature:0.3,maxOutputTokens:2200,responseMimeType:'application/json'}};
    const gr=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,{method:'POST',headers:{'x-goog-api-key':gk,'Content-Type':'application/json'},body:JSON.stringify(body)});
    const gd=await gr.json().catch(()=>({}));if(!gr.ok){console.error('[ANALYSIS Gemini]',gr.status,JSON.stringify(gd).slice(0,1200));return send(res,502,{error:'Não foi possível gerar a interpretação inteligente agora.'});}
    const text=(gd.candidates?.[0]?.content?.parts||[]).map(p=>p.text||'').join('').trim();const result=safeJson(text);if(!result)return send(res,502,{error:'A IA retornou uma análise em formato inesperado.'});
    const arr=k=>Array.isArray(result[k])?result[k].map(x=>clean(x,1200)).filter(Boolean).slice(0,8):[];
    return send(res,200,{analysis:{summary:clean(result.summary,4000),score_interpretation:clean(result.score_interpretation,2500),strengths:arr('strengths'),bottlenecks:arr('bottlenecks'),priorities:arr('priorities').slice(0,5),next_steps:arr('next_steps').slice(0,6),watchouts:arr('watchouts').slice(0,6)},model});
  }catch(e){console.error('[ANALYSIS.IA]',e);return send(res,500,{error:'Não foi possível gerar a análise inteligente agora.'});}
};

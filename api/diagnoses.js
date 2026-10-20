const crypto=require('node:crypto');
const service=require('../private/diagnosis-service.cjs');
const analytics=require('../private/analytics-service.cjs');
const send=(res,status,data)=>{res.setHeader('Cache-Control','private, no-store');return res.status(status).json(data);};
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

module.exports=async function(req,res){
  if(req.query?.blocked_source==='1')return res.status(404).end();
  if(!['GET','POST'].includes(req.method))return send(res,405,{error:'Método não permitido.'});
  if(req.method==='GET'&&req.query?.action==='public-config'){
    res.setHeader('Cache-Control','no-store');
    return res.status(200).json({supabaseUrl:process.env.SUPABASE_URL||'',supabasePublishableKey:process.env.SUPABASE_PUBLISHABLE_KEY||''});
  }
  try{
    const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SECRET_KEY,pub=process.env.SUPABASE_PUBLISHABLE_KEY;
    if(!url||!key||!pub)return send(res,503,{error:'Conexão das análises indisponível.'});
    if(req.method==='GET'&&req.query?.action==='rules')return send(res,200,{rules:await service.rules(url,key)});
    if(req.method==='POST'&&req.body?.action==='analytics-events')return send(res,200,{accepted:await analytics.ingest(req,url,key,pub)});
    const token=String(req.headers.authorization||'').match(/^Bearer (.+)$/)?.[1];
    if(!token)return send(res,401,{error:'Entre na sua conta para salvar análises e liberar soluções.'});
    const auth=await fetch(`${url}/auth/v1/user`,{signal:AbortSignal.timeout(10000),headers:{apikey:pub,Authorization:`Bearer ${token}`}});
    if(!auth.ok)return send(res,401,{error:'Sua sessão expirou. Entre novamente.'});
    const user=await auth.json();if(!uuid.test(user.id))return send(res,401,{error:'Sessão inválida.'});
    const input=req.method==='GET'?req.query||{}:req.body||{};
    if(req.method==='GET'&&input.action==='analytics-report')return send(res,200,await analytics.report(url,key,user,input));
    if(req.method==='GET'&&input.action==='list'){
      const workspaces=await service.db(url,key,`diagnosis_workspaces?user_id=eq.${user.id}&select=workspace_key,company_id,niche,data,updated_at&order=updated_at.desc&limit=100`);
      const memberships=await service.db(url,key,`company_users?user_id=eq.${user.id}&select=company_id`);
      const owned=new Set(memberships.map(row=>row.company_id));
      return send(res,200,{workspaces:workspaces.filter(row=>!row.company_id||owned.has(row.company_id))});
    }
    const niche=String(input.niche||'').trim(),companyId=input.company_id||null;
    if(!niche||niche.length>160||companyId&&!uuid.test(companyId))return send(res,400,{error:'Informe um nicho e uma empresa válidos.'});
    if(companyId){
      const membership=await service.db(url,key,`company_users?company_id=eq.${companyId}&user_id=eq.${user.id}&select=company_id&limit=1`);
      if(!membership.length)return send(res,403,{error:'Esta empresa não pertence à sua conta.'});
    }
    const workspaceKey=`${companyId||'personal'}:${niche.toLowerCase()}`;
    const workspace=async()=> (await service.db(url,key,`diagnosis_workspaces?user_id=eq.${user.id}&workspace_key=eq.${encodeURIComponent(workspaceKey)}&select=data,updated_at&limit=1`))[0]||{data:{},updated_at:null};
    if(req.method==='GET'){
      const [grant,policy,saved]=await Promise.all([service.access(url,key,user.id),service.rules(url,key),workspace()]);
      return send(res,200,{...grant,rules:policy,workspace:saved,solutions:service.grantedSolutions(grant)});
    }
    if(input.action==='unlock'){
      if(!service.points.has(input.point_id))return send(res,400,{error:'Solução não encontrada.'});
      const grant=await service.access(url,key,user.id,input.point_id,input.consume_free===true);
      return send(res,grant.allowed?200:402,{...grant,solution:grant.allowed?service.points.get(input.point_id):null});
    }
    if(input.action==='save'){
      const data=service.validatePointData(input.point_id,input.data);
      const saved=await service.db(url,key,'rpc/diagnosis_save_point',{method:'POST',body:JSON.stringify({p_user_id:user.id,p_company_id:companyId,p_niche:niche,p_point_id:input.point_id,p_data:data})});
      return send(res,200,{saved:true,workspace:saved});
    }
    if(input.action==='report'){
      const [grant,saved]=await Promise.all([service.access(url,key,user.id),workspace()]);
      const clientId=input.report_id||crypto.randomUUID();if(!uuid.test(clientId))return send(res,400,{error:'Identificador de relatório inválido.'});
      const row={user_id:user.id,company_id:companyId,client_id:clientId,name:'Relatório de Evolução · '+niche,status:'Salvo',
        meta:{type:'evolution',owner_id:user.id,workspace_key:workspaceKey,niche,generated_at:new Date().toISOString(),data:saved.data,solutions:service.grantedSolutions(grant)},created_at:new Date().toISOString()};
      const reports=await service.db(url,key,'user_reports?on_conflict=user_id,client_id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=representation'},body:JSON.stringify(row)});
      if(reports?.length!==1)throw new Error('Falha ao confirmar relatório.');
      return send(res,200,{report:reports[0]});
    }
    return send(res,400,{error:'Ação não reconhecida.'});
  }catch(error){console.error('[MIV diagnoses]',error.status||'unavailable');return send(res,error.status||503,{error:error.status===400?error.message:'Não foi possível acessar suas análises agora. Suas respostas locais foram preservadas. Tente novamente.'});}
};

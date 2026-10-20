const service=require('../private/diagnosis-service.cjs');
const rules={id:'global',free_period:'lifetime',purchase_unit:'card',free_solution_limit:2,card_price_cents:1990,pro_mark_enabled:false,premium_mark_enabled:true,revision:1};
async function attach(page,initialPlan='premium'){
  let plan=initialPlan,offline=false;
  const free=new Map(),paid=new Map(),workspaces=new Map(),reports=[];
  const rights=(user,id)=>{
    const grant={plan,free_points:[...(free.get(user)||[])],paid_cards:[...(paid.get(user)||[])],mark_allowed:plan==='premium',card_price_cents:1990};
    grant.free_remaining=Math.max(0,2-grant.free_points.length);
    const point=service.points.get(id);
    grant.allowed=!!point&&(['pro','premium'].includes(plan)||grant.free_points.includes(id)||grant.paid_cards.includes(point.card_id));
    return grant;
  };
  await page.route('**/api/diagnoses**',async route=>{
    const req=route.request(),url=new URL(req.url()),body=req.postDataJSON()||{},input=req.method()==='POST'?body:Object.fromEntries(url.searchParams);
    if(offline)return route.fulfill({status:503,json:{error:'Banco temporariamente indisponível'}});
    if(input.action==='rules')return route.fulfill({json:{rules}});
    const user=(req.headers().authorization||'').replace('Bearer fixture:','');
    if(!user||user.startsWith('Bearer'))return route.fulfill({status:401,json:{error:'Entre na conta'}});
    const key=user+':'+(input.company_id||'personal')+':'+input.niche;
    if(input.action==='list')return route.fulfill({json:{workspaces:[...workspaces.entries()].filter(([k])=>k.startsWith(user+':')).map(([,r])=>r)}});
    const workspace=workspaces.get(key)||{workspace_key:key,company_id:input.company_id||null,niche:input.niche,data:{},updated_at:new Date().toISOString()};
    if(input.action==='unlock'){
      let grant=rights(user,input.point_id);
      if(!grant.allowed&&input.consume_free&&grant.free_remaining){const set=free.get(user)||new Set();set.add(input.point_id);free.set(user,set);grant=rights(user,input.point_id);}
      return route.fulfill({status:grant.allowed?200:402,json:{...grant,solution:grant.allowed?service.points.get(input.point_id):null}});
    }
    if(input.action==='save'){
      workspace.data[input.point_id]=service.validatePointData(input.point_id,input.data);workspaces.set(key,workspace);
      return route.fulfill({json:{saved:true,workspace}});
    }
    if(input.action==='report'){
      const report={client_id:input.report_id,name:'Relatório de Evolução',status:'Salvo',created_at:new Date().toISOString(),meta:{type:'evolution',owner_id:user,niche:input.niche,data:workspace.data,solutions:service.grantedSolutions(rights(user))}};
      reports.push(report);return route.fulfill({json:{report}});
    }
    const grant=rights(user);
    return route.fulfill({json:{...grant,rules,workspace,solutions:service.grantedSolutions(grant)}});
  });
  return {setPlan:value=>plan=value,setOffline:value=>offline=value,buy:(user,card)=>{const set=paid.get(user)||new Set();set.add(card);paid.set(user,set)},free,workspaces,reports};
}
async function authenticate(page,user='qa-user'){
  await page.evaluate(id=>{
    mivUser={id};
    mivSupabase={auth:{getSession:async()=>({data:{session:{user:mivUser,access_token:'fixture:'+mivUser.id}}})}};
    return MivDiagnosis.hydrate(true);
  },user);
}
module.exports={attach,authenticate,service};

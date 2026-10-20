const {db,userPlan}=require('./diagnosis-service.cjs');
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const names=new Set(['page_view','card_view','card_click','card_open','favorite_add','analysis_start','solution_view','report_created','tool_open','market_search','mark_open']);
const bad=message=>Object.assign(new Error(message),{status:400});
const slug=(value,max=140)=>typeof value==='string'&&value.length<=max&&/^[a-z0-9:._-]*$/i.test(value)?value:'';
const text=(value,max)=>typeof value==='string'?value.replace(/[\u0000-\u001f<>]/g,'').slice(0,max):'';
function context(input){
 if(input?.consent!==true||!uuid.test(input.session_id)||!uuid.test(input.visitor_id))return {source:'unknown',campaign:'',device:'unknown',niche:''};
 return {source:slug(input.source,80)||'direct',campaign:slug(input.campaign,100),device:['mobile','tablet','desktop'].includes(input.device)?input.device:'unknown',niche:text(input.niche,160),session_id:input.session_id,visitor_id:input.visitor_id};
}
function validateEvents(body){
 if(body?.consent!==true||!Array.isArray(body.events)||body.events.length<1||body.events.length>20||Buffer.byteLength(JSON.stringify(body))>16384)throw bad('Lote de navegação inválido.');
 const first=body.events[0];
 return body.events.map(e=>{
  if(!uuid.test(e?.event_id)||!uuid.test(e.visitor_id)||!uuid.test(e.session_id)||e.session_id!==first.session_id||e.visitor_id!==first.visitor_id||!names.has(e.name)||!['home','detail','central','report'].includes(e.page))throw bad('Evento inválido.');
  return {event_id:e.event_id,visitor_id:e.visitor_id,session_id:e.session_id,name:e.name,page:e.page,item_id:slug(e.item_id),niche:text(e.niche,160),source:slug(e.source,80)||'direct',campaign:slug(e.campaign,100),device:['mobile','tablet','desktop'].includes(e.device)?e.device:'unknown'};
 });
}
function reportInput(query){
 const valid=s=>/^\d{4}-\d{2}-\d{2}$/.test(s||'')&&Number.isFinite(Date.parse(s+'T00:00:00Z'))&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;
 if(!valid(query.from)||!valid(query.to))throw bad('Selecione datas válidas.');
 const from=new Date(query.from+'T00:00:00-03:00'),to=new Date(new Date(query.to+'T00:00:00-03:00').getTime()+86400000);
 if(to<=from||to-from>366*86400000)throw bad('Use um período de até 366 dias.');
 const filters={niche:text(query.niche,160),source:slug(query.source,80),item_id:slug(query.item_id),environment:['live','test','unknown'].includes(query.environment)?query.environment:'live'};
 if(query.plan&&!['free','pro','premium'].includes(query.plan))throw bad('Plano inválido.');
 if(query.plan)filters.plan=query.plan;
 return {p_from:from.toISOString(),p_to:to.toISOString(),p_filters:filters};
}
function sameOrigin(req){
 if(!req.headers.origin)return true;
 try{return new URL(req.headers.origin).host===String(req.headers['x-forwarded-host']||req.headers.host||'');}catch{return false;}
}
async function ingest(req,url,key,pub){
 if(!sameOrigin(req))throw Object.assign(new Error('Origem não permitida.'),{status:403});
 const events=validateEvents(req.body);
 let userId=null;const token=String(req.headers.authorization||'').match(/^Bearer (.+)$/)?.[1];
 if(token){const r=await fetch(url+'/auth/v1/user',{signal:AbortSignal.timeout(8000),headers:{apikey:pub,Authorization:'Bearer '+token}});if(!r.ok)throw Object.assign(new Error('Sessão inválida.'),{status:401});const user=await r.json();if(!uuid.test(user.id))throw bad('Sessão inválida.');userId=user.id;}
 return db(url,key,'rpc/analytics_ingest',{method:'POST',body:JSON.stringify({p_user_id:userId,p_events:events})});
}
async function report(url,key,user,query){
 const profile=await db(url,key,`profiles?id=eq.${user.id}&select=role&limit=1`);
 if(profile?.[0]?.role!=='admin')throw Object.assign(new Error('Acesso exclusivo do administrador.'),{status:403});
 return db(url,key,'rpc/analytics_report',{method:'POST',body:JSON.stringify(reportInput(query))});
}
async function bestEffort(label,fn){try{return await fn();}catch{console.warn('[MIV analytics] Registro indisponível: '+label);return null;}}
async function order(url,key,{id,userId,providerRef,itemId,kind,amountCents,plan='free',test=false,attribution}){
 return bestEffort('checkout',async()=>{const effectivePlan=kind==='subscription'?plan:await userPlan(url,key,userId);return db(url,key,'analytics_orders?on_conflict=id',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates'},body:JSON.stringify({id,user_id:userId,provider_ref:providerRef,item_id:itemId,kind,amount_cents:amountCents,plan:effectivePlan,environment:test?'test':'live',...context(attribution)})});});
}
function paymentRow(payment,{userId,itemId,kind='single',orderId=null,test=false}){
 const amount=Math.round(Number(payment.transaction_amount)*100),refunded=Math.round(Number(payment.transaction_amount_refunded||0)*100);
 if(!uuid.test(userId)||!slug(itemId)||!/^\d+$/.test(String(payment.id))||payment.currency_id&&payment.currency_id!=='BRL'||!Number.isSafeInteger(amount)||amount<=0||!Number.isSafeInteger(refunded)||refunded<0||refunded>amount)return null;
 const date=value=>value&&Number.isFinite(Date.parse(value))?new Date(value).toISOString():null;
 const created=date(payment.date_created),updated=date(payment.date_last_updated)||created;
 if(!created||!updated)return null;
 const status=slug(payment.status,40);if(!status)return null;
 const fullRefund=['refunded','charged_back'].includes(status)?amount:refunded;
 return {provider_payment_id:String(payment.id),user_id:userId,order_id:uuid.test(orderId)?orderId:null,item_id:itemId,kind,status,amount_cents:amount,refunded_cents:fullRefund,approved_at:date(payment.date_approved),created_at:created,provider_updated_at:updated,environment:test||payment.live_mode===false?'test':'live'};
}
async function payment(url,key,p,identity){
 const row=paymentRow(p,identity);if(!row)return {applicable:false};
 try{await db(url,key,'rpc/analytics_record_payment',{method:'POST',body:JSON.stringify({p_row:row})});return {applicable:true,recorded:true};}
 catch{console.warn('[MIV analytics] Pagamento aguardando nova tentativa do webhook.');return {applicable:true,recorded:false};}
}
async function captureVerifiedPayment(url,key,p,{test=false,subscriptionId=null}={}){
 const meta=p.metadata||{},ref=String(p.external_reference||'').split('|');
 let userId=meta.miv_user_id,itemId=meta.miv_item_id,kind='single',orderId=meta.miv_order_id;
 if(ref[0]==='miv-sub'&&uuid.test(ref[1])&&['pro','premium'].includes(ref[2])){userId=ref[1];itemId='plan:'+ref[2];kind='subscription';}
 else if(!userId&&ref.length===3){userId=ref[0];itemId=ref[2];}
 if(subscriptionId){
  const rows=await db(url,key,`user_subscriptions?provider_subscription_id=eq.${encodeURIComponent(subscriptionId)}&select=user_id,plan&limit=1`);
  if(!rows?.[0])return {applicable:false};userId=rows[0].user_id;itemId='plan:'+rows[0].plan;kind='subscription';
  const orders=await db(url,key,`analytics_orders?provider_ref=eq.${encodeURIComponent(subscriptionId)}&select=id&limit=1`);orderId=orders?.[0]?.id;
 }
 return payment(url,key,p,{userId,itemId,kind,orderId,test});
}
module.exports={validateEvents,reportInput,context,sameOrigin,ingest,report,order,paymentRow,payment,captureVerifiedPayment,bestEffort};

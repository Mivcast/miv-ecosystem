const {db,userPlan}=require('./diagnosis-service.cjs');
const catalog=require('./catalog-service.cjs');
const problem=message=>Object.assign(new Error(message),{status:400});
const id=value=>typeof value==='string'&&/^[a-z0-9][a-z0-9:._-]{1,139}$/.test(value);
const fields='item_id,title,category,need,problem,delivery,preview,fulfillment_kind,target_id,price_cents,included_pro,included_premium,single_enabled,active,featured,promo_enabled,promo_cents,promo_starts_at,promo_ends_at,revision';
const text=(v,max)=>typeof v==='string'&&v.length<=max?v.trim():null;
function effectivePrice(p,now=Date.now()){
 if(!Number.isSafeInteger(p.price_cents)||p.price_cents<0)throw problem('Preço inválido.');
 const promo=p.promo_enabled===true&&Number.isSafeInteger(p.promo_cents)&&p.promo_cents>=100&&p.promo_cents<p.price_cents&&Date.parse(p.promo_starts_at)<=now&&now<Date.parse(p.promo_ends_at);
 return promo?p.promo_cents:p.price_cents;
}
function publicProduct(p,settings,now=Date.now()){
 const result=Object.fromEntries(fields.split(',').map(k=>[k,p[k]]));
 return {...result,amount_cents:effectivePrice(p,now),currency:'BRL',available_for_sale:(settings.sales_enabled===true||['bundle','resource'].includes(p.fulfillment_kind))&&p.active===true&&p.single_enabled===true&&p.price_cents>0};
}
async function settings(url,key){return (await db(url,key,'commerce_settings?id=eq.global&select=*&limit=1'))[0];}
async function row(url,key,itemId){if(!id(itemId))return null;return (await db(url,key,`commerce_products?item_id=eq.${encodeURIComponent(itemId)}&select=*&limit=1`))[0]||null;}
async function listing(url,key){
 const [config,rows]=await Promise.all([settings(url,key),db(url,key,`commerce_products?active=eq.true&select=${fields}&order=featured.desc,title.asc`)]);
 const unavailable=await db(url,key,'commerce_products?active=eq.false&select=item_id,fulfillment_kind');return {products:rows.map(p=>publicProduct(p,config)),unavailable:unavailable.filter(p=>['bundle','resource'].includes(p.fulfillment_kind)).map(p=>p.item_id),sales_enabled:config.sales_enabled===true};
}
async function checkoutItem(url,key,itemId,{fulfillment=false}={}){
 if(!id(itemId))return null;
 const p=await row(url,key,itemId);
 if(p){const config=await settings(url,key);if(!fulfillment&&(!config.sales_enabled&&!['bundle','resource'].includes(p.fulfillment_kind)||!p.active||!p.single_enabled||p.price_cents===0))return null;
  return {title:p.title,unit_price:effectivePrice(p)/100,amount_cents:effectivePrice(p),item_type:'card',commerce_revision:p.revision};
 }
 if(itemId.startsWith('solution:')||itemId.startsWith('quick:'))return null;
 if(itemId.startsWith('diagnosis:'))return require('./diagnosis-service.cjs').catalogItem(url,key,itemId);
 const rows=await db(url,key,`ecosystem_cards?item_id=eq.${encodeURIComponent(itemId)}&select=item_id,title,price_cents,price_label,access_level,active`);
 const old=rows?.[0];if(old?.active===false&&!fulfillment)return null;
 if(old&&Number.isSafeInteger(old.price_cents)&&old.price_cents>=0)return {title:old.title,unit_price:old.price_cents/100,amount_cents:old.price_cents,item_type:'card'};
 // Preserve the two established legacy products only when the database has no row.
 if(!old){const legacy={whatsapp:['Script inteligente de WhatsApp',1990],'monthly-strategy-plan':['Plano Estratégico do Mês',9900]}[itemId];if(legacy)return {title:legacy[0],unit_price:legacy[1]/100,amount_cents:legacy[1],item_type:'card'};}
 return null;
}
function validate(input){
 const p={};for(const key of ['item_id','title','category','need','problem','preview','body','fulfillment_kind','target_id']){const max={title:300,problem:1000,preview:3000,body:30000}[key]||140;p[key]=text(input?.[key],max);if(p[key]===null)throw problem('Campo inválido: '+key);}
 if(!id(p.item_id)||p.title.length<3||!['quick','individual','deep','free'].includes(p.category)||!['sales','attraction','brand','whatsapp','profit','organization'].includes(p.need)||!['point','bundle','document','resource'].includes(p.fulfillment_kind))throw problem('Identificação ou classificação inválida.');
 if(!Array.isArray(input.delivery)||input.delivery.length>8||input.delivery.some(v=>!text(v,600)))throw problem('Descreva até oito entregas concretas.');p.delivery=input.delivery.map(v=>v.trim());
 for(const k of ['included_pro','included_premium','single_enabled','active','featured','promo_enabled']){if(typeof input[k]!=='boolean')throw problem('Opção inválida: '+k);p[k]=input[k];}
 if(!Number.isSafeInteger(input.price_cents)||input.price_cents>10000000||(p.category==='free'?input.price_cents!==0:input.price_cents<100))throw problem('Preço inválido.');p.price_cents=input.price_cents;
 p.promo_cents=input.promo_cents===null?null:input.promo_cents;
 for(const k of ['promo_starts_at','promo_ends_at']){if(input[k]!==null&&!Number.isFinite(Date.parse(input[k])))throw problem('Data promocional inválida.');p[k]=input[k]===null?null:new Date(input[k]).toISOString();}
 if(p.promo_enabled&&(!Number.isSafeInteger(p.promo_cents)||p.promo_cents<100||p.promo_cents>=p.price_cents||!p.promo_starts_at||!p.promo_ends_at||Date.parse(p.promo_ends_at)<=Date.parse(p.promo_starts_at)))throw problem('Promoção exige preço menor e período válido.');
 if(p.active&&(!p.problem||!p.delivery.length||!p.preview))throw problem('Preencha problema, entrega e prévia antes de publicar.');
 if(['point','bundle'].includes(p.fulfillment_kind)&&(!p.included_pro||!p.included_premium))throw problem('As análises já fazem parte de Pro e Premium; esse acesso será preservado.');
 if(p.fulfillment_kind==='document'&&p.active&&p.body.length<80)throw problem('Cadastre a entrega protegida antes de publicar.');
 if(p.fulfillment_kind==='document'&&p.target_id!=='')throw problem('Documentos não usam outro recurso como entrega.');
 return p;
}
async function admin(url,key,user,token,input){
 if(!await require('./admin-security.cjs').allowed(url,key,user,token))throw Object.assign(Error('Confirme o acesso administrativo e o segundo fator.'),{status:403});
 if(input.action==='commerce-admin-list'){const doc=await catalog.load(url,key),resources=await db(url,key,'ecosystem_cards?select=item_id,title,special');return {products:await db(url,key,'commerce_products?select=*&order=title.asc'),settings:await settings(url,key),targets:[...doc.sections.flatMap(s=>s.cards.flatMap(c=>[{kind:'bundle',id:c.id,title:c.title},...c.qs.map(q=>({kind:'point',id:q.id,title:q.text}))])),...resources.filter(r=>!r.special).map(r=>({kind:'resource',id:r.item_id,title:r.title}))]};}
 if(input.action==='commerce-admin-settings'){
  const v=input.settings;if(!v||v.credit_enabled!==false||typeof v.sales_enabled!=='boolean'||!Number.isInteger(v.credit_validity_days)||v.credit_validity_days<1||v.credit_validity_days>90)throw problem('Crédito permanece bloqueado até validação de uma integração compatível.');
  if(v.sales_enabled&&!text(v.validation_reference,1000))throw problem('Registre a referência da validação do ambiente de teste antes de habilitar novas vendas.');
  if(v.tax_percent!==null&&(!Number.isFinite(v.tax_percent)||v.tax_percent<0||v.tax_percent>100)||v.variable_cost_cents!==null&&(!Number.isSafeInteger(v.variable_cost_cents)||v.variable_cost_cents<0))throw problem('Custos inválidos.');
  await db(url,key,'commerce_settings?id=eq.global',{method:'PATCH',body:JSON.stringify({sales_enabled:v.sales_enabled,validation_reference:text(v.validation_reference,1000)||'',credit_enabled:false,credit_validity_days:v.credit_validity_days,tax_percent:v.tax_percent,variable_cost_cents:v.variable_cost_cents,updated_by:user.id,updated_at:new Date().toISOString()})});return {saved:true};
 }
 const p=validate(input.product),previous=await row(url,key,p.item_id);
 if(previous&&(previous.fulfillment_kind!==p.fulfillment_kind||previous.target_id!==p.target_id))throw problem('O vínculo da entrega não pode mudar. Crie outro produto para preservar compradores anteriores.');
 const doc=await catalog.load(url,key),points=catalog.pointMap(doc.sections);
 if(p.fulfillment_kind==='point'&&!points.has(p.target_id)||p.fulfillment_kind==='bundle'&&!doc.sections.some(s=>s.cards.some(c=>c.id===p.target_id)))throw problem('Entrega não encontrada no catálogo.');
 if(p.fulfillment_kind==='point'&&p.item_id!=='solution:'+p.target_id||p.fulfillment_kind==='bundle'&&p.item_id!=='diagnosis:'+p.target_id)throw problem('Preserve o identificador oficial da análise.');
 if(p.fulfillment_kind==='resource'){
  if(['monthly-strategy-plan','tool-calendario','calendario','canais','consult-markia','markia-app','agendamentos','financeiro','orcamentos'].includes(p.target_id))throw problem('Este recurso possui regras próprias de operação ou IA e permanece no editor original.');
  if(p.item_id!==p.target_id)throw problem('Preserve o ID do recurso existente.');
  const original=(await db(url,key,`ecosystem_cards?item_id=eq.${encodeURIComponent(p.target_id)}&select=access_level,special&limit=1`))[0];
  if(!original||original.special||original.access_level==='Grátis'&&p.price_cents>0)throw problem('Este recurso não pode virar uma microcompra. Conteúdo público, serviços e sistemas com regras próprias são preservados.');
 }
 if(!Number.isInteger(input.revision)||input.revision<0)throw problem('Recarregue a versão do produto.');
 return {product:await db(url,key,'rpc/commerce_save_product',{method:'POST',body:JSON.stringify({p_actor:user.id,p_product:p,p_revision:input.revision})})};
}
async function owned(url,key,user){const purchases=await db(url,key,`user_purchases?user_id=eq.${user.id}&status=eq.paid&select=item_id`);const rows=await db(url,key,`commerce_products?select=${fields}`),config=await settings(url,key);return {products:rows.filter(p=>purchases.some(b=>b.item_id===p.item_id)).map(p=>publicProduct(p,config))};}
async function deliver(url,key,user,itemId){
 const p=await row(url,key,itemId);if(!p)throw Object.assign(Error('Recurso não encontrado.'),{status:404});
 const purchases=await db(url,key,`user_purchases?user_id=eq.${user.id}&item_id=eq.${encodeURIComponent(itemId)}&status=eq.paid&select=id,purchased_at,commerce_revision&limit=1`),plan=await userPlan(url,key,user.id);
 const allowed=purchases.length>0||p.active&&(p.price_cents===0||plan==='premium'&&p.included_premium||plan==='pro'&&p.included_pro||p.fulfillment_kind==='resource'&&['pro','premium'].includes(plan));
 if(!allowed)throw Object.assign(Error('Este recurso ainda não está liberado para sua conta.'),{status:402});
 const config=await settings(url,key);let content={kind:p.fulfillment_kind,body:p.body};
 if(p.fulfillment_kind==='document'&&purchases[0]){const receipt=purchases[0],filter=Number.isInteger(receipt.commerce_revision)?'revision=eq.'+receipt.commerce_revision:receipt.purchased_at?'created_at=lte.'+encodeURIComponent(receipt.purchased_at):null;if(filter){const history=await db(url,key,`commerce_product_history?item_id=eq.${encodeURIComponent(p.item_id)}&${filter}&order=created_at.desc&select=snapshot&limit=1`);if(receipt.commerce_revision&&!history[0])throw Object.assign(Error('A versão adquirida está temporariamente indisponível.'),{status:503});if(history[0]?.snapshot?.body)content={kind:'document',body:history[0].snapshot.body};}}
 if(['point','bundle'].includes(p.fulfillment_kind)){const doc=await catalog.load(url,key);content=p.fulfillment_kind==='point'?{kind:'point',points:[catalog.pointMap(doc.sections).get(p.target_id)]}:{kind:'bundle',points:doc.sections.flatMap(s=>s.cards).find(c=>c.id===p.target_id)?.qs||[]};}
 const all=await listing(url,key),card=p.fulfillment_kind==='point'?p.target_id.split('.')[1]:p.target_id,related=all.products.filter(x=>x.item_id!==p.item_id&&x.need===p.need).sort((a,b)=>Number(b.target_id===card)-Number(a.target_id===card)).slice(0,3);
 return {product:publicProduct(p,config),content,related,plan};
}
module.exports={validate,effectivePrice,publicProduct,listing,checkoutItem,admin,owned,deliver,id};

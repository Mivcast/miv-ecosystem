const {db}=require('./diagnosis-service.cjs');
async function allowed(url,key,user,token=''){
 let aal='aal1';try{const claims=JSON.parse(Buffer.from(token.split('.')[1]||'','base64url').toString('utf8'));if(claims.sub===user.id&&claims.aal==='aal2')aal='aal2';}catch{}
 // Call only after the same bearer token has been verified by Supabase getUser.
 return await db(url,key,'rpc/admin_access',{method:'POST',body:JSON.stringify({p_user_id:user.id,p_aal:aal})})===true;
}
module.exports={allowed};

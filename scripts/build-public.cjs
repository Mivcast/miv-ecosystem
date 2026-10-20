const fs=require('node:fs');
const path=require('node:path');

const publicFiles=['index.html','admin.html','styles.css','evolution.css','app.js','admin-commerce.js','commercial-rules.js','library-reform.js','evolution-data.js','diagnosis-official.js','diagnosis-guidance.js','diagnosis-access.js','evolution.js','analytics.js','admin-analytics.js','analytics.css','legal.html','legal-config.js','legal-documents.js','legal.css','privacy.js','admin-privacy.js','admin-security.js'];
const media=/\.(png|jpe?g|webp|gif|svg|ico|avif|mp4|webm|mp3|wav|woff2?|ttf|pdf)$/i;
function buildPublic(root=path.resolve(__dirname,'..')){
 root=path.resolve(root);
 const output=path.join(root,'public'),marker=path.join(output,'.miv-generated');
 if(fs.existsSync(output)){
  if(fs.lstatSync(output).isSymbolicLink()||!fs.existsSync(marker))throw new Error('Refusing to replace an unowned public directory');
  // Only replace this build's marked, fixed output directory, never the source tree.
  fs.rmSync(output,{recursive:true});
 }
 fs.mkdirSync(output,{recursive:true});
 fs.writeFileSync(marker,'MIV generated public assets\n');
 for(const file of publicFiles)fs.copyFileSync(path.join(root,file),path.join(output,file));
 const assets=path.join(root,'assets');
 if(fs.existsSync(assets))fs.cpSync(assets,path.join(output,'assets'),{recursive:true,filter(source){
  const stat=fs.lstatSync(source);
  if(stat.isSymbolicLink())throw new Error('Symlinks are not allowed in public assets');
  if(path.basename(source).startsWith('.'))return false;
  return stat.isDirectory()||media.test(source);
 }});
 return output;
}
if(require.main===module)console.log('Public frontend built at '+buildPublic());
module.exports={buildPublic,publicFiles};

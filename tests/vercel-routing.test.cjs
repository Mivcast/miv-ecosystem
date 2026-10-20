const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const config=require('../vercel.json');

test('deployment stays within twelve Node function entrypoints',()=>{
 const entries=fs.readdirSync(path.join(root,'api'),{recursive:true}).filter(file=>/\.js$/.test(file));
 assert.equal(entries.length,12);
 for(const name of Object.keys(config.functions))assert(fs.existsSync(path.join(root,name)),name);
});

test('private paths are denied before the filesystem can serve existing files',()=>{
 assert.equal(config.rewrites,undefined);
 const [deny]=config.routes;
 assert.equal(deny.status,404);assert.equal(deny.dest,'/api/diagnoses?blocked_source=1');assert.notEqual(deny.continue,true);
 assert.equal(deny.headers['Cache-Control'],'private, no-store');
 const match=new RegExp(deny.src);
 for(const name of ['/private','/private/','/private/diagnosis-content.json','/private/diagnosis-service.cjs'])assert(match.test(name),name);
 for(const name of ['/private-other/file.js','/api/diagnoses','/index.html'])assert(!match.test(name),name);
 assert(config.routes.findIndex(rule=>rule.handle==='filesystem')>0);
});

test('public config is routed to the shared function before filesystem lookup',()=>{
 const index=config.routes.findIndex(rule=>rule.src==='^/api/config$'&&rule.dest==='/api/diagnoses?action=public-config');
 assert(index>0);assert(index<config.routes.findIndex(rule=>rule.handle==='filesystem'));
 assert(!fs.existsSync(path.join(root,'api/config.js')));
});

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

test('the public config URL and private source protection keep their rewrites',()=>{
 assert(config.rewrites.some(rule=>rule.source==='/api/config'&&rule.destination==='/api/diagnoses?action=public-config'));
 assert(config.rewrites.some(rule=>rule.source==='/private/:path*'&&rule.destination==='/api/diagnoses?blocked_source=1'));
 assert(!fs.existsSync(path.join(root,'api/config.js')));
});

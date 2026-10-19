const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {buildPublic,publicFiles}=require('../scripts/build-public.cjs');
const config=require('../vercel.json');

test('deployment publishes a frontend-only directory, never the repository root',()=>{
 assert.equal(config.outputDirectory,'public');
 assert.equal(config.buildCommand,'node scripts/build-public.cjs');
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'miv-public-'));
 try{
  for(const file of publicFiles)fs.writeFileSync(path.join(root,file),'frontend');
  for(const dir of ['private','api','tests','docs','assets'])fs.mkdirSync(path.join(root,dir));
  fs.writeFileSync(path.join(root,'private','diagnosis-content.json'),'private solution');
  fs.writeFileSync(path.join(root,'api','diagnoses.js'),'server only');
  fs.writeFileSync(path.join(root,'.env'),'secret');
  fs.writeFileSync(path.join(root,'extra.js'),'not allowlisted');
  fs.writeFileSync(path.join(root,'assets','photo.png'),'image');
  fs.writeFileSync(path.join(root,'assets','server.cjs'),'server only');
  const output=buildPublic(root);
  for(const file of publicFiles)assert(fs.existsSync(path.join(output,file)),file);
  assert(fs.existsSync(path.join(output,'assets','photo.png')));
  for(const file of ['private','api','tests','docs','.env','extra.js','assets/server.cjs'])assert(!fs.existsSync(path.join(output,file)),file);
  fs.writeFileSync(path.join(output,'stale.json'),'stale');
  buildPublic(root);assert(!fs.existsSync(path.join(output,'stale.json')));
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});

test('build refuses to replace an existing public directory it does not own',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'miv-owned-public-'));
 try{
  fs.mkdirSync(path.join(root,'public'));
  fs.writeFileSync(path.join(root,'public','user.txt'),'preserve');
  assert.throws(()=>buildPublic(root),/unowned/);
  assert.equal(fs.readFileSync(path.join(root,'public','user.txt'),'utf8'),'preserve');
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});

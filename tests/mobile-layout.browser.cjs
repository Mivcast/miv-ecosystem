const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs/promises');
const path=require('node:path');
const {attach,authenticate}=require('./diagnosis-fixture.cjs');
const root=path.resolve(__dirname,'..');
const output=path.join(root,'outputs','mobile-layout');
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname;
 const file=path.resolve(root,'.'+decodeURIComponent(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(root+path.sep)||file.startsWith(path.join(root,'private')+path.sep)){res.writeHead(404).end();return;}
 try{res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(await fs.readFile(file));}catch{res.writeHead(404).end();}
});
(async()=>{
 await fs.mkdir(output,{recursive:true});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await chromium.launch({channel:'chrome',headless:true});
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://**/*',route=>route.abort());await attach(page);
  await page.goto('http://127.0.0.1:'+server.address().port);await page.locator('.ev-card').first().waitFor();
  await authenticate(page);
  for(const width of [320,360,390,430,700,768]){
   await page.setViewportSize({width,height:900});
   const metrics=await page.evaluate(()=>{
    const tracks=[...document.querySelectorAll('#view-home .shelf,.ev-cards,.ev-niche-list,.testimonial-track')];
    const sections=[...document.querySelectorAll('#view-home>section')].map(el=>({id:el.id,left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right,width:el.clientWidth,scroll:el.scrollWidth}));
    const outside=[...document.querySelectorAll('#view-home h1,#view-home h2,#view-home h3,#view-home input,#view-home select,#view-home textarea,#view-home .titleRow')].filter(el=>el.getClientRects().length&&!el.closest('.shelf,.ev-cards,.ev-niche-list,.testimonial-track,.logo-track')).map(el=>({name:el.id||el.className||el.tagName,left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right,scroll:el.scrollWidth,width:el.clientWidth})).filter(el=>el.left < -1||el.right>innerWidth+1||el.scroll>el.width+2);
    return {viewport:innerWidth,pageWidth:document.documentElement.scrollWidth,sections,outside,tracks:tracks.map(el=>{el.scrollLeft=0;const a=el.children[0]?.getBoundingClientRect(),b=el.children[1]?.getBoundingClientRect(),r=el.getBoundingClientRect();return {id:el.id||el.className,width:r.width,first:a?.width,peek:b?Math.max(0,r.right-b.left):null,scroll:el.scrollWidth,client:el.clientWidth};})};
   });
   assert.equal(metrics.pageWidth,metrics.viewport,'No horizontal page overflow at '+width);
   assert.deepEqual(metrics.outside,[],'No clipped headings or form controls at '+width);
   assert(metrics.sections.every(s=>s.left>=-1&&s.right<=width+1),'Section bounds at '+width);
   if(width<=700){
    for(const track of metrics.tracks.filter(t=>t.peek!==null&&t.id!=='ev-niche-list')){
     assert(track.first<=track.width-18,`${track.id}: whole first card at ${width}`);
     assert(track.peek>=18&&track.peek<track.first,`${track.id}: next item visible at ${width}: ${track.peek}`);
    }
    for(const selector of ['#marketingTrack','.ev-cards','#mivcastTrack','#competitorTrack','.ev-niche-list']){
     const track=page.locator(selector).first();
     const moved=await track.evaluate(el=>{el.scrollTo({left:el.clientWidth,behavior:'instant'});return el.scrollLeft;});
     assert(moved>0,selector+' can scroll');
     await track.evaluate(el=>el.scrollTo({left:0,behavior:'instant'}));
    }
   }
   for(const [name,selector] of [['hero','#heroCommerce'],['niche','#nicho'],['analysis','#analises'],['marketing','#marketingTrack'],['services','#mivcastTrack'],['plans','#planos']]){
    await page.locator(selector).scrollIntoViewIfNeeded();await page.screenshot({path:path.join(output,`${name}-${width}.png`)});
   }
  }
  await page.evaluate(()=>{
   state.favorites=['calendario','canais','local'];state.history=[{id:'calendario'},{id:'canais'}];
   state.reports=[{name:'Relatório de teste A',status:'Salvo'},{name:'Relatório de teste B',status:'Salvo'}];
   route('central',{instant:true});
  });
  for(const width of [320,390,700]){
   await page.setViewportSize({width,height:900});
   const layout=await page.evaluate(()=>({page:document.documentElement.scrollWidth,width:innerWidth,tracks:[...document.querySelectorAll('#view-central .centralCarousel')].filter(el=>el.children.length>1).map(el=>{el.scrollLeft=0;const r=el.getBoundingClientRect(),a=el.children[0].getBoundingClientRect(),b=el.children[1].getBoundingClientRect();return {id:el.id,width:r.width,first:a.width,peek:r.right-b.left};})}));
   assert.equal(layout.page,layout.width,'Central page fits at '+width);
   assert(layout.tracks.length>=2);
   for(const track of layout.tracks){
    if(track.first>track.width-18)console.log(await page.locator('#'+track.id).evaluate(el=>({classes:el.className,display:getComputedStyle(el).display,padding:getComputedStyle(el).padding,flex:getComputedStyle(el.children[0]).flex,minWidth:getComputedStyle(el.children[0]).minWidth,width:getComputedStyle(el.children[0]).width})));
    assert(track.first<=track.width-18,JSON.stringify(track));assert(track.peek>=18,JSON.stringify(track));
   }
   await page.locator('#favorites').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(output,`central-${width}.png`)});
  }
  if(!process.env.MIV_LAYOUT_AUDIT)assert.deepEqual(errors,[]);
  console.log('PASS mobile layout: widths 320/360/390/430/700/768, page and section bounds, visible headings/forms, carousel peek and scrolling.');
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});

const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_PACKAGE||'playwright');
const root=path.resolve(__dirname,'../work/diagram-release/release');
const out=path.resolve(__dirname,'../work/diagram-release/qa');fs.mkdirSync(out,{recursive:true});
const bank=JSON.parse(fs.readFileSync(path.join(root,'questions.json'))).filter(q=>q.diagram);
const questions=bank.map((q,i)=>({id:q.id,version:q.version,position:i+1,grade:q.grade,subject:q.subject,type:q.type==='PGK_MCMA'?'MCMA':q.type==='PGK_CATEGORY'?'CATEGORY':'PG',topic:q.competency,module_id:q.module_id,prompt:q.stem,options:q.options,category_labels:q.category_labels,diagram:q.diagram,response:null}));
const attempt={id:'visual-fixture',mode:'daily',status:'active',questions,started_at:new Date().toISOString(),subject:'matematika',grade:6,total_count:questions.length};
const review={...attempt,status:'submitted',submitted_at:new Date().toISOString(),score:0,correct_count:0,review:bank.map((q,i)=>({question:questions[i],response:null,correct:false,correct_answer:q.answer,explanation:q.explanation}))};
const server=http.createServer((req,res)=>{const rel=decodeURIComponent(req.url.split('?')[0]);const p=path.resolve(root,'.'+(rel==='/'?'/index.html':rel));if(!p.startsWith(root+path.sep)||!fs.existsSync(p)){res.writeHead(404);return res.end();}res.setHeader('Content-Type',p.endsWith('.svg')?'image/svg+xml':p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(p));});
(async()=>{await new Promise(r=>server.listen(18194,'127.0.0.1',r));const browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/api/**',route=>{const p=new URL(route.request().url()).pathname;let data={};if(p==='/api/me')data={user:{learner:{nickname:'Uji Gambar',grade:6,ranking_opt_in:true}}};else if(p==='/api/progress')data={attempts:[],topics:[]};else if(p==='/api/modules')data={modules:[]};else if(p==='/api/attempts')data={attempts:[attempt]};else if(p.endsWith('/submit'))data={attempt:review};else if(p.startsWith('/api/attempts/'))data={attempt};return route.fulfill({json:data});});
 await page.goto('http://127.0.0.1:18194');await page.locator('[data-action="resume"]').first().click();await page.locator('.question-diagram img').waitFor();
 const kinds=new Set();
 for(const width of [320,390]){await page.setViewportSize({width,height:844});for(let i=0;i<questions.length;i++){
  await page.getByRole('button',{name:`Soal ${i+1}`,exact:true}).click();const img=page.locator('.question-diagram img');await img.evaluate(el=>el.decode());
  assert.equal(await img.getAttribute('src'),questions[i].diagram.src);assert.equal(await img.getAttribute('alt'),questions[i].diagram.alt);
  const box=await img.boundingBox();assert.ok(box.width>200&&box.x>=0&&box.x+box.width<=width,`clipped ${width}/${questions[i].id}`);
  assert.ok(await page.locator('.quiz-overlay').evaluate(el=>el.scrollWidth<=el.clientWidth));
  if(width===390&&!kinds.has(questions[i].diagram.kind)){kinds.add(questions[i].diagram.kind);await page.locator('.question-diagram').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,questions[i].diagram.kind+'.png')});}
 }}
 await page.getByRole('button',{name:'Selesaikan sesi',exact:true}).click();await page.getByRole('button',{name:'Kumpulkan jawaban',exact:true}).click();await page.getByRole('button',{name:'Lihat pembahasan',exact:true}).click();assert.equal(await page.locator('.review-item .question-diagram').count(),53);
 await page.screenshot({path:path.join(out,'review.png')});assert.deepEqual(errors,[]);
 console.log(JSON.stringify({status:'PASS',images:53,widths:[320,390],all_images_loaded:true,review_images:53,js_errors:errors}));
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});

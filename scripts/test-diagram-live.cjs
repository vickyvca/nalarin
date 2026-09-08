const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_PACKAGE||'playwright');
const out=path.resolve(__dirname,'../work/diagram-release/qa');
const users=[];
(async()=>{const browser=await chromium.launch({headless:true});try{const results=[];
 for(const grade of [6,9]){
  const page=await browser.newPage({viewport:{width:390,height:844}});const username=`visual${grade}${Date.now().toString().slice(-9)}`;users.push(username);
  let r=await page.request.post('https://tka.mdc.web.id/api/auth/register',{data:{username,pin:'135790',nickname:'Uji Gambar',grade,school:'QA',city:'Jawa Tengah'}});assert.equal(r.status(),201);
  r=await page.request.post('https://tka.mdc.web.id/api/attempts',{data:{mode:'ranked',subject:'matematika',idempotency_key:username}});assert.equal(r.status(),201);const {attempt}=await r.json();assert.equal(attempt.questions.length,30);assert.equal(attempt.review,undefined);
  const i=attempt.questions.findIndex(q=>q.diagram);assert.ok(i>=0);const q=attempt.questions[i];
  r=await page.request.get('https://tka.mdc.web.id'+q.diagram.src);assert.equal(r.status(),200);assert.match(r.headers()['content-type'],/image\/svg/);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('https://tka.mdc.web.id/');await page.locator('[data-action="resume"]').first().click();await page.getByRole('button',{name:`Soal ${i+1}`,exact:true}).click();await page.locator('.question-diagram').scrollIntoViewIfNeeded();await page.locator('.question-diagram img').evaluate(el=>el.decode());await page.screenshot({path:path.join(out,`live-grade-${grade}.png`)});
  r=await page.request.post(`https://tka.mdc.web.id/api/attempts/${attempt.id}/submit`,{data:{}});assert.equal(r.status(),200);const submitted=(await r.json()).attempt;assert.ok(submitted.review.some(x=>x.question.diagram));assert.deepEqual(errors,[]);
  results.push({grade,questions:30,illustrated:attempt.questions.filter(q=>q.diagram).length,image_http:200,quiz_rendered:true,review_metadata:true});await page.close();
 }
 console.log(JSON.stringify({status:'PASS',results,users}));
}finally{fs.writeFileSync(path.join(out,'live-users.json'),JSON.stringify(users));await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

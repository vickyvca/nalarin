import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import fs from 'node:fs';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_PACKAGE||'playwright');
const browser=await chromium.launch({headless:true});
const base=process.env.TKA_QA_URL||'https://tka.mdc.web.id';
const names=fs.existsSync('qa/live-test-users.json')?JSON.parse(fs.readFileSync('qa/live-test-users.json','utf8')):[];
try{
 for(const grade of [6,9]){
  const context=await browser.newContext({baseURL:base,viewport:{width:390,height:844}});
  async function api(path,body,expected=200){const r=body?await context.request.post('/api'+path,{data:body,timeout:55000}):await context.request.get('/api'+path);assert.equal(r.status(),expected,`${path}: ${await r.text()}`);return r.json();}
  const username=`naraqa${grade}${Date.now()}`;names.push(username);
  await api('/auth/register',{username,pin:'135790',nickname:'Uji Kak Nara',grade,school:'QA Nalarin'},201);
  assert.equal((await api('/tutor/status')).enabled,true);
  for(const subject of ['matematika','bahasa_indonesia']){
   const a=(await api('/attempts',{subject,mode:'daily'},201)).attempt;
   await api(`/attempts/${a.id}/submit`,{});
   const started=Date.now();
   const body={question_id:a.questions[0].id,mode:subject==='matematika'?'simplify':'example'};
   const answer=await api(`/attempts/${a.id}/tutor`,body);assert.ok(answer.answer.length>40);
   const cached=await api(`/attempts/${a.id}/tutor`,body);assert.equal(cached.cached,true);assert.equal(cached.answer,answer.answer);
   console.log(JSON.stringify({grade,subject,status:'PASS',ms:Date.now()-started,answer:answer.answer}));
  }
  if(grade===6){const page=await context.newPage();await page.goto(base);await page.locator('.mobile-nav').getByRole('button',{name:'Progres',exact:true}).click();await page.locator('[data-action="history"]').first().click();await page.getByRole('button',{name:'Contoh lain',exact:true}).first().click();await page.locator('.nara-answer').first().filter({hasText:/./}).waitFor();await page.waitForFunction(()=>{const x=document.querySelector('.nara-answer');return x?.textContent.length>40&&!x.textContent.includes('menyiapkan');});assert.ok(!(await page.locator('.nara-answer').first().innerText()).includes('belum bisa'));await page.locator('.nara-box').first().scrollIntoViewIfNeeded();await page.screenshot({path:'qa/mobile-nara-live.png'});}
  await context.close();
 }
}finally{fs.writeFileSync('qa/live-test-users.json',JSON.stringify(names));console.log(JSON.stringify({cleanup_users:names}));await browser.close();}

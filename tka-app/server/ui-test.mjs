import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_PACKAGE||'playwright');
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const origin=process.env.TKA_QA_URL||'http://localhost:5174';
const username=`uitest${Date.now()}`;
const out=new URL('../qa/',import.meta.url);fs.mkdirSync(out,{recursive:true});
try {
 await page.goto(origin);await page.getByRole('button',{name:'Daftar',exact:true}).click();
 await page.getByLabel('Nama panggilan',{exact:true}).fill('Uji Nalarin');
 await page.getByLabel('Username',{exact:true}).fill(username);
 await page.getByLabel('Kode masuk 6 angka',{exact:true}).fill('135790');
 await page.getByRole('button',{name:'Buat akun & mulai'}).click();
 await page.locator('.recovery-code b').waitFor();const recovery=await page.locator('.recovery-code b').innerText();assert.ok(recovery.length>=20);
 await page.screenshot({path:new URL('mobile-recovery.png',out).pathname.replace(/^\/(.:\/)/,'$1'),fullPage:true});
 await page.getByRole('button',{name:'Tutup',exact:true}).click();
 await page.getByRole('button',{name:'Mulai Matematika',exact:true}).click();await page.locator('.quiz-card').waitFor();
 const active=(await (await page.request.get(`${origin}/api/attempts`)).json()).attempts[0];
 const cat=active.questions.findIndex(q=>q.type==='CATEGORY');
 if(cat>=0){await page.getByRole('button',{name:`Soal ${cat+1}`,exact:true}).click();await page.locator('.category-choice').first().click();await page.locator('#save-state').filter({hasText:'Tersimpan'}).waitFor();await page.reload();await page.getByRole('button',{name:'Lanjutkan',exact:true}).click();await page.getByRole('button',{name:`Soal ${cat+1}`,exact:true}).click();assert.equal(await page.locator('.category-choice.selected').count(),1);}
 await page.screenshot({path:new URL('mobile-question.png',out).pathname.replace(/^\/(.:\/)/,'$1'),fullPage:false});
 for(let i=0;i<active.questions.length;i++){await page.getByRole('button',{name:`Soal ${i+1}`,exact:true}).click();const q=active.questions[i];if(q.type==='CATEGORY'){for(let j=0;j<q.options.length;j++)await page.locator('.category-row').nth(j).getByRole('button',{name:'Benar',exact:true}).click();}else await page.locator('.answer-option').first().click();}
 await page.getByRole('button',{name:'Selesaikan sesi',exact:true}).click();await page.getByRole('button',{name:'Kumpulkan jawaban',exact:true}).click();await page.getByRole('button',{name:'Lihat pembahasan',exact:true}).click();await page.locator('.review-item').first().waitFor();assert.equal(await page.locator('.review-item').count(),10);
 await page.screenshot({path:new URL('mobile-review.png',out).pathname.replace(/^\/(.:\/)/,'$1'),fullPage:true});
 await page.getByRole('button',{name:'Tutup',exact:true}).click();await page.locator('.mobile-nav').getByRole('button',{name:'Progres',exact:true}).click();await page.locator('.real-chart').waitFor();assert.equal(await page.locator('.real-chart circle').count(),1);
 await page.screenshot({path:new URL('mobile-progress.png',out).pathname.replace(/^\/(.:\/)/,'$1'),fullPage:true});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
 await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:new URL('desktop-progress.png',out).pathname.replace(/^\/(.:\/)/,'$1'),fullPage:true});
 await page.locator('.desktop-nav').getByRole('button',{name:'Liga Mingguan',exact:true}).click();await page.getByRole('heading',{name:'Liga segera dibuka'}).waitFor();
 await page.getByRole('button',{name:'Profil dan pengaturan',exact:true}).first().click();await page.getByRole('button',{name:'Keluar dari akun',exact:true}).click();
 await page.getByRole('button',{name:'Lupa kode masuk?',exact:true}).click();await page.locator('#recover-form [name=username]').fill(username);await page.locator('#recover-form [name=recovery_code]').fill(recovery);await page.locator('#recover-form [name=pin]').fill('246810');await page.getByRole('button',{name:'Pulihkan akun',exact:true}).click();await page.locator('.recovery-code b').waitFor();
 assert.deepEqual(errors,[]);console.log(JSON.stringify({status:'PASS',username,checks:'mobile registration/recovery, partial answer reload/resume, submit/review, real progress, desktop, ranking gate, account recovery',screenshots:out.pathname}));
} catch(error) {console.log(await page.locator('body').innerText());console.log(errors);throw error;} finally {await browser.close();}

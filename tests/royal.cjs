const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const fs=require('node:fs');
(async()=>{
 const server=spawn('python3',['-m','http.server','4174','--bind','127.0.0.1','--directory','..'],{stdio:'ignore'});
 let browser;
 try {
 for(let i=0;i<30;i++){try{await fetch('http://127.0.0.1:4174');break}catch{await new Promise(r=>setTimeout(r,100))}}
 browser=await chromium.launch({headless:true,args:JSON.parse(process.env.CHROMIUM_ARGS || '[]'),...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 fs.mkdirSync('docs/screenshots',{recursive:true});
 const base='http://127.0.0.1:4174/'+encodeURIComponent(require('node:path').basename(process.cwd()))+'/';
 for(const [name,width,height] of [['android',393,852],['desktop',1440,1000]]){
 const context=await browser.newContext({viewport:{width,height}});const p=await context.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.clock.install();await p.clock.pauseAt(new Date());await p.goto(base);await p.locator('#splash').waitFor({state:'visible'});await p.screenshot({animations:'disabled',path:`docs/screenshots/${name}-splash.png`});
 await p.clock.resume();await p.evaluate(()=>{const d=document.getElementById('splash');if(d.open)document.getElementById('skip-splash').click()});await p.screenshot({animations:'disabled',path:`docs/screenshots/${name}-cover.png`});await p.click('#open');
 await p.click('#toc');await p.click('[data-target="birth"]');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(250);
 await p.screenshot({animations:'disabled',path:`docs/screenshots/${name}-chapter.png`});
 await p.click('#bookmark');assert.equal(await p.getAttribute('#bookmark','aria-pressed'),'true');await p.reload();await p.waitForTimeout(250);assert.equal(await p.getAttribute('#bookmark','aria-pressed'),'true');
 await p.click('#next');await p.click('#bookmark');assert.equal(await p.getAttribute('#bookmark','aria-pressed'),'true');await p.click('#bookmark');assert.equal(await p.getAttribute('#bookmark','aria-pressed'),'false');await p.click('#bookmarks');await p.click('#bookmark-list button');assert.equal(await p.getAttribute('#bookmark','aria-pressed'),'true');
 await p.click('#preferences');await p.click('[data-theme="night"]');await p.locator('#settings-dialog .sheet-close').click();await p.reload();assert.equal(await p.getAttribute('body','data-theme'),'night');
 await p.click('#reader-search');await p.fill('#granth-query','प्रतापगड');await p.waitForSelector('#granth-results a');assert(await p.locator('#granth-results a').count()>0);await p.fill('#granth-query','zznotfound');assert.equal(await p.locator('#granth-results a').count(),0);await p.fill('#granth-query','शिवनेरी');await p.locator('#granth-results a').first().click();
 await p.click('#show-citations');await p.locator('#citations h2').waitFor();await p.click('#close-citations');
 await p.click('#next');await p.screenshot({animations:'disabled',path:`docs/screenshots/${name}-reader.png`});
 await p.click('#focus-mode');assert(await p.locator('.toolbar').isHidden());await p.click('#focus-mode');
 await p.click('#home');assert(await p.locator('#cover').isVisible());await p.goBack();assert(await p.locator('#reader').isVisible());
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 assert.deepEqual(errors,[]);await context.close();
 }
 console.log('ROYAL PASS: splash, cover, bookmarks/reload, night/reload, search, evidence, focus, history, mobile/desktop screenshots');
 }finally{await browser?.close();server.kill()}
})().catch(e=>{console.error(e);process.exitCode=1});

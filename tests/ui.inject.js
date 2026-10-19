// Lorebook injection end-to-end against mocked Marinara lorebook APIs (needs jsdom): npm i --no-save jsdom@24 && node tests/ui.inject.js
const {JSDOM}=require('jsdom'),fs=require('fs'),assert=require('assert');
const src=fs.readFileSync(process.argv[2]||require('path').join(__dirname,'..','extension.js'),'utf8');
const dom=new JSDOM('<!doctype html><body></body>',{url:'https://local.test/gacha-forge',runScripts:'outside-only'});
const win=dom.window,doc=win.document;
win.HTMLDialogElement.prototype.showModal=function(){this.open=true};win.HTMLDialogElement.prototype.close=function(){this.open=false};
const alerts=[];win.alert=m=>alerts.push(m);win.confirm=()=>true;let answer='2033-04-10';win.prompt=()=>answer;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const calls=[];
const reply=(body,status=200)=>({ok:status<400,status,headers:{get:()=> 'application/json'},clone(){return this},json:async()=>body});
win.fetch=async(url,opts={})=>{
  const u=String(url),m=String(opts.method||'GET');
  if(u.includes('/api/lorebooks')){calls.push({m,u,body:opts.body?JSON.parse(opts.body):null,csrf:opts.headers?.['x-marinara-csrf']});
    if(m==='POST'&&u.endsWith('/api/lorebooks'))return reply({id:'lb1',name:JSON.parse(opts.body).name});
    if(m==='POST'&&u.endsWith('/entries'))return reply({id:'en1'});
    if(m==='PATCH')return reply({id:'en1'});}
  return reply({});
};
win.localStorage.setItem('gf-quest-v1',JSON.stringify({v:1,world:'w',worlds:{w:{quests:[{id:'q',title:'제1공방 긴급 방어 작전',claimed:false,steps:['게이트 파편 파괴'],stepDone:[false],target:1,progress:0}],fields:[],items:[],history:[],gfDisplayName:'서울 각성자 월드',protagonist:'홍길동'}}}));
const host=doc.createElement('marinara-capability-gacha-forge');doc.body.append(host);
host.attachShadow({mode:'open'}).innerHTML='<div><button class="gf-fs-bar icon-button">⛶</button></div>';
win.eval(src);
(async()=>{
  host.shadowRoot.querySelector('button[data-gfq="top"]').click();
  const panel=doc.getElementById('gfq-01-panel');
  const click=sel=>panel.querySelector(sel).dispatchEvent(new win.MouseEvent('click',{bubbles:true}));
  click('[data-tab="settings"]');
  assert.ok(panel.innerHTML.includes('스토리 반영 (로어북)'));
  click('[data-action="inject-create"]');await sleep(100);
  assert.strictEqual(calls[0].m,'POST');assert.strictEqual(calls[0].body.name,'퀘스트 확장 · 서울 각성자 월드');assert.strictEqual(calls[0].body.isGlobal,false);assert.strictEqual(calls[0].csrf,'1');
  assert.strictEqual(calls[1].body.constant,true);assert.match(calls[1].body.content,/진행 중: 제1공방 긴급 방어 작전 — 다음 목표: 게이트 파편 파괴/);
  let w=JSON.parse(win.localStorage.getItem('gf-quest-v1')).worlds.w;
  assert.deepStrictEqual([w.gfInject.lorebookId,w.gfInject.entryId,w.gfInject.enabled],['lb1','en1',true]);
  // A change in state is pushed to the entry after the 3 s debounce, once.
  click('[data-tab="assets"]');click('[data-action="date-set"]');
  await sleep(3400);
  const patches=calls.filter(c=>c.m==='PATCH');
  assert.strictEqual(patches.length,1,'one update per change');
  assert.ok(patches[0].u.endsWith('/api/lorebooks/lb1/entries/en1'));
  assert.match(patches[0].body.content,/날짜: 2033-04-10 \(일\)/);
  // Saving again without any change sends nothing.
  click('[data-tab="settings"]');await sleep(3400);
  assert.strictEqual(calls.filter(c=>c.m==='PATCH').length,1,'unchanged text is not re-sent');
  console.log('UI inject OK');process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});

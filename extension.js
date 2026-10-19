/* 퀘스트 v0.3.6 — standalone, local-only manual companion; no modification to Gacha Forge saves. */
(() => {
  'use strict';
  if (globalThis.__gfQuestExtension01) return;
  globalThis.__gfQuestExtension01 = true;
  const ID = 'gfq-01';
  const STORE = 'gf-quest-v1';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const uid = () => 'q'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);
  const blank = () => ({quests:[], fields:[], items:[], history:[]});
  const initial = () => ({v:1,world:'',worlds:{}});
  let data;
  try { data=JSON.parse(localStorage.getItem(STORE)||'null') || initial(); } catch {data=initial();}
  if(!data || data.v!==1 || !data.worlds || typeof data.worlds!=='object') data=initial();
  const save=()=>{try{localStorage.setItem(STORE,JSON.stringify(data));return true;}catch(e){alert('저장하지 못했습니다: '+e.message);return false;}};
  const now=()=>new Date().toLocaleString('ko-KR');
  const current=()=>{if(!data.world || !data.worlds[data.world]) return null;return data.worlds[data.world];};
  let root, panel, currentTab='quests', activeFilter='전체';
  const style=document.createElement('style');style.id=ID+'-style';
  style.textContent=`
#${ID}-launcher{position:fixed;right:16px;bottom:82px;z-index:2147483000;background:#243448;color:#fff;border:1px solid #6b7f99;border-radius:999px;padding:11px 16px;font:600 13px system-ui;box-shadow:0 5px 18px #0005;cursor:pointer}
#${ID}-panel{margin:0 12px 0 auto;position:fixed;right:12px;top:50%;transform:translateY(-50%);width:min(410px,calc(100vw - 24px));max-height:min(88dvh,760px);overflow:auto;overscroll-behavior:contain;background:var(--gfq-bg,#fafafc);color:var(--gfq-fg,#222);border:1px solid #8992a555;border-radius:18px;z-index:2147483001;box-shadow:0 16px 45px #0007;font:14px/1.5 system-ui,sans-serif;padding:17px;box-sizing:border-box}
#${ID}-panel::backdrop{background:rgba(0,0,0,.45)}#${ID}-panel *{box-sizing:border-box}#${ID}-panel .gfq-head{display:flex;align-items:center;justify-content:space-between;gap:8px}#${ID}-panel h2{font-size:19px;margin:0}#${ID}-panel h3{font-size:15px;margin:12px 0 8px}#${ID}-panel button,#${ID}-panel select,#${ID}-panel input,#${ID}-panel textarea{font:inherit;border-radius:9px;border:1px solid #8992a580;padding:7px;color:inherit;background:transparent;max-width:100%}#${ID}-panel button{cursor:pointer}#${ID}-panel button.primary{background:#476a96;color:white;border-color:#476a96}#${ID}-panel button:disabled{opacity:.5;cursor:default}#${ID}-panel input,#${ID}-panel textarea{width:100%}#${ID}-panel .gfq-tabs,#${ID}-panel .gfq-row{display:flex;gap:6px;flex-wrap:wrap;align-items:center}#${ID}-panel .gfq-tabs{margin:12px 0}#${ID}-panel .gfq-card{border:1px solid #8992a550;border-radius:12px;padding:11px;margin:8px 0;overflow-wrap:anywhere}#${ID}-panel .gfq-muted{font-size:12px;opacity:.7}#${ID}-panel .gfq-fill{flex:1;min-width:0}#${ID}-panel label{display:block;font-size:12px;margin-top:7px;opacity:.8}#${ID}-panel .gfq-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}#${ID}-panel progress{width:100%;height:8px}#${ID}-panel textarea{min-height:60px;resize:vertical}#${ID}-panel .gfq-danger{color:#bc4545}#${ID}-panel [hidden]{display:none!important}
@media(prefers-color-scheme:dark){#${ID}-panel{--gfq-bg:#20262f;--gfq-fg:#f1f4f8}}@media(max-width:600px){#${ID}-panel{inset:8px;width:auto;max-height:calc(100dvh - 16px);transform:none;margin:auto}#${ID}-launcher{bottom:18px}}
`;

  /* Quest visual overhaul v0.1.3: scoped, non-destructive */
  style.textContent += `
#gfq-01-panel{--gfq-bg:#0c1320;--gfq-fg:#f1f5ff;position:fixed;inset:0;margin:auto;transform:none;right:0;left:0;top:0;bottom:0;width:min(1160px,calc(100vw - 38px));height:min(760px,calc(100dvh - 36px));max-height:none;padding:0;overflow:hidden;color:#edf3fc;border:1px solid #526d8b;border-radius:2px;background:linear-gradient(135deg,#111e31 0%,#0c1525 45%,#151d2a 100%);box-shadow:0 25px 100px #000d;font-family:system-ui,"Noto Sans KR",sans-serif}
#gfq-01-panel::backdrop{background:#03070cc7;backdrop-filter:blur(3px)}
#gfq-01-panel .gfq-frame{height:100%;display:grid;grid-template-columns:208px minmax(0,1fr);grid-template-rows:80px minmax(0,1fr) 48px}
#gfq-01-panel .gfq-head{grid-column:1/-1;margin:0;display:flex;align-items:center;padding:0 28px;gap:18px;border:0;border-bottom:1px solid #3b536d;background:linear-gradient(90deg,#182944,#1c2939 70%,#172132)}
#gfq-01-panel .gfq-mark{display:flex;align-items:center;justify-content:center;width:43px;height:43px;border:1px solid #7fb2ef;color:#c8e5ff;font-size:25px;clip-path:polygon(18% 0,100% 0,100% 82%,82% 100%,0 100%,0 18%);background:#2a4465}
#gfq-01-panel .gfq-head h2{margin:0;font-size:22px;font-weight:800;letter-spacing:.08em}
#gfq-01-panel .gfq-head .gfq-en{font-size:9px;color:#86a6c6;letter-spacing:.23em;margin-top:3px}
#gfq-01-panel .gfq-head button{margin-left:auto;min-width:40px;height:40px;color:#d8e6f8;border:1px solid #5b7797;border-radius:2px;background:#243550}
#gfq-01-panel .gfq-side{background:linear-gradient(165deg,#162741,#101c30 62%,#0c1424);border-right:1px solid #354d69;display:flex;flex-direction:column;min-height:0;padding:24px 0}
#gfq-01-panel .gfq-side-head{font-size:10px;letter-spacing:.25em;color:#7a9abb;padding:0 22px 14px}
#gfq-01-panel .gfq-tabs{display:flex;flex-direction:column;gap:5px;position:static;width:auto;margin:0;align-items:stretch}
#gfq-01-panel .gfq-tabs button{border:0;border-left:3px solid transparent;border-radius:0;text-align:left;background:transparent;min-height:49px;padding:11px 22px;color:#aebfd4;font-size:14px;font-weight:650;display:flex;align-items:center;gap:12px}
#gfq-01-panel .gfq-tabs button.primary{border-left-color:#a5d7ff;background:linear-gradient(90deg,#315b95,#294269);color:#fff;box-shadow:inset 0 1px #719bd344}
#gfq-01-panel .gfq-tabs button .gfq-nav-icon{font-size:19px;min-width:22px;text-align:center;opacity:.85}
#gfq-01-panel .gfq-side-foot{margin-top:auto;font-size:10px;color:#64809e;padding:0 23px;letter-spacing:.11em}
#gfq-01-panel .gfq-main{min-width:0;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:27px 32px 20px;background:radial-gradient(ellipse at 85% 10%,#29394b55,transparent 52%)}
#gfq-01-panel .gfq-context{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid #3c5168}
#gfq-01-panel .gfq-context b{display:block;font-size:20px;letter-spacing:.025em}
#gfq-01-panel .gfq-context .gfq-muted{margin-top:5px}
#gfq-01-panel .gfq-worldbar{display:flex;gap:7px;align-items:center;flex-wrap:wrap;margin:0 0 17px}
#gfq-01-panel #gfq-world{min-width:170px;width:min(290px,100%);background:#1e3047;border:1px solid #587591;color:#eaf1fd;min-height:40px;border-radius:2px}
#gfq-01-panel button{border-radius:2px;font-weight:600;transition:background-color .15s}
#gfq-01-panel .gfq-worldbar button{border:1px solid #52769b;background:#203450;color:#d5e7fc}
#gfq-01-panel .gfq-toolbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:0 0 16px}
#gfq-01-panel .gfq-toolbar select{border:1px solid #6b809a;background:#24354b;color:#f0f6ff;min-height:39px}
#gfq-01-panel button.primary{background:#386fc4;color:#fff;border:1px solid #70a3fa;min-height:39px}
#gfq-01-panel .gfq-card{display:block;border-radius:2px;margin:11px 0;border:1px solid #c5d2e3;border-left:5px solid #6397db;background:linear-gradient(110deg,#f8fbff 0%,#edf3fa 80%,#e2ebf6 100%);color:#1a2c44;box-shadow:0 4px 16px #03091533;padding:15px 19px;position:relative}
#gfq-01-panel .gfq-card::before{content:"";position:absolute;top:0;right:0;width:35%;height:100%;pointer-events:none;opacity:.35;background:radial-gradient(#97adc5 1px,transparent 1.5px) right center/7px 7px;mask-image:linear-gradient(90deg,transparent,#000)}
#gfq-01-panel .gfq-card::after{content:none}
#gfq-01-panel .gfq-card>b{color:#254b79;font-size:15px}
#gfq-01-panel .gfq-card b{font-size:15px;color:#284f81;z-index:1}
#gfq-01-panel .gfq-card .gfq-muted{color:#62758b;opacity:1}
#gfq-01-panel .gfq-card .gfq-row{position:relative;z-index:1}
#gfq-01-panel .gfq-card button{background:#ecf3fd;color:#27517f;border:1px solid #aec2dd;padding:5px 12px}
#gfq-01-panel .gfq-card progress{accent-color:#5586d9;height:7px;margin:10px 0 6px}
#gfq-01-panel .gfq-muted{font-size:12px;color:#8dabc8;opacity:1}
#gfq-01-panel .gfq-empty{margin-top:18px;min-height:210px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;background:linear-gradient(145deg,#1e2f45,#152235);border:1px dashed #466587;padding:35px;gap:9px}
#gfq-01-panel .gfq-empty-symbol{font-size:38px;color:#86addb}
#gfq-01-panel .gfq-empty strong{font-size:17px;color:#e1ecfa}
#gfq-01-panel .gfq-footer{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;border-top:1px solid #334960;background:#101e31;padding:0 23px;color:#7795b6;font-size:10px;letter-spacing:.13em}
#gfq-01-panel .gfq-footer span:last-child{color:#b5c9df}
#gfq-01-panel .gfq-main p{line-height:1.55}
#gfq-01-panel .gfq-danger{color:#f38f8f}
@media(max-width:700px){#gfq-01-panel{inset:3px;width:calc(100vw - 6px);height:calc(100dvh - 6px)}#gfq-01-panel .gfq-frame{grid-template-columns:1fr;grid-template-rows:62px auto minmax(0,1fr) 37px}#gfq-01-panel .gfq-head{padding:0 14px}#gfq-01-panel .gfq-head h2{font-size:17px}#gfq-01-panel .gfq-side{border-right:0;border-bottom:1px solid #41546d;padding:4px 8px}#gfq-01-panel .gfq-side-head,#gfq-01-panel .gfq-side-foot{display:none}#gfq-01-panel .gfq-tabs{flex-direction:row;overflow-x:auto;gap:0}#gfq-01-panel .gfq-tabs button{min-height:39px;padding:7px 11px;white-space:nowrap;font-size:12px;gap:5px;border-left:0;border-bottom:2px solid transparent}#gfq-01-panel .gfq-tabs button.primary{border-bottom-color:#92c7ff}#gfq-01-panel .gfq-tabs button .gfq-nav-icon{font-size:14px;min-width:15px}#gfq-01-panel .gfq-main{padding:14px}#gfq-01-panel .gfq-context{margin-bottom:12px}#gfq-01-panel .gfq-context b{font-size:17px}#gfq-01-panel .gfq-card{padding:12px}}
`;
  document.head.append(style);
  function allowed(){return !!document.querySelector('[data-agent-id="gacha-forge"], [data-package-id="gacha-forge"], [class*="gacha-forge"], [id*="gacha-forge"], [class*="gf-shell"], [class*="gf-app"]') || /gacha.forge/i.test(document.title) || /gacha-forge/i.test(location.pathname+location.hash);}
  const HOST_TAG = 'marinara-capability-gacha-forge';
  let gameHost = null, gameRoot = null, gameObserver = null, gameDebounce = 0;
  function findHost(){ return document.querySelector(HOST_TAG); }
  function getButton(){return gameRoot?.querySelector('button[data-gfq="top"]');}
  function placeButton(){
    if(!gameRoot)return;
    if(getButton())return;
    const fs=[...gameRoot.querySelectorAll('.gf-fs-bar')].find(el=>el.classList.contains('icon-button'));
    if(!fs || !fs.parentElement)return;
    const b=document.createElement('button');b.type='button';b.className='icon-button';b.dataset.gfq='top';
    b.title='퀘스트';b.setAttribute('aria-label','퀘스트');b.textContent='📜';
    b.addEventListener('pointerdown',e=>e.stopPropagation());
    b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openPanel();});
    fs.parentElement.insertBefore(b,fs);
  }
  function mount(){
    if(!document.body)return;
    if(root){root.remove();root=null;}
    const host=findHost();
    if(host!==gameHost || (host && host.shadowRoot!==gameRoot)){
      if(gameObserver){gameObserver.disconnect();gameObserver=null;}
      gameHost=host;gameRoot=host?.shadowRoot||null;
      if(gameRoot){
        gameObserver=new MutationObserver(()=>{if(gameDebounce)return;gameDebounce=setTimeout(()=>{gameDebounce=0;placeButton();},120);});
        gameObserver.observe(gameRoot,{childList:true,subtree:true});
      }
    }
    placeButton();
  }
  function openPanel(){if(panel){panel.close();panel.remove();panel=null;mount();return;}panel=document.createElement('dialog');panel.id=ID+'-panel';panel.setAttribute('aria-label','퀘스트');document.body.append(panel);panel.addEventListener('cancel',e=>{e.preventDefault();openPanel();});render();panel.showModal();mount();}
  // Story context preview. Does not intercept or modify official Gacha Forge model calls.
  function buildQuestContext(){
    const w=current();if(!w)return '';
    const active=w.quests.filter(q=>!q.claimed).slice(0,24);
    const fields=w.fields.slice(0,35);
    const items=w.items.slice(0,35);
    return [
      '[WORLD QUEST CONTEXT — user-maintained reference]',
      'World: '+data.world,
      'Active quests:',
      ...(active.length?active.map(q=>'- '+q.title+' ('+q.type+'): '+q.detail+' ['+q.progress+'/'+q.target+']; reward note: '+q.reward):['- none']),
      'Character/world assets:',
      ...(fields.length?fields.map(f=>'- '+f.name+': '+f.value+' '+f.unit):['- none']),
      'Story inventory:',
      ...(items.length?items.map(i=>'- '+i.name+': '+i.qty):['- none']),
      'Treat these entries as established reference only when consistent with the story. Never assume a reward was paid, a task completed, or an item transferred without an explicit narrative event. Do not invent player actions or dialogue. Do not change Gacha Forge system currency.',
      '[/WORLD QUEST CONTEXT]'
    ].join('\n').slice(0,11000);
  }
  async function copyQuestContext(){
    const txt=buildQuestContext();
    if(!txt)return alert('먼저 월드를 선택해 주세요.');
    try{await navigator.clipboard.writeText(txt);alert('퀘스트 문맥을 복사했습니다. 공식 스토리 지침에 직접 붙여넣어 주세요. 아직 자동 주입 기능은 지원하지 않습니다.');}
    catch{prompt('복사한 내용을 스토리 지침에 붙여넣어 주세요:',txt);}
  }

  // Official Gacha Forge 1.8.12 read-only API integration.
  const GAME_API='/api/gacha-forge';
  let worldSyncBusy=false, worldSyncTimer=null, scanBusy=false, lastSyncError='', linkedRunId='';
  const chapterFingerprints=new Map();
  async function gameJson(path,body){
    const opts=body===undefined?{method:'GET',credentials:'same-origin'}:{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)};
    const res=await fetch(GAME_API+path,opts);
    if(!res.ok)throw Error('HTTP '+res.status+' '+path);
    const j=await res.json();
    if(j&&j.ok===false)throw Error(j.error||'게임 조회 실패');
    return j;
  }

  // Observe existing, successfully authorised Gacha Forge traffic without extracting credentials.
  const observed={runId:'',name:'',lastSeen:0};
  const priorFetch=window.fetch;
  function attachObservedRun(id,name=''){
    const runId=String(id||'').trim();
    if(!runId || runId.length>128)return;
    observed.runId=runId;
    if(name)observed.name=String(name).trim().slice(0,100);
    observed.lastSeen=Date.now();
    let key=Object.keys(data.worlds).find(k=>data.worlds[k]?.gfRunId===runId);
    if(!key){
      const label=observed.name||('게임 월드 '+runId.slice(0,8));
      const legacy=data.worlds[label];
      if(legacy&&!legacy.gfRunId){key=label;legacy.gfRunId=runId;}
      else{key=data.worlds[label]?label+' ('+runId.slice(0,8)+')':label;data.worlds[key]=blank();data.worlds[key].gfRunId=runId;}
    }
    if(!data.worlds[key]?.gfRunId)data.worlds[key].gfRunId=runId;
    if(observed.name&&data.worlds[key].gfDisplayName!==observed.name){data.worlds[key].gfDisplayName=observed.name;save();if(panel)render();}
    const changed=data.world!==key;data.world=key;linkedRunId=runId;lastSyncError='';
    if(changed)save();
    if(panel&&changed)render();
  }
  // Read the metadata of successful game responses only; never make unauthorised chapter requests.
  function rememberChapters(runId,reply,path){
    if(!runId||!reply||typeof reply!=='object')return;
    const key=Object.keys(data.worlds).find(k=>data.worlds[k]?.gfRunId===String(runId));
    if(!key)return;
    const world=data.worlds[key],rows=Array.isArray(reply.chapters)?reply.chapters:null;
    if(!rows)return;
    if(/\/chapters$/.test(path)){
      world.gfChapterIndex=rows.slice(0,200).map(c=>({chapter:c.chapter,title:c.title,premise:c.premise,cleared:!!c.cleared,normal:c.normal}));
    }else if(/\/continuity$/.test(path)){
      world.gfContinuityIndex=rows.slice(0,200).map(c=>({chapter:c.chapter,title:c.title,storyBeats:c.storyBeats,complete:!!c.complete,compressed:!!c.compressed}));
    }else return;
    const fingerprint=JSON.stringify([world.gfChapterIndex||null,world.gfContinuityIndex||null]);
    if(chapterFingerprints.get(key)===fingerprint)return;
    chapterFingerprints.set(key,fingerprint);
    world.gfScannedAt=now();save();if(panel&&data.world===key&&currentTab==='history')render();
  }

  // Conservative story intake: already delivered game data only. No new generation or server writes.
  function intakeStory(runId,reply,path,req){
    if(!runId||!(/\/(beat|story|run)(\/|$)/.test(path)))return;
    const key=Object.keys(data.worlds).find(k=>data.worlds[k]?.gfRunId===String(runId));
    if(!key)return;
    const w=data.worlds[key];w.gfStorySamples ||= [];
    const beat=reply?.beat||reply?.story||reply;
    const samples=[];
    function walk(v,depth=0){
      if(depth>5||samples.length>=75||!v)return;
      if(Array.isArray(v)){for(const item of v.slice(0,80))walk(item,depth+1);return;}
      if(typeof v!=='object')return;
      for(const [k,value] of Object.entries(v)){
        if(['prompt','system','instructions','context','lore','history','messages','request'].includes(k.toLowerCase()))continue;
        if(['text','narration','narrative','dialogue','content','line','prose'].includes(k.toLowerCase())&&typeof value==='string'&&value.trim().length>12){
          samples.push(value.trim().slice(0,1600));
        } else if(value&&typeof value==='object'&&['segments','beat','story','scene','lines','dialogues','events'].includes(k.toLowerCase()))walk(value,depth+1);
      }
    }
    walk(beat);
    if(!samples.length)return;
    const chapter=String(req.chapter??beat.chapter??reply.chapter??'?');
    const index=String(req.storyIndex??beat.storyIndex??reply.storyIndex??'?');
    let changed=false;
    for(const text of samples){
      const signature=chapter+'|'+index+'|'+text;
      let hash=2166136261;for(let i=0;i<signature.length;i++)hash=Math.imul(hash^signature.charCodeAt(i),16777619)>>>0;
      const id='e'+hash.toString(36);
      if(w.gfStorySamples.some(e=>e.id===id))continue;
      w.gfStorySamples.push({id,chapter,index,text,at:now()});changed=true;
    }
    if(changed){
      // v0.3.5: record scenes dropped by the 180-scene cap so missing payments can be diagnosed.
      const over=w.gfStorySamples.length-180;
      if(over>0){w.gfEvicted||={};for(const e of w.gfStorySamples.slice(0,over)){const c=String(e.chapter);w.gfEvicted[c]=(w.gfEvicted[c]||0)+1;}}
      w.gfStorySamples=w.gfStorySamples.slice(-180);save();if(panel&&currentTab==='history'&&data.world===key)render();}
  }
  function storyCandidates(w){
    const sources=[
      ...(w.gfChapterIndex||[]).map(c=>({source:'챕터 '+c.chapter+' · 줄거리',text:String(c.premise||'')})),
      ...(w.gfStorySamples||[]).map(e=>({source:'챕터 '+e.chapter+' · 장면 '+e.index,text:e.text}))
    ];
    const checks=[
      ['의뢰/목표',/(의뢰|임무|조사|부탁|계약|요청|목표|수락|해결|완료)/g],
      ['자산/거래',/(정산|수당|급여|보수|대금|구매|지불|입금|송금|결제|계약금|잔금)/g],
      ['아이템/소지품',/(획득|수령|전달받|지급받|챙겼|보관|반납|사용했|소모|장비|소재|유물)/g]
    ];
    const found=[];const seen=new Set();
    for(const src of sources){
      const sentences=src.text.split(/(?<=[.!?。]|다\.)\s+|\n+/u).filter(Boolean);
      for(const segment of sentences){
        for(const [type,re] of checks){
          re.lastIndex=0;if(!re.test(segment))continue;
          const quote=segment.trim().slice(0,420),token=type+'|'+quote;
          if(!quote||seen.has(token))continue;seen.add(token);
          found.push({id:'c'+found.length,type,source:src.source,quote});
          if(found.length>=90)return found;
        }
      }
    }
    return found;
  }
  function candidateHtml(w){
    const rejected=new Set(w.gfDismissed||[]),reviewed=new Set(w.gfReviewed||[]);
    const candidates=storyCandidates(w).filter(c=>!rejected.has(c.type+'|'+c.quote)&&!reviewed.has(c.type+'|'+c.quote));
    const items=candidates.slice(0,50);
    return '<h3>스토리 분석 후보 ('+candidates.length+'개)</h3><p class="gfq-muted">키워드 기반 1차 추출이며 실제 발생 사실은 확정되지 않았습니다. 근거를 확인하고 기록으로 채택해 주세요. 자산과 소지품은 자동 변경하지 않습니다.</p>'+
      (items.map(c=>'<div class="gfq-card"><div class="gfq-row"><b class="gfq-fill">'+esc(c.type)+'</b><small>'+esc(c.source)+'</small></div><p>'+esc(c.quote)+'</p><div class="gfq-row"><button data-action="review-candidate" data-id="'+esc(c.id)+'">검토 기록으로 채택</button><button data-action="dismiss-candidate" data-id="'+esc(c.id)+'">제외</button></div></div>').join('')||'<p class="gfq-muted">검토할 후보가 없습니다. 기존 줄거리에서 탐지된 사건이 없거나 장면 본문을 아직 수집하지 못했을 수 있습니다.</p>');
  }
  function nameOfRun(x){return String(x?.name||x?.title||x?.worldName||x?.world?.name||'').trim().slice(0,100);}
  function absorbGameReply(req,response){
    const type=response?.headers?.get?.('content-type')||'';
    if(!response?.ok||!type.includes('json'))return;
    const size=Number(response.headers?.get?.('content-length')||0);
    if(size>1024*1024)return;
    response.clone().json().then(v=>{
      if(!v||typeof v!=='object')return;
      const active=v.activeRun;
      const runId=req.runId||active?.runId||v.activeRunId||v.run?.runId;
      let name=nameOfRun(active)||nameOfRun(v.run);
      if(!name&&Array.isArray(v.runs)){const match=v.runs.find(x=>x?.runId===runId);name=nameOfRun(match);}
      if(!name&&Array.isArray(v.worlds)){const match=v.worlds.find(x=>x?.runId===runId);name=nameOfRun(match);}
      if(runId){attachObservedRun(runId,name);rememberChapters(runId,v,req.url||'');intakeStory(runId,v,req.url||'',req);}
    }).catch(()=>{});
  }
  const observedFetch=function(input,options){
    const result=priorFetch.apply(this,arguments);
    try{
      const url=new URL(typeof input==='string'?input:input?.url,location.href);
      if(url.origin!==location.origin || !url.pathname.startsWith('/api/gacha-forge/'))return result;
      let req={};
      if(typeof options?.body==='string'){
        try{const body=JSON.parse(options.body);if(body&&typeof body==='object')req=body;}catch{}
      }
      if(req.runId)attachObservedRun(req.runId);
      req.url=url.pathname;
      if(result?.then && /\/(?:state|runs|chapters|continuity|beat|story|run)(?:\/|$)/.test(url.pathname))result.then(response=>absorbGameReply(req,response)).catch(()=>{});
    }catch{}
    return result;
  };
  window.fetch=observedFetch;
  async function syncWorld(){
    if(worldSyncBusy||!gameRoot)return;
    if(observed.runId){attachObservedRun(observed.runId,observed.name);return;}
    lastSyncError='게임 통신에서 월드 정보를 아직 확인하지 못했습니다. 가챠 포지에서 월드를 선택하거나 스토리를 열어 주세요.';
    if(panel)render();
    return;
    /* direct unauthenticated /state calls deliberately disabled.
    worldSyncBusy=true;
    try{
      const state=await gameJson('/state');
      const run=state.activeRun||state.runs?.find(r=>r.runId===state.activeRunId);
      if(!run?.runId){lastSyncError='게임이 활성 월드를 반환하지 않았습니다. 가챠 포지에서 월드를 선택해 주세요.';if(panel)render();return;}
      const id=String(run.runId), name=String(run.name||'이름 없는 월드').trim();
      if(!id)return;
      let key=Object.keys(data.worlds).find(k=>data.worlds[k]?.gfRunId===id);
      if(!key){
        const legacy=data.worlds[name];
        if(legacy&&!legacy.gfRunId){key=name;legacy.gfRunId=id;}
        else{
          key=data.worlds[name]?name+' ('+id.slice(0,8)+')':name;
          data.worlds[key]=blank();data.worlds[key].gfRunId=id;
        }
      }
      if(data.world!==key){data.world=key;}
      linkedRunId=id;lastSyncError='';
      save();if(panel)render();
    }catch(e){lastSyncError=String(e?.message||e);if(panel)render();}
    finally{worldSyncBusy=false;} */
  }
  async function scanExistingChapters(){
    const w=current();
    if(!w?.gfRunId){alert('먼저 게임 월드 연결을 확인해 주세요.');return;}
    alert('403 오류를 방지하기 위해 별도 조회 요청을 보내지 않습니다. 게임에서 기존 스토리 또는 챕터 화면을 열어 주세요. 해당 화면의 정상 응답을 관찰하여 가져올 수 있는 기록만 반영합니다.');
  }
  function chapterIndexHTML(w){
    const chapters=w.gfChapterIndex||[];
    if(!chapters.length)return '<div class="gfq-muted">조회된 챕터 목록이 없습니다. 기존 장면 본문은 아직 가져오지 않았습니다.</div>';
    return '<h3>기존 스토리 목록 ('+chapters.length+'개)</h3><p class="gfq-muted">공식 API에서 조회한 제목·줄거리·완료 상태입니다. 장면 본문 및 자산 거래 분석 결과는 포함되지 않습니다.</p>'+chapters.map(c=>'<div class="gfq-card"><b>챕터 '+esc(c.chapter)+' · '+esc(c.title)+'</b><div class="gfq-muted">'+esc(c.premise||'줄거리 정보가 없습니다')+'</div><small>'+ (c.cleared?'완료':'진행 중')+'</small></div>').join('');
  }

  // Reuse the engine's public connection metadata. Do not read, transmit or store API keys.
  let aiConnections=[],aiConnectionError='',aiConnectionLoading=false;
  async function refreshAiConnections(){
    if(aiConnectionLoading)return;
    aiConnectionLoading=true;aiConnectionError='';
    try{
      const response=await fetch('/api/connections',{method:'GET',credentials:'same-origin'});
      if(!response.ok)throw Error('HTTP '+response.status);
      const raw=await response.json();
      const items=Array.isArray(raw)?raw:Array.isArray(raw?.connections)?raw.connections:[];
      aiConnections=items.filter(x=>x?.id&&!['image_generation','video_generation'].includes(String(x.provider||'')))
        .map(x=>({id:String(x.id),name:String(x.name||x.model||x.id),model:String(x.model||'')}));
      if(!aiConnections.length)aiConnectionError='사용 가능한 텍스트 AI 연결이 없습니다.';
    }catch(e){aiConnectionError='연결 목록을 불러오지 못했습니다: '+String(e?.message||e);}
    finally{aiConnectionLoading=false;if(panel&&currentTab==='settings')render();}
  }
  function gfqWorldRulesHtml(w){
    const ctx=gfqRuleCtx(w);
    return '<div class="gfq-card"><b>월드 분석 기준</b><p class="gfq-muted">AI 분석은 주인공에게 귀속되는 돈·물품·자격·계약·의뢰만 후보로 고릅니다. 이름이 비어 있으면 \'주인공(플레이어 캐릭터)\'로 안내합니다.</p>'+
      '<label for="gfq-hero">주인공 이름</label><input id="gfq-hero" maxlength="40" placeholder="예: 홍길동" value="'+esc(w.protagonist||'')+'">'+
      '<label><input type="checkbox" id="gfq-legacy" style="width:auto" '+(ctx.legacy?'checked':'')+'> 기존 월드 전용 보정 규칙(v0.3.4) 사용</label>'+
      '<p class="gfq-muted">v0.3.4까지 특정 챕터·사건에 맞춰 넣었던 보정입니다. 처음 만든 월드에서만 켜 두시고, 새 월드에서는 꺼 두시기를 권장합니다.</p></div>';
  }
  function aiSettingsHTML(){
    const selected=String(data.aiConnectionId||'');
    const choices=aiConnections.map(c=>'<option value="'+esc(c.id)+'" '+(selected===c.id?'selected':'')+'>'+esc(c.name)+(c.model?' · '+esc(c.model):'')+'</option>').join('');
    return '<div class="gfq-card"><b>AI 스토리 분석 연결</b><p class="gfq-muted">마리나라에 등록된 텍스트 AI 연결을 사용합니다. 별도 API 키를 입력하지 않습니다.</p>'+
      '<label for="gfq-ai-connection">분석 모델</label><select id="gfq-ai-connection"><option value="">분석 연결을 선택해 주세요</option>'+choices+'</select>'+
      '<p class="gfq-muted">'+(aiConnectionError?esc(aiConnectionError):'선택한 연결로 스토리를 분석할 수 있습니다.')+'</p>'+
      '<button data-action="refresh-ai-connections">연결 목록 새로고침</button>'+
      '<label for="gfq-ai-mode">실행 방식</label><select id="gfq-ai-mode"><option value="manual" '+(data.aiMode!=='auto'?'selected':'')+'>수동 분석 (권장)</option><option value="auto" '+(data.aiMode==='auto'?'selected':'')+'>자동 분석 (호출 연동 후 사용 가능)</option></select>'+
      '<label for="gfq-ai-scope">분석 범위</label><select id="gfq-ai-scope"><option value="chapter" '+(data.aiScope!=='scene'?'selected':'')+'>챕터 단위</option><option value="scene" '+(data.aiScope==='scene'?'selected':'')+'>장면 단위</option></select>'+
      '</div>';
  }

  // Structured AI review pipeline. Transport is intentionally decoupled from the host's private model runtime.
  // v0.3.6: per-world rule context. Rules written for the original world (v0.3.4 rule pack)
  // run only where that pack is enabled; every other world uses the generic path.
  const GFQ_LEGACY_PACK='legacy-0.3.4';
  const GFQ_GENERIC=Object.freeze({legacy:false,hero:''});
  function gfqRuleCtx(w){
    if(!w)return GFQ_GENERIC;
    if(w.protagonist===undefined){
      // One-time migration: the world the v0.3.4 rules were written for is recognised from its own stored story.
      const texts=(w.gfChapterIndex||[]).map(c=>String(c.premise||'')).concat((w.gfStorySamples||[]).map(e=>String(e.text||'')));
      const legacy=texts.some(t=>t.includes('채서래'));
      w.protagonist=legacy?'채서래':'';
      if(legacy&&!w.gfRulePack)w.gfRulePack=GFQ_LEGACY_PACK;
    }
    return {legacy:w.gfRulePack===GFQ_LEGACY_PACK,hero:String(w.protagonist||'').trim()};
  }
  const gfqEsc=s=>String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  function gfqEventEligible(x,ctx=GFQ_GENERIC){
    if(!x||!['quest','asset','item','credential','contract'].includes(x.category))return false;
    if(x.owner&&x.owner!=='player')return false;
    const name=String(x.name||''),quote=String(x.evidence||''),both=name+' '+quote;
    if(x.category==='asset'){
      if(x.financialStatus==='not_applicable')return false;
      if(['명','톤','개'].includes(String(x.unit||'')))return false;
      if(ctx.legacy&&/대피|셔터|송장|오차율|용해로 압력|고철 더미|쐐기 파손/.test(name))return false;
    }
    if(!ctx.legacy)return true;
    if(x.category==='quest'&&/각성 사태|폭주 공명 위험|압력 상승|밀수품 발견|마수 각성 사태|수당 정산|보수 정산|시료 채취|셔터 폐쇄|연구원 대피/.test(name))return false;
    if(x.category==='credential'&&/수령을 위해|서명 인장/.test(both))return false;
    if(x.category==='item'&&/앰플.*장전|추가 장전/.test(both)&&!new RegExp(gfqEsc(ctx.hero||'채서래')+'.{0,30}(받|획득|소지|장전)').test(quote))return false;
    if(x.category==='item'&&/각성제|밀수품/.test(name)&&!new RegExp(gfqEsc(ctx.hero||'채서래')+'.*(획득|수령|소지)').test(quote))return false;
    return true;
  }
  function gfqSafeProposal(x,ctx=GFQ_GENERIC){
    const result={...x};
    const q=String(result.evidence||''),name=String(result.name||'');
    if(['asset','contract'].includes(result.category)&&result.financialStatus==='received'){
      // Settled/closed accounts are not necessarily bank deposits.
      if(!/(입금(?:됐|되었|받았|완료| 확인)|계좌.{0,24}(입금|입금됐|들어왔)|송금(?:받|완료)|잔액.{0,20}(증가|늘어)|실제.{0,12}(수령|지급받))/u.test(q)){
        result.financialStatus='receivable';result.auditNote='계좌 입금 근거가 없어 미수·정산 기록으로 보류했습니다.';
      }
    }
    // v0.3.5: the same deposit rule applies to quests and their reward candidates.
    if(result.category==='quest'){
      const deposit=/(입금(?:됐|되었|받았|완료| 확인)|계좌.{0,24}(입금|입금됐|들어왔)|송금(?:받|완료)|잔액.{0,20}(증가|늘어)|실제.{0,12}(수령|지급받))/u;
      const done=result.status==='completed';
      if(result.financialStatus==='received'&&!deposit.test(q))result.financialStatus=done?'receivable':'pending';
      if(Array.isArray(result.questRewards)){
        let downgraded=false;
        result.questRewards=result.questRewards.map(r=>{
          if(!r||typeof r!=='object'||r.certainty!=='received'||r.kind!=='money')return r;
          if(deposit.test(String(r.evidence||''))||deposit.test(q))return r;
          downgraded=true;return {...r,certainty:done?'confirmed':'pending'};
        });
        if(downgraded)result.auditNote='보상 정산 표현만 있고 계좌 입금 근거가 없어 수령 확인에서 '+(done?'확정(미입금)':'지급 예정')+'으로 낮췄습니다.';
      }
    }
    if(result.category==='item'&&(/(내일|예정|제작 중|제작 건|수령하시게|상당)/.test(q)||String(result.unit)==='원')){
      result.status='active';result.financialStatus='pending';
      result.auditNote='미수령·제작 중 물품 또는 시가 정보로 보입니다.';
    }
    if(ctx.legacy&&result.category==='asset'&&result.financialStatus==='pending'&&result.unit==='원'&&/(기본 수당|위험 수당)/.test(name))result.auditNote='동일 용역 보수 총액의 구성 항목일 수 있습니다. 합계에 중복 포함하지 마세요.';
    if(ctx.legacy&&result.category==='asset'&&result.financialStatus==='pending'&&result.amount===1400000&&/총액|정산/.test(name))result.auditNote='95만 원과 45만 원을 포함한 총액일 수 있습니다. 중복 합산하지 마세요.';
    // v0.3.5: only the evidenced Physical-class C license is normalised; other licenses keep their own names.
    if(ctx.legacy&&result.category==='credential'&&/면허/.test(name)&&/물리계/.test(name+' '+q)&&/C\s*급/.test(name+' '+q))result.name='물리계 C급 정식 면허';
    return result;
  }
  // v0.3.5: tolerant evidence lookup. Ignores spacing, quote style and light punctuation,
  // then returns the exact original span so stored evidence always matches the saved story.
  const GFQ_SKIP=/[\s.,!?~…·:;'"“”‘’「」『』()\[\]<>\-—–_*]/u;
  function gfqNormMap(text){
    const s=String(text||'').normalize('NFC');let out='';const map=[];
    for(let i=0;i<s.length;i++){if(GFQ_SKIP.test(s[i]))continue;out+=s[i];map.push(i);}
    return {s,out,map};
  }
  function gfqLocateEvidence(evidence,texts){
    const needle=gfqNormMap(evidence).out;
    if(needle.length<6)return null;
    for(const t of texts){
      const raw=String(t||'');
      if(raw.includes(evidence))return evidence;
      const m=gfqNormMap(raw),at=m.out.indexOf(needle);
      if(at<0)continue;
      return m.s.slice(m.map[at],m.map[at+needle.length-1]+1);
    }
    return null;
  }
  // v0.3.5: chronological story records (chapter premise first, then scenes in order).
  function gfqStoryRecords(w){
    const num=v=>{const n=Number(v);return Number.isFinite(n)?n:Number.MAX_SAFE_INTEGER;};
    const rows=[
      ...(w.gfChapterIndex||[]).map((c,i)=>({source:'챕터 '+c.chapter+' · 줄거리',text:String(c.premise||''),ch:num(c.chapter),ix:-1,order:i})),
      ...(w.gfStorySamples||[]).map((x,i)=>({source:'챕터 '+x.chapter+' · 장면 '+x.index,text:String(x.text||''),ch:num(x.chapter),ix:num(x.index),order:i}))
    ].filter(x=>x.text.trim());
    rows.sort((a,b)=>a.ch-b.ch||a.ix-b.ix||a.order-b.order);
    return rows.map(x=>({source:x.source,text:x.text,ch:x.ch}));
  }
  // v0.3.5: parse model output; if the reply was cut off, recover every complete event object.
  function gfqParseEvents(raw){
    const text=String(raw||'').trim().replace(/^\x60\x60\x60(?:json)?\s*/i,'').replace(/\s*\x60\x60\x60$/,'');
    try{const v=JSON.parse(text);const ev=Array.isArray(v)?v:v?.events;if(Array.isArray(ev))return {events:ev,partial:false};}catch{}
    const whole=text.match(/\{[\s\S]*\}/);
    if(whole){try{const v=JSON.parse(whole[0]);if(Array.isArray(v?.events))return {events:v.events,partial:false};}catch{}}
    const key=text.search(/"events"\s*:\s*\[/),start=key>=0?text.indexOf('[',key):text.indexOf('[');
    if(start<0)return null;
    const events=[];let depth=0,inStr=false,esc=false,objStart=-1;
    for(let i=start+1;i<text.length;i++){
      const c=text[i];
      if(inStr){if(esc)esc=false;else if(c==='\\')esc=true;else if(c==='"')inStr=false;continue;}
      if(c==='"'){inStr=true;continue;}
      if(c==='{'){if(depth===0)objStart=i;depth++;}
      else if(c==='}'){depth--;if(depth===0&&objStart>=0){try{events.push(JSON.parse(text.slice(objStart,i+1)));}catch{}objStart=-1;}}
      else if(c===']'&&depth===0)break;
    }
    return events.length?{events,partial:true}:null;
  }
  // v0.3.5: one validation path shared by AI analysis and JSON import.
  function gfqBuildProposal(x,evidence,ctx=GFQ_GENERIC){
    const safe=gfqSafeProposal({...x,evidence},ctx);
    return {id:uid(),category:safe.category,name:String(safe.name).slice(0,100),status:safe.status,evidence:String(evidence).slice(0,600),
      questTitle:String(x.questTitle||'').slice(0,90),questObjective:String(x.questObjective||'').slice(0,350),questRewards:Array.isArray(x.questRewards)?x.questRewards.slice(0,8):[],
      source:String(x.source||'').slice(0,120),amount:typeof x.amount==='number'&&Number.isFinite(x.amount)?x.amount:null,
      unit:String(x.unit||'').slice(0,30),owner:String(x.owner||'unknown'),eventKind:String(x.eventKind||''),
      financialStatus:safe.financialStatus,auditNote:safe.auditNote||'',
      transactionId:String(x.transactionId||'').slice(0,100),timing:String(x.timing||'').slice(0,80)};
  }
  // Returns {proposal} or {reason} so callers can report why candidates were dropped.
  function gfqScreenEvent(x,texts,ctx=GFQ_GENERIC){
    if(!x||typeof x!=='object')return {reason:'format'};
    if(typeof x.name!=='string'||!x.name.trim()||typeof x.evidence!=='string'||x.evidence.trim().length<8)return {reason:'format'};
    if(!gfqEventEligible(x,ctx)||!['completed','active','confirmed','uncertain'].includes(x.status))return {reason:'filtered'};
    const evidence=gfqLocateEvidence(x.evidence.trim(),texts);
    if(!evidence)return {reason:'evidence'};
    return {proposal:gfqBuildProposal(x,evidence,ctx)};
  }
  function gfqDuplicate(a,b,ctx=GFQ_GENERIC){
    if(a.category!==b.category)return false;
    if(a.evidence===b.evidence)return true;
    if(!ctx.legacy)return false;
    if(a.category==='credential'&&/물리계.*면허/.test(a.name)&&/물리계.*면허/.test(b.name))return true;
    if(a.category==='quest'&&/성수동 냉장 물류창고|게이트 앵커/.test(a.name)&&/성수동 냉장 물류창고|게이트 앵커/.test(b.name))return true;
    return false;
  }
  // v0.3.5: Korean display labels. Stored values stay in English codes for compatibility.
  const GFQ_LABELS={
    category:{quest:'퀘스트',asset:'자산·거래',item:'소지품',credential:'자격·면허',contract:'계약'},
    status:{completed:'완료',active:'진행 중',confirmed:'확인됨',uncertain:'불확실'},
    money:{received:'입금 확인',paid:'지출',pending:'지급 예정',receivable:'미수금(확정·미입금)',waived:'면제',ownership:'지분·소유',not_applicable:'금전 무관',uncertain:'미확인'},
    certainty:{received:'수령 확인',confirmed:'확정·미수령',pending:'지급 예정',suggested:'제안·미지급',uncertain:'미확인'}
  };
  const gfqLabel=(kind,v)=>v?(GFQ_LABELS[kind]?.[v]||String(v)):'구분 전';
  const gfqAmount=(amount,unit)=>typeof amount==='number'&&Number.isFinite(amount)?amount.toLocaleString('ko-KR')+(unit?' '+unit:''):'미확인';
  // v0.3.5: relative timing ("내일 이 시간") has no meaning without the scene it was said in.
  const GFQ_TIMING=/(?:내일|모레|금일|오늘|익일|다음\s?날)(?:\s*(?:이 시간|오전|오후|저녁|아침))?(?:\s*\d{1,2}\s*시(?:\s*정각|\s*\d{1,2}\s*분|\s*반)?)?(?:\s*까지)?|(?:임무|작업|용역|제작)\s*완료\s*(?:즉시|시|후)|\d+\s*일\s*(?:후|뒤|이내)/u;
  function gfqTiming(x){
    const found=[...String(x.evidence||'').matchAll(new RegExp(GFQ_TIMING.source,'gu'))].map(m=>m[0].trim()).filter((v,i,a)=>v&&a.indexOf(v)===i);
    const t=String(x.timing||'').trim()||found.join(' · ');
    return t?{text:t.slice(0,80),anchor:String(x.source||'').slice(0,120)}:null;
  }
  const gfqTimingText=t=>t?t.text+(t.anchor?' ('+t.anchor+' 시점 기준)':''):'';
  function aiReviewHtml(w){
    const rows=Array.isArray(w.aiProposals)?w.aiProposals:[];
    return '<h3>AI 분석 결과 검토 ('+rows.length+'개)</h3>'+
      '<p class="gfq-muted">설정에서 선택한 AI 연결로 분석합니다. 원문을 확인한 후보만 승인할 수 있으며, 분석만으로 자산은 변경되지 않습니다.</p>'+gfqDiagnosticsHtml(w)+
      '<button data-action="invoke-quest-bridge">AI 분석 실행</button> <button data-action="prepare-ai-prompt">분석 지침 복사</button> <button data-action="import-ai-result">AI 분석 JSON 가져오기</button>'+
      (rows.length?'<div class="gfq-row"><button data-action="select-all-ai">전체 선택</button><button data-action="unselect-all-ai">선택 해제</button><button data-action="approve-selected-ai">선택 승인</button><button data-action="delete-selected-ai">선택 삭제</button><button data-action="delete-all-ai" class="gfq-danger">전체 삭제</button></div>':'')+
      (rows.map(x=>'<div class="gfq-card"><div class="gfq-row"><input type="checkbox" class="gfq-ai-check" aria-label="분석 후보 선택" value="'+esc(x.id)+'" style="width:17px;height:17px;flex:none"><b class="gfq-fill">'+esc(gfqLabel('category',x.category))+' · '+esc(x.name)+'</b><small>'+esc(gfqLabel('status',x.status))+' · '+esc(gfqLabel('money',x.financialStatus))+'</small></div><p>'+esc(x.evidence)+'</p><div class="gfq-muted">수량·금액: '+esc(gfqAmount(x.amount,x.unit))+' · 출처: '+esc(x.source||'미확인')+'</div>'+(gfqTiming(x)?'<div class="gfq-muted">지급·수령 시점: '+esc(gfqTimingText(gfqTiming(x)))+'</div>':'')+(x.category==='quest'?'<div class="gfq-muted">목표: '+esc(gfqQuestPresentation(gfqSafeProposal(x,gfqRuleCtx(w))).objective)+'</div><div class="gfq-muted">보상 후보: '+esc(gfqQuestPresentation(gfqSafeProposal(x,gfqRuleCtx(w))).rewardList.map(r=>r.name+' ('+gfqLabel('certainty',r.certainty)+')').join(' · '))+'</div>':'')+(x.auditNote?'<p class="gfq-muted">검토 주의: '+esc(x.auditNote)+'</p>':'')+'<div class="gfq-row"><button data-action="approve-ai-proposal" data-id="'+esc(x.id)+'">확인 후 반영</button><button data-action="remove-ai-proposal" data-id="'+esc(x.id)+'">제외</button></div></div>').join('')||'<p class="gfq-muted">검토 대기 중인 AI 분석 결과가 없습니다.</p>');
  }
  function gfqDiagnosticsHtml(w){
    const a=w.gfLastAnalysis,ev=w.gfEvicted&&Object.entries(w.gfEvicted);
    const parts=[];
    if(a)parts.push('<div class="gfq-muted">최근 분석 ('+esc(a.at)+'): '+esc(gfqAnalysisSummary(a)).replace(/\n/g,'<br>')+'</div>');
    if(ev&&ev.length)parts.push('<div class="gfq-muted">보관 한도(장면 180개)를 넘어 삭제된 오래된 장면: '+ev.map(([c,n])=>'챕터 '+esc(c)+' '+n+'개').join(', ')+'. 이 장면에 있던 거래는 분석 대상에 포함되지 않습니다.</div>');
    return parts.length?'<div class="gfq-card">'+parts.join('')+'</div>':'';
  }
  function gfqQuestGroup(x,ctx=GFQ_GENERIC){
    if(!ctx.legacy)return '';
    const t=[x.name,x.questTitle,x.questObjective,x.evidence].join(' '),source=String(x.source||'');
    if(/챕터 3/.test(source)&&/제1공방|파쇄동|용해로|철각견|공명 저지선|냉각 밸브|설비 방어|진입로/.test(t))return 'foundry';
    if(/챕터 1/.test(source)&&/냉장 물류창고|게이트 앵커/.test(t))return 'coldstore';
    if(/챕터 2/.test(source)&&/격리동|마수 탈주/.test(t))return 'containment';
    return '';
  }
  function gfqIntegrateQuests(events,ctx=GFQ_GENERIC){
    // The grouping below is the v0.3.4 rule pack; generic consolidation arrives with stage 3.
    if(!ctx.legacy)return events.slice();
    const groups=new Map(),result=[];
    for(const e of events){
      const key=e.category==='quest'?gfqQuestGroup(e,ctx):'';
      if(!key){result.push(e);continue;}
      if(!groups.has(key))groups.set(key,[]);
      groups.get(key).push(e);
    }
    for(const [key,group] of groups){
      const first={...group[0]};
      if(key==='foundry'){
        first.name='제1공방 긴급 방어 작전';
        first.questTitle=first.name;
        first.questObjective='제1공방의 오염 사태를 조사하고 지하 용해로 진입로를 확보한 뒤 비상 냉각 밸브를 열고 게이트 파편을 파괴해 폭발을 막는다.';
        first.questSteps=['오염 원인 조사','지하 용해로 진입로 확보','비상 냉각 밸브 개방','게이트 파편 파괴'];
        first.status=group.some(x=>x.status==='active')?'active':first.status;
      }else{
        first.questTitle=key==='coldstore'?'성수동 냉장 물류창고 게이트 안정화':'협회 격리동 긴급 수습';
        first.questSteps=group.map(x=>x.questObjective||x.name).filter(Boolean).slice(0,6);
      }
      first.sourceEvidence=group.map(x=>x.evidence).filter(Boolean);
      result.push(first);
    }
    const foundry=result.find(x=>x.category==='quest'&&gfqQuestGroup(x,ctx)==='foundry');
    const contract=result.find(x=>['asset','contract'].includes(x.category)&&x.amount===1400000&&x.unit==='원'&&/챕터 3/.test(x.source||'')&&/계약|수당|보수|정산/.test(x.name||''));
    if(foundry&&contract){
      foundry.questRewards=[{name:'긴급 설비 방어 보수 (기본 950,000원 + 위험 450,000원)',kind:'money',certainty:'pending',amount:1400000,unit:'원',evidence:contract.evidence}];
      foundry.rewardTransactionId=contract.transactionId||'';
    }
    // The contractual total is the ledger candidate; components are its breakdown, not separate deposits.
    const total=result.find(x=>['asset','contract'].includes(x.category)&&x.amount===1400000&&String(x.unit)==='원'&&/챕터 3/.test(x.source||'')&&/긴급.*(방어|설비)|표준 긴급 방어/.test(x.name||''));
    if(total){
      total.name='긴급 설비 방어 보수 총액';
      total.financialStatus='pending';
      total.auditNote='기본 수당 950,000원 + 위험 수당 450,000원의 합계입니다. 구성 금액은 별도의 수입이 아닙니다.';
      for(let i=result.length-1;i>=0;i--){
        const x=result[i];if(x===total||!['asset','contract'].includes(x.category)||!/챕터 3/.test(x.source||''))continue;
        if((x.amount===950000&&/기본 수당/.test(x.name||''))||(x.amount===450000&&/위험 수당/.test(x.name||'')))result.splice(i,1);
      }
    }
    // An offer and its formal contract are not two different contracts.
    const offer=result.find(x=>x.category==='contract'&&/긴급 설비 방어 용역 위촉/.test(x.name||''));
    if(offer&&total){const ix=result.indexOf(offer);if(ix>=0)result.splice(ix,1);}
    return result;
  }
  function gfqQuestPresentation(x){
    const raw=String(x.name||'').trim(),quote=String(x.evidence||''),source=String(x.source||'');
    const title=String(x.questTitle||raw).trim().slice(0,90);
    const objective=String(x.questObjective||x.objective||'').trim().slice(0,350)||
      (quote?('목표: '+quote.slice(0,230)):'목표 세부 정보 확인 필요');
    const rewardCandidates=Array.isArray(x.questRewards)?x.questRewards:[];
    const haveMoney=rewardCandidates.some(r=>r?.kind==='money'&&r.amount!==null&&r.amount!==undefined);
    const activeRewards=haveMoney?rewardCandidates.filter(r=>r.kind!=='reputation'):rewardCandidates;
    const rewardList=activeRewards.slice(0,8).filter(r=>r&&typeof r.name==='string'&&r.name.trim()).map(r=>({
      name:String(r.name).slice(0,100),
      kind:['money','item','credential','reputation','benefit','other'].includes(r.kind)?r.kind:'other',
      certainty:['received','confirmed','pending','suggested','uncertain'].includes(r.certainty)?r.certainty:'uncertain',
      amount:typeof r.amount==='number'&&Number.isFinite(r.amount)?r.amount:null,
      unit:String(r.unit||'').slice(0,24),
      evidence:String(r.evidence||'').slice(0,500)
    }));
    if(!rewardList.length)rewardList.push({name:'명성 상승',kind:'reputation',certainty:'suggested',amount:1,unit:'점',evidence:'원문에서 확정된 보상을 찾지 못해 제안한 비금전 보상입니다.'});
    return {title,objective,rewardList,source,steps:Array.isArray(x.questSteps)?x.questSteps:[]};
  }
  function gfqAwardQuestReputation(w,q){
    if(q.reputationAwarded)return false;
    const rewards=Array.isArray(q.rewardDetails)?q.rewardDetails:[];
    if(!rewards.some(r=>r.kind==='reputation'))return false;
    const field=w.fields.find(x=>x.name==='명성');
    if(field && (!/^\d+$/.test(String(field.value).trim())||String(field.unit||'')&&!['점',''].includes(String(field.unit)))){
      record(w,'명성 보상 반영 보류: 기존 명성 필드 형식을 확인해 주세요. 퀘스트 '+q.title);return false;
    }
    if(field)field.value=String(Number(field.value)+1);
    else w.fields.push({id:uid(),name:'명성',value:'1',unit:'점'});
    q.reputationAwarded=true;
    const reward=rewards.find(r=>r.kind==='reputation');
    if(reward){reward.amount=1;reward.unit='점';reward.certainty='received';}
    record(w,'퀘스트 명성 보상 지급: '+q.title+' / 명성 +1점');
    return true;
  }
  function gfqQuestRewardLabel(x){
    const labels={received:'수령 확인',confirmed:'확정',pending:'지급 예정',suggested:'제안·미지급',uncertain:'미확인'};
    const entries=Array.isArray(x.rewardDetails)&&x.rewardDetails.length?x.rewardDetails:null;
    if(entries)return entries.map(r=>r.name+(r.amount!==null&&r.amount!==undefined?' '+Number(r.amount).toLocaleString('ko-KR')+String(r.unit||''):'')+' ['+(labels[r.certainty]||'미확인')+']').join(' · ');
    return x.reward||'보상 미기록';
  }
  function aiAnalysisPrompt(w, records){
    const ctx=gfqRuleCtx(w),hero=ctx.hero?'주인공 '+ctx.hero:'주인공(플레이어 캐릭터)';
    const input=(records||gfqStoryRecords(w)).map(x=>'['+x.source+']\n'+x.text).join('\n\n');
    return [
      '한국어 RPG 세계의 사건과 금전 출납부를 분석합니다. 입력에 없는 사실과 금액은 절대 추정하지 않습니다.',
      '반환 JSON: {"events":[{"category":"quest|asset|item|credential|contract","name":"한국어 제목","status":"completed|active|confirmed|uncertain","financialStatus":"received|paid|pending|receivable|waived|ownership|not_applicable|uncertain","evidence":"원문에서 그대로 복사한 짧은 연속 문자열","source":"챕터/장면","amount":숫자 또는 null,"unit":"원|%|개 등","transactionId":"동일 계약 또는 정산 사건을 나타내는 간결한 문자열","timing":"지급·수령·완료 시점을 나타내는 원문 표현 그대로(예: 내일 이 시간, 임무 완료 시, 금일 오후 6시) 또는 빈 문자열","owner":"player|npc|organization|unknown","eventKind":"task|payment|expense|discount|property|item_transfer|credential|contract","questTitle":"퀘스트형 간결한 제목","questObjective":"목표와 완료 조건을 자연스러운 문장으로 요약","questRewards":[{"name":"보상 명칭","kind":"money|item|credential|reputation|benefit|other","certainty":"received|confirmed|pending|suggested|uncertain","amount":null,"unit":"","evidence":"원문 인용 또는 빈 문자열"}]}]}',
      '반드시 화폐 단위가 있는 모든 입금/이체/정산/수당/보수/급여/보상/지급 완료 서술을 빠짐없이 검사합니다. 완료된 입금은 financialStatus=received, 돈을 지출했으면 paid, 약속한 미래 지급이면 pending, 받을 권리가 확정됐으나 미입금이면 receivable, 면제는 waived, 지분은 ownership으로 분류합니다.',
      '거래의 지급 의사나 보장만으로 실제 입금(received)으로 처리하지 않습니다. 금액을 확정했지만 입금 문장이 없으면 received를 쓰지 않습니다. 총액과 그 구성 수당은 같은 transactionId를 사용하고 각각 중복 수입으로 합산하지 않습니다.',
      '면허·자격증은 credential, 제작 계약은 contract, 제작 중인 물품은 완료된 아이템으로 처리하지 않습니다. 퀘스트 수락/완료도 구분합니다. 모든 항목은 입력 원문에서 확인할 수 있는 evidence가 있어야 합니다.',
      hero+'에게 귀속되는 돈·물품·면허·계약·의뢰만 후보로 출력하세요. NPC나 길드의 자산/계약/서명, 단순 시설 사건, 반입량·대피 인원·압력·오차율 같은 수치 기록은 절대 후보가 아닙니다.',
      '단순 위험 발생은 퀘스트가 아닙니다. 실질적인 플레이어의 의뢰·수락·행동·달성 목적만 퀘스트입니다. 용역의 하위 수행 단계는 가능한 하나의 퀘스트로 합치세요.',
      'category=quest일 때 questTitle은 웹소설풍 자연스러운 의뢰 제목, questObjective는 장소·행동·완료 조건을 포함한 간결한 한국어 문장으로 작성합니다. 퀘스트를 사건 목록처럼 길게 나열하지 마세요.',
      'questRewards에는 스토리로 확인되는 수당·지급 예정 보수·면허·소재·제작 혜택만 넣되 원문의 동일 보상을 중복 기재하지 마세요. 지급된 금액과 지급 예정 금액을 반드시 구분합니다. 완료된 기존 퀘스트에 지급 예정 보수를 지급 완료로 날조하면 안 됩니다.',
      '명시된 보상이 없다면 questRewards는 빈 배열로 두세요. 확장이 명성 상승을 제안하되 실제 보상 획득이나 시스템 재화 증가로 취급하지 않습니다.',
      '정산 완료라는 요약만으로 실제 입금(received)을 확정할 수 없습니다. 계좌에 입금된 사실이 명시되어야 received입니다. 총액과 세부 수당을 중복 수입으로 더하지 마세요.',
      'owner 필드는 player|npc|organization|unknown 중 하나, eventKind 필드는 task|payment|expense|discount|property|item_transfer|credential|contract 중 하나를 필수 출력합니다. owner가 player가 아닌 항목은 결과에서 제외합니다.',
      ...(ctx.legacy?['예: 긴급 설비 수당 기본급 950000원과 위험수당 450000원, 총액 1400000원은 한 계약의 구성 내역입니다. 총액을 별도 두 번째 수입으로 계산하지 마세요.',
        '정산 완료라는 표현만으로 계좌 입금 완료를 확정하지 마세요. 수령이 확인된 입금만 received입니다. NPC의 앰플 장전은 플레이어 소지품 변화가 아닙니다.']
       :['예: 기본급과 위험 수당이 나오고 그 합계 총액이 함께 언급되면 한 계약의 구성 내역입니다. 총액을 별도 두 번째 수입으로 계산하지 마세요.',
        '정산 완료라는 표현만으로 계좌 입금 완료를 확정하지 마세요. 수령이 확인된 입금만 received입니다. 다른 인물이 물건을 사용·장전·보관한 것은 '+hero+'의 소지품 변화가 아닙니다.']),
      '특히 돈 관련 사건은 적은 금액도 누락하지 말고 각각 독립 사건으로 나열하세요. JSON 외 다른 출력은 금지합니다.',
      '월드: '+(w.gfDisplayName||data.world),
      '[분석 대상]\n'+input
    ].join('\n\n');
  }
  async function prepareAiPrompt(){
    const w=current();if(!w)return;
    const txt=aiAnalysisPrompt(w);
    try{await navigator.clipboard.writeText(txt);alert('분석 지침을 복사했습니다. 다른 AI에서 직접 분석하신 경우 [AI 분석 JSON 가져오기]로 결과를 불러오실 수 있습니다. 설정에서 연결을 선택하셨다면 [AI 분석 실행]으로 바로 분석하실 수도 있습니다.');}
    catch{prompt('아래 지침을 복사해 주세요.',txt);}
  }

  function questModelText(v,depth=0){
    if(depth>6||v==null)return '';
    if(typeof v==='string')return v;
    if(Array.isArray(v))return v.map(x=>questModelText(x,depth+1)).filter(Boolean).join('\n');
    if(typeof v!=='object'||['reasoning','thinking','redacted_thinking'].includes(v.type))return '';
    for(const key of ['content','text','output_text','output','response','message','choices','data','result']){
      const text=questModelText(v[key],depth+1);if(text)return text;
    }
    return '';
  }
  async function invokeQuestBridge(){
    const w=current();if(!w)return;
    const currentWorldKey=data.world,connectionId=String(data.aiConnectionId||'').trim();
    if(!connectionId)return alert('설정에서 분석용 AI 연결을 먼저 선택해 주세요.');
    const allRecords=gfqStoryRecords(w);
    if(!allRecords.length)return alert('분석할 스토리 기록이 없습니다.');
    // Bounded chronological batches prevent old payments from being excluded by a recent-only slice.
    // v0.3.5: prefer to start a new batch at a chapter boundary once the current batch is mostly full.
    const batches=[];let batch=[],chars=0,lastCh=null;
    for(const record of allRecords){
      const item={source:record.source,text:record.text.slice(0,3500)};
      const full=batch.length>=12||chars+item.text.length>10500;
      const boundary=lastCh!==null&&record.ch!==lastCh&&(batch.length>=8||chars>7000);
      if(batch.length&&(full||boundary)){batches.push(batch);batch=[];chars=0;}
      batch.push(item);chars+=item.text.length;lastCh=record.ch;
    }
    if(batch.length)batches.push(batch);
    if(!confirm('저장된 스토리 '+allRecords.length+'개를 '+batches.length+'회로 나눠 분석하시겠습니까? 기존보다 AI 호출 비용이 증가할 수 있습니다.'))return;
    const records=allRecords;
    const requestRun='gfq-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9);
    const host=typeof marinara==='object'&&marinara?marinara:globalThis.marinara||{};
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),Math.min(900000,120000*Math.max(1,batches.length)));
    const stats={format:0,filtered:0,evidence:0,duplicate:0};
    const failures=[];let partialBatches=0,processed=0;
    try{
      const known=gfqKnownKeys(w);
      const eventsToAdd=[];
      for(let batchIndex=0;batchIndex<batches.length;batchIndex++){
        if(controller.signal.aborted){failures.push('묶음 '+(batchIndex+1)+'~'+batches.length+': 제한 시간 초과로 실행하지 않았습니다');break;}
        const segment=batches[batchIndex],promptText=aiAnalysisPrompt(w,segment),label='묶음 '+(batchIndex+1)+'/'+batches.length;
        // v0.3.5: one failed batch no longer discards the results of the others.
        try{
          const opts={method:'POST',credentials:'same-origin',cache:'no-store',signal:controller.signal,
            headers:{'content-type':'application/json','x-marinara-csrf':'1'},
            body:JSON.stringify({connectionId,runId:requestRun+'-'+batchIndex,streaming:false,
              messages:[{role:'system',content:'Extract exhaustive story events and all actual or promised financial transactions. Return only a JSON object with events array.'},{role:'user',content:promptText}],
              parameters:{maxTokens:4000,temperature:0.1}})
          };
          const response=typeof host.apiFetch==='function'?await host.apiFetch('generate/raw',opts):
            typeof host.fetch==='function'?await host.fetch('/api/generate/raw',opts):await fetch('/api/generate/raw',opts);
          const body=await response.json().catch(()=>null);
          if(!response.ok)throw Error(String(body?.error||body?.message||('HTTP '+response.status)));
          const parsed=gfqParseEvents(questModelText(body));
          if(!parsed)throw Error('AI 응답에서 JSON 사건 목록을 찾지 못했습니다');
          if(parsed.partial)partialBatches++;
          gfqCollectEvents(parsed.events.slice(0,75),segment.map(t=>t.text),w,known,eventsToAdd,stats);
          processed++;
        }catch(e){
          if(controller.signal.aborted)failures.push(label+': 제한 시간 초과');
          else failures.push(label+': '+String(e?.message||e));
        }
      }
      if(data.world!==currentWorldKey||current()!==w)throw Error('분석 중 월드가 변경되어 결과를 적용하지 않았습니다.');
      if(!processed)throw Error('모든 묶음의 분석에 실패했습니다.\n'+failures.slice(0,6).join('\n'));
      w.aiProposals||=[];const merged=gfqIntegrateQuests(eventsToAdd,gfqRuleCtx(w));w.aiProposals.push(...merged);
      w.gfLastAnalysis={at:now(),batches:batches.length,processed,partial:partialBatches,failures:failures.slice(0,12),added:merged.length,...stats};
      save();render();
      alert('AI 분석이 완료되었습니다. '+merged.length+'개의 새 후보를 검토 목록에 추가했습니다.\n\n'+gfqAnalysisSummary(w.gfLastAnalysis));
    }catch(e){
      alert('AI 분석에 실패했습니다: '+String(e?.message||e));
    }finally{clearTimeout(timer);}
  }
  function gfqKnownKeys(w){
    return new Set([...(w.aiProposals||[]).map(x=>x.category+'|'+x.evidence),...(w.aiAcceptedKeys||[])]);
  }
  function gfqCollectEvents(events,texts,w,known,out,stats){
    const ctx=gfqRuleCtx(w);
    for(const x of events){
      const r=gfqScreenEvent(x,texts,ctx);
      if(!r.proposal){stats[r.reason]=(stats[r.reason]||0)+1;continue;}
      const p=r.proposal,identity=p.category+'|'+p.evidence;
      if(known.has(identity)||out.some(y=>gfqDuplicate(y,p,ctx))||(w.aiProposals||[]).some(y=>gfqDuplicate(y,p,ctx))){stats.duplicate++;continue;}
      out.push(p);known.add(identity);
    }
  }
  function gfqAnalysisSummary(a){
    if(!a)return '';
    const lines=['처리한 묶음: '+a.processed+'/'+a.batches+(a.partial?' (응답이 잘려 부분 복구한 묶음 '+a.partial+'개)':'')];
    const dropped=[];
    if(a.evidence)dropped.push('원문 근거 불일치 '+a.evidence+'개');
    if(a.filtered)dropped.push('주인공 무관·유형 제외 '+a.filtered+'개');
    if(a.duplicate)dropped.push('중복 '+a.duplicate+'개');
    if(a.format)dropped.push('형식 오류 '+a.format+'개');
    if(dropped.length)lines.push('제외된 후보: '+dropped.join(', '));
    if(a.failures?.length)lines.push('실패한 묶음:\n'+a.failures.join('\n'));
    return lines.join('\n');
  }
  function importAiResult(){
    const w=current();if(!w)return;
    const raw=prompt('AI가 반환한 JSON을 붙여넣어 주세요. 배열 또는 {"events":[...]} 형식을 지원합니다. 원문에서 근거가 확인되는 항목만 검토 목록에 추가됩니다.');
    if(!raw)return;
    try{
      const parsed=gfqParseEvents(raw);
      if(!parsed)throw Error('JSON 사건 목록을 찾지 못했습니다.');
      if(parsed.events.length>150)throw Error('한 번에 150개 이하의 항목만 가져올 수 있습니다.');
      // Numeric strings from external tools are accepted as amounts.
      const events=parsed.events.map(x=>x&&typeof x==='object'&&typeof x.amount==='string'&&x.amount.trim()&&Number.isFinite(Number(x.amount.replace(/,/g,'')))?{...x,amount:Number(x.amount.replace(/,/g,''))}:x);
      const stats={format:0,filtered:0,evidence:0,duplicate:0},added=[];
      gfqCollectEvents(events,gfqStoryRecords(w).map(r=>r.text),w,gfqKnownKeys(w),added,stats);
      w.aiProposals||=[];const merged=gfqIntegrateQuests(added,gfqRuleCtx(w));w.aiProposals.push(...merged);
      save();render();
      alert(merged.length+'개의 검증된 분석 후보를 추가했습니다.'+(parsed.partial?' 입력이 중간에 잘려 있어 완전한 항목만 복구했습니다.':'')+'\n\n'+gfqAnalysisSummary({processed:1,batches:1,partial:0,failures:[],...stats}));
    }catch(e){alert('JSON을 가져오지 못했습니다: '+String(e.message||e));}
  }
  const GFQ_MONEY_STATES=['pending','receivable','received','paid','waived','ownership'];
  const gfqMoney=x=>(['asset','contract'].includes(x.category)&&GFQ_MONEY_STATES.includes(x.financialStatus));
  function gfqLedgerRecord(w,x,bulk=false){
    w.gfLedger||=[];
    const key=String(x.transactionId||'').trim();
    const matches=key?w.gfLedger.filter(t=>t.sourceKey===key&&t.unit===String(x.unit||'')&&
      (t.amount===x.amount||t.amount===null||x.amount===null)&&t.name===String(x.name||'')):[];
    // Never auto-merge collisions or independently authored events.
    let prior=matches.length===1?matches[0]:null;
    if(!bulk&&w.gfLedger.length){
      const options=w.gfLedger.map((t,i)=>(i+1)+': '+t.name+' ['+t.state+'] '+(t.amount??'?')+' '+t.unit).join('\n').slice(0,3500);
      const answer=prompt('새 거래는 0, 기존 거래의 상태 변경은 해당 번호를 입력해 주세요.\n같은 보수의 후속 입금인 경우 기존 번호를 선택하세요.\n'+options,prior?String(w.gfLedger.indexOf(prior)+1):'0');
      if(answer===null)return false;
      const n=Number(answer);
      if(!Number.isSafeInteger(n)||n<0||n>w.gfLedger.length){alert('거래 번호를 확인해 주세요.');return false;}
      prior=n?w.gfLedger[n-1]:null;
    }else if(bulk&&matches.length!==1){prior=null;}
    const at=now(),state=x.financialStatus,evidence=String(x.evidence||''),amount=Number.isFinite(x.amount)?x.amount:null,unit=String(x.unit||'');
    if(prior){
      // A total can replace an unknown amount, but component amounts must not silently overwrite it.
      const changedState=prior.state!==state;
      if(prior.history?.some(h=>h.evidence===evidence&&h.state===state))return true;
      prior.history||=[];
      prior.history.push({at,state,amount,evidence,source:x.source||''});
      prior.state=state;prior.updatedAt=at;
      if(prior.amount===null&&amount!==null)prior.amount=amount;
      if(!prior.sourceKey&&key)prior.sourceKey=key;
      if(!prior.timing)prior.timing=gfqTiming(x);
      record(w,'거래 상태 갱신: '+prior.name+' '+(changedState?'→ '+gfqLabel('money',state):'(추가 근거)')+' · '+evidence);
    }else{
      const tx={id:uid(),sourceKey:key,name:String(x.name||''),state,amount,unit,
        componentOf:'',timing:gfqTiming(x),createdAt:at,updatedAt:at,history:[{at,state,amount,evidence,source:x.source||''}]};
      w.gfLedger.push(tx);record(w,'거래 생성: '+tx.name+' ['+gfqLabel('money',state)+'] · '+evidence);
    }
    return true;
  }
  function gfqLedgerHtml(w){
    const tx=w.gfLedger||[];
    return '<h3>거래 원장 ('+tx.length+'건)</h3><p class="gfq-muted">같은 거래는 상태만 갱신합니다. 세부 수당과 총액은 자동 합산하지 않으며 실제 계좌 잔액도 변경하지 않습니다.</p>'+
      (tx.map(t=>'<div class="gfq-card"><div class="gfq-row"><b class="gfq-fill">'+esc(t.name)+'</b><span>'+esc(gfqLabel('money',t.state))+'</span></div>'+
        '<div>'+esc(gfqAmount(t.amount,t.unit))+(t.timing?' · 지급 시점: '+esc(gfqTimingText(t.timing)):'')+'</div><small>거래 ID: '+esc(t.id)+'</small>'+
        '<details><summary>상태 변경 이력 ('+(t.history||[]).length+')</summary>'+(t.history||[]).map(h=>'<p class="gfq-muted">'+esc(h.at)+' · '+esc(gfqLabel('money',h.state))+' · '+esc(h.evidence)+'</p>').join('')+'</details>'+
        '<div class="gfq-row"><button data-action="ledger-update" data-id="'+esc(t.id)+'">상태 수동 갱신</button></div></div>').join('')||'<p class="gfq-muted">기록된 거래가 없습니다.</p>');
  }
  function approveAiProposal(id,bulk=false){
    const w=current(),x=w?.aiProposals?.find(v=>v.id===id);if(!x)return false;
    const ctx=gfqRuleCtx(w);
    if(!gfqEventEligible(x,ctx))return bulk?false:alert('이 사건은 주인공 자산·의뢰와 무관해 반영할 수 없습니다.');
    if(['asset','contract'].includes(x.category)&&x.financialStatus==='received'&&!/(입금(?:됐|되었|받았|완료| 확인)|계좌.{0,24}(입금|들어왔)|송금(?:받|완료)|잔액.{0,20}(증가|늘어)|실제.{0,12}(수령|지급받))/u.test(String(x.evidence||''))){if(!bulk)alert('정산 완료만으로 실제 입금은 확정할 수 없습니다. 기존 후보를 삭제하고 재분석하거나 수동 확인해 주세요.');return false;}
    if((w.quests||[]).some(q=>x.category==='quest'&&gfqDuplicate({category:'quest',name:q.title,evidence:q.detail||''},x,ctx)))return bulk?false:alert('이미 등록된 유사 퀘스트입니다.');
    if(x.status==='uncertain'||x.financialStatus==='uncertain'&&x.category==='asset'){if(!bulk)alert('불확실한 사건은 자동으로 반영할 수 없습니다. 원문을 확인한 후 수동으로 등록해 주세요.');return false;}
    if(!bulk&&!confirm('원문과 상태를 확인하셨습니까? '+x.category+' · '+x.name+'을(를) 기록에 반영하시겠습니까?'))return false;
    if(gfqMoney(x)&&!gfqLedgerRecord(w,x,bulk))return false;
    if(x.category==='quest'){
      const quest=gfqQuestPresentation(gfqSafeProposal(x,gfqRuleCtx(w)));
      const q={id:uid(),title:quest.title,type:'의뢰',detail:quest.objective,target:1,progress:x.status==='completed'?1:0,reward:quest.rewardList.map(r=>r.name).join(' · '),rewardDetails:quest.rewardList,claimed:x.status==='completed',sourceEvidence:x.evidence,source:x.source,steps:quest.steps,rewardTransactionId:x.rewardTransactionId||''};
      w.quests.push(q);if(q.claimed)gfqAwardQuestReputation(w,q);
    }
    else if(x.category==='credential'){
      const name='보유 자격 · '+x.name;
      const field=w.fields.find(v=>v.name===name);
      if(field)field.value='취득';else w.fields.push({id:uid(),name,value:'취득',unit:''});
      record(w,'자격 취득 확인: '+x.name+' · '+x.evidence);
    }else if(x.category==='contract'){
      record(w,'계약 확인: '+x.name+' · '+x.evidence);
    }else if(x.category==='item'){
      // Never automatically add an item from a mention without a confirmed quantity.
      if(x.status!=='confirmed'||x.amount===null||x.amount<=0||x.unit==='원'||x.financialStatus==='pending'){if(!bulk)alert('아이템은 획득 확정 및 개수 확인 시에만 반영할 수 있습니다.');return false;}
      const item=w.items.find(i=>i.name===x.name);if(item)item.qty+=x.amount;else w.items.push({id:uid(),name:x.name,qty:x.amount});
    }else if(x.category==='asset'&&!gfqMoney(x)){
      record(w,'자산 검토: '+x.name+' · '+x.evidence);
    }
    record(w,'AI 검토 승인: '+x.name+' · '+x.source);
    w.aiAcceptedKeys||=[];w.aiAcceptedKeys.push(x.category+'|'+x.evidence);
    w.aiProposals=w.aiProposals.filter(v=>v.id!==id);if(!bulk){save();render();}return true;
  }
  const btn=(label,action,extra='')=>`<button data-action="${action}" ${extra}>${label}</button>`;
  function worldSelect(){return `<div class="gfq-row"><select id="gfq-world" class="gfq-fill"><option value="">월드 선택</option>${Object.keys(data.worlds).map(w=>`<option value="${esc(w)}" ${data.world===w?'selected':''}>${esc(data.worlds[w]?.gfDisplayName||w)}</option>`).join('')}</select>${btn('＋ 월드','new-world')}</div>`;}
  function render(){if(!panel)return;let w=current();const tabs=[['quests','퀘스트','▤'],['assets','자산','◈'],['items','소지품','◇'],['history','기록','≡'],['settings','설정','⚙']];const empty='<div class="gfq-empty"><div class="gfq-empty-symbol">◇</div><strong>아직 등록된 내용이 없습니다</strong><span class="gfq-muted">월드의 퀘스트와 자산을 여기에서 관리할 수 있습니다.</span></div>';panel.innerHTML=`<div class="gfq-frame"><header class="gfq-head"><div class="gfq-mark">✦</div><div><h2>퀘스트</h2><div class="gfq-en">GACHA FORGE / QUEST ARCHIVE</div></div>${btn('✕','close','aria-label="닫기"')}</header><aside class="gfq-side"><div class="gfq-side-head">NAVIGATION / 01</div><nav class="gfq-tabs">${tabs.map(([key,label,icon])=>`<button class="${currentTab===key?'primary':''}" data-tab="${key}"><span class="gfq-nav-icon">${icon}</span>${label}</button>`).join('')}</nav><div class="gfq-side-foot">MISSION CONTROL<br>GF / EXTENSION</div></aside><main class="gfq-main"><div class="gfq-context"><div><b>${tabs.find(t=>t[0]===currentTab)?.[1]||'퀘스트'}</b><div class="gfq-muted">WORLD RECORD / ${esc(current()?.gfDisplayName||data.world||'월드를 선택해 주세요')}</div></div><span class="gfq-muted">◈　ARCHIVE 01</span></div><div class="gfq-worldbar">${worldSelect()}</div><div id="gfq-content">${w?content(w):currentTab==='history'?`${btn('월드 연결 다시 시도','resync-world','class="primary"')}<p class="gfq-muted">현재 월드가 연결되지 않았습니다. 버튼을 눌러 연결 상태를 확인해 주세요.</p>${lastSyncError?'<div class="gfq-card">연결 진단: '+esc(lastSyncError)+'</div>':''}`:empty}</div></main><footer class="gfq-footer"><span>GACHA FORGE / PERSONAL QUEST SYSTEM</span><span>LOCAL DATA · v0.3.6</span></footer></div>`;}
  function content(w){switch(currentTab){case 'quests':return `<div class="gfq-row"><select id="gfq-filter">${['전체','일일','주간','의뢰','업적'].map(t=>`<option ${activeFilter===t?'selected':''}>${t}</option>`).join('')}</select>${btn('＋ 퀘스트','add-quest','class="primary"')}</div>${w.quests.filter(q=>activeFilter==='전체'||q.type===activeFilter).map(q=>`<div class="gfq-card"><div class="gfq-row"><b class="gfq-fill">${esc(q.title)}</b><small>${esc(q.type)}</small></div><div class="gfq-muted">${esc(q.detail)}</div>${Array.isArray(q.steps)&&q.steps.length?`<div class="gfq-muted">세부 목표: ${q.steps.map(esc).join(" · ")}</div>`:""}<progress value="${Math.max(0,Math.min(q.progress,q.target))}" max="${q.target}"></progress><div class="gfq-row"><span class="gfq-fill">${q.progress} / ${q.target} ${q.claimed?'· 완료':''}</span>${btn('＋1','increment',`data-id="${esc(q.id)}" ${q.claimed?'disabled':''}`)}${btn(q.claimed?'완료됨':'완료','complete',`data-id="${esc(q.id)}" ${q.claimed?'disabled':''}`)}${btn('삭제','delete-quest',`data-id="${esc(q.id)}"`)}</div><div class="gfq-muted">보상(기록용): ${esc(gfqQuestRewardLabel(q))}</div></div>`).join('')||'<div class="gfq-empty"><div class="gfq-empty-symbol">▤</div><strong>진행 중인 퀘스트가 없습니다</strong><span class="gfq-muted">새 퀘스트를 등록하면 여기에 표시됩니다.</span></div>'}`;
  case 'assets':return `${gfqLedgerHtml(w)}${btn('＋ 필드 추가','add-field','class="primary"')}<p class="gfq-muted">소지금, 은행, 평판, 직업 등 월드별 자유 필드</p>${w.fields.map(f=>`<div class="gfq-card"><div class="gfq-row"><b class="gfq-fill">${esc(f.name)}</b><span>${esc(f.value)} ${esc(f.unit)}</span>${btn('수정','edit-field',`data-id="${esc(f.id)}"`)}${btn('삭제','delete-field',`data-id="${esc(f.id)}"`)}</div></div>`).join('')||'<div class="gfq-empty"><div class="gfq-empty-symbol">◈</div><strong>등록된 자산이 없습니다</strong><span class="gfq-muted">소지금, 직업, 평판 등 원하는 항목을 추가해 주세요.</span></div>'}`;
  case 'items':return `${btn('＋ 소지품','add-item','class="primary"')}${w.items.map(i=>`<div class="gfq-card gfq-row"><b class="gfq-fill">${esc(i.name)}</b><span>× ${i.qty}</span>${btn('수정','edit-item',`data-id="${esc(i.id)}"`)}${btn('삭제','delete-item',`data-id="${esc(i.id)}"`)}</div>`).join('')||'<div class="gfq-empty"><div class="gfq-empty-symbol">◇</div><strong>소지품 목록이 비어 있습니다</strong><span class="gfq-muted">스토리에서 얻은 아이템을 기록할 수 있습니다.</span></div>'}`;
  case 'history':return `${btn('월드 표시 이름 수정','rename-display')} ${btn('월드 연결 다시 시도','resync-world','class="primary"')} ${w.gfRunId?btn('기존 스토리 목록 조회','scan-chapters','class="primary"')+'<p class="gfq-muted">연결된 게임 월드 ID: '+esc(w.gfRunId)+'</p>':'<p class="gfq-muted">아직 게임 월드와 연결되지 않았습니다.</p>'}${lastSyncError?'<div class="gfq-card">연결 진단: '+esc(lastSyncError)+'</div>':''}${chapterIndexHTML(w)}${aiReviewHtml(w)}${candidateHtml(w)}<h3>변경 기록</h3>${w.history.slice(0,100).map(h=>`<div class="gfq-card"><span class="gfq-muted">${esc(h.at)}</span><div>${esc(h.text)}</div></div>`).join('')||'<div class="gfq-empty"><div class="gfq-empty-symbol">≡</div><strong>아직 기록이 없습니다</strong><span class="gfq-muted">항목을 수정하면 변경 이력이 남습니다.</span></div>'}`;
  case 'settings':return `${aiSettingsHTML()}${gfqWorldRulesHtml(w)}<p>현재 월드: <b>${esc(data.world)}</b></p>${btn('주입문 확인·복사','context-preview','class="primary"')}${btn('백업 내보내기','export')}${btn('백업 가져오기','import')}${btn('월드 삭제','delete-world','class="gfq-danger"')}<p class="gfq-muted">데이터는 현재 브라우저의 로컬 저장소에 보관됩니다. 기기 간 자동 동기화는 지원하지 않으므로 백업 내보내기를 이용해 주세요.</p>`;}}
  const ask=(message,def='')=>prompt(message,def);
  const update=fn=>{const w=current();if(!w)return;fn(w);save();render();};
  const record=(w,text)=>{w.history.unshift({at:now(),text});w.history=w.history.slice(0,500);};
  function exportData(){const file=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');const url=URL.createObjectURL(file);a.href=url;a.download='quest-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function importData(){const inp=document.createElement('input');inp.type='file';inp.accept='.json,application/json';inp.onchange=async()=>{const f=inp.files?.[0];if(!f||f.size>2e6)return alert('2MB 이하의 JSON 파일만 지원합니다.');try{const d=JSON.parse(await f.text());if(d.v!==1||typeof d.worlds!=='object'||!d.worlds||Array.isArray(d.worlds))throw Error('백업 형식이 올바르지 않습니다.');for(const w of Object.values(d.worlds)){if(!Array.isArray(w.quests)||!Array.isArray(w.fields)||!Array.isArray(w.items)||!Array.isArray(w.history))throw Error('월드 데이터가 올바르지 않습니다.');}if(!confirm('현재 퀘스트 데이터를 백업 파일로 교체하시겠습니까?'))return;const previous=data;data=d;if(!save()){data=previous;return;}render();}catch(e){alert('가져오지 못했습니다: '+e.message);}};inp.click();}
  document.addEventListener('change',e=>{if(!panel||!panel.contains(e.target))return;if(e.target.id==='gfq-world'){data.world=e.target.value;save();render();}if(e.target.id==='gfq-filter'){activeFilter=e.target.value;render();}if(e.target.id==='gfq-ai-connection'){data.aiConnectionId=e.target.value;save();render();}if(e.target.id==='gfq-ai-mode'){data.aiMode=e.target.value;save();render();}if(e.target.id==='gfq-ai-scope'){data.aiScope=e.target.value;save();render();}if(e.target.id==='gfq-hero'){const w=current();if(w){gfqRuleCtx(w);w.protagonist=String(e.target.value||'').trim().slice(0,40);record(w,'주인공 이름 설정: '+(w.protagonist||'(비움)'));save();render();}}if(e.target.id==='gfq-legacy'){const w=current();if(w){gfqRuleCtx(w);w.gfRulePack=e.target.checked?GFQ_LEGACY_PACK:'';record(w,'기존 월드 전용 보정 규칙 '+(e.target.checked?'사용':'해제'));save();render();}}});
  document.addEventListener('click',e=>{const el=e.target.closest?.('#'+ID+'-panel [data-action],#'+ID+'-panel [data-tab]');if(!el)return;if(el.dataset.tab){currentTab=el.dataset.tab;render();return;}const act=el.dataset.action,id=el.dataset.id,w=current();
  if(act==='close')return openPanel();if(act==='resync-world')return syncWorld();if(act==='new-world'){const name=ask('새 월드 이름');if(name===null)return;const key=name.trim();if(!key||key.length>100)return alert('1~100자로 입력해 주세요.');if(data.worlds[key])return alert('이미 존재하는 월드입니다.');data.worlds[key]=blank();data.world=key;save();return render();}if(!w)return;
  if(act==='review-candidate'||act==='dismiss-candidate'){const c=storyCandidates(w).find(x=>x.id===id);if(!c)return;const key=c.type+'|'+c.quote;if(act==='review-candidate'){if(!confirm('다음 문장을 검토 기록으로 채택하시겠습니까? 실제 퀘스트 및 자산 상태는 변경되지 않습니다.\\n\\n'+c.quote))return;w.gfReviewed||=[];w.gfReviewed.push(key);record(w,'스토리 검토: ['+c.type+'] '+c.source+' · '+c.quote);}else{w.gfDismissed||=[];w.gfDismissed.push(key);}save();render();return;}
  if(act==='rename-display'){const label=ask('표시할 월드 이름을 입력해 주세요.',w.gfDisplayName||data.world);if(!label?.trim())return;w.gfDisplayName=label.trim().slice(0,100);save();render();return;}
  if(act==='add-quest'){const title=ask('퀘스트 이름');if(!title?.trim())return;const type=ask('종류: 일일 / 주간 / 의뢰 / 업적','의뢰');if(!['일일','주간','의뢰','업적'].includes(type))return alert('올바른 퀘스트 종류가 아닙니다.');const detail=ask('조건 및 설명','');if(detail===null)return;const count=Number(ask('목표 횟수 (1 이상)','1'));if(!Number.isSafeInteger(count)||count<1)return alert('목표 횟수를 확인해 주세요.');const reward=ask('보상 메모 (게임 재화로 자동 지급되지 않습니다)','');if(reward===null)return;return update(w=>{w.quests.push({id:uid(),title:title.trim(),type,detail,target:count,progress:0,reward,claimed:false});record(w,'퀘스트 등록: '+title);});}
  if(act==='increment'||act==='complete'){return update(w=>{const q=w.quests.find(x=>x.id===id);if(!q||q.claimed)return;q.progress=act==='complete'?q.target:Math.min(q.target,q.progress+1);if(act==='complete'){q.claimed=true;gfqAwardQuestReputation(w,q);record(w,'퀘스트 완료: '+q.title+' / '+q.reward);}else record(w,'진행도 변경: '+q.title+' '+q.progress+'/'+q.target);});}
  if(act==='delete-quest'){const q=w.quests.find(x=>x.id===id);if(!q||!confirm('퀘스트를 삭제하시겠습니까?'))return;return update(w=>{w.quests=w.quests.filter(x=>x.id!==id);record(w,'퀘스트 삭제: '+q.title);});}
  if(act==='add-field'||act==='edit-field'){const f=act==='edit-field'?w.fields.find(x=>x.id===id):null;const name=ask('필드 이름',f?.name||'');if(!name?.trim())return;const value=ask('필드 값',f?.value||'');if(value===null)return;const unit=ask('단위 (없으면 빈칸)',f?.unit||'');if(unit===null)return;return update(w=>{if(f){record(w,`${f.name}: ${f.value} → ${value}`);Object.assign(f,{name:name.trim(),value,unit});}else{w.fields.push({id:uid(),name:name.trim(),value,unit});record(w,'필드 추가: '+name);}});}
  if(act==='delete-field'){const f=w.fields.find(x=>x.id===id);if(!f||!confirm('필드를 삭제하시겠습니까?'))return;return update(w=>{w.fields=w.fields.filter(x=>x.id!==id);record(w,'필드 삭제: '+f.name);});}
  if(act==='add-item'||act==='edit-item'){const it=act==='edit-item'?w.items.find(x=>x.id===id):null;const name=ask('소지품 이름',it?.name||'');if(!name?.trim())return;const qty=Number(ask('수량 (0 이상)',String(it?.qty??1)));if(!Number.isSafeInteger(qty)||qty<0)return alert('수량은 0 이상의 정수여야 합니다.');return update(w=>{if(it){record(w,`소지품 수정: ${it.name} ${it.qty} → ${qty}`);Object.assign(it,{name:name.trim(),qty});}else{w.items.push({id:uid(),name:name.trim(),qty});record(w,'소지품 추가: '+name);}});}
  if(act==='delete-item'){const it=w.items.find(x=>x.id===id);if(!it||!confirm('소지품을 삭제하시겠습니까?'))return;return update(w=>{w.items=w.items.filter(x=>x.id!==id);record(w,'소지품 삭제: '+it.name);});}
  if(act==='resync-world')return syncWorld();if(act==='scan-chapters')return scanExistingChapters();if(['select-all-ai','unselect-all-ai','delete-selected-ai','delete-all-ai','approve-selected-ai'].includes(act)){
    const checks=[...panel.querySelectorAll('.gfq-ai-check')],selected=checks.filter(x=>x.checked).map(x=>x.value);
    if(act==='select-all-ai'||act==='unselect-all-ai'){checks.forEach(x=>x.checked=act==='select-all-ai');return;}
    const ids=act==='delete-all-ai'?(w.aiProposals||[]).map(x=>x.id):selected;
    if(!ids.length)return alert('먼저 항목을 선택해 주세요.');
    if(act==='approve-selected-ai'){
      if(!confirm(ids.length+'개 항목 중 검증 가능한 항목만 반영하시겠습니까? 불확실하거나 타인 소유인 항목은 제외됩니다.'))return;
      let applied=0;for(const candidateId of ids)if(approveAiProposal(candidateId,true))applied++;
      save();render();alert(applied+'개 항목을 승인했습니다. 반영할 수 없는 항목은 검토 목록에 남겨 두었습니다.');return;
    }
    if(!confirm(ids.length+'개의 AI 분석 후보를 삭제하시겠습니까? 이미 승인한 기록이나 게임 저장 데이터는 삭제하지 않습니다.'))return;
    const target=new Set(ids);w.aiProposals=(w.aiProposals||[]).filter(x=>!target.has(x.id));save();render();return;
  }if(act==='ledger-update'){
    const t=(w.gfLedger||[]).find(x=>x.id===id);if(!t)return;
    const state=ask('거래 상태 코드를 입력해 주세요.\npending: 지급 예정 / receivable: 미수금 / received: 입금 확인 / paid: 지출 / waived: 면제 / ownership: 지분·소유',t.state);
    if(state===null)return;if(!GFQ_MONEY_STATES.includes(state))return alert('올바른 상태를 입력해 주세요.');
    const evidence=ask('상태 변경의 근거를 입력해 주세요.','');
    if(!evidence?.trim())return alert('변경 근거가 필요합니다.');
    if(!confirm('거래 '+t.name+'의 상태를 '+state+'(으)로 변경하시겠습니까?'))return;
    const at=now();t.state=state;t.updatedAt=at;t.history||=[];t.history.push({at,state,amount:t.amount,evidence:evidence.trim(),source:'수동 확인'});save();render();return;
  }if(act==='invoke-quest-bridge')return invokeQuestBridge();if(act==='prepare-ai-prompt')return prepareAiPrompt();if(act==='import-ai-result')return importAiResult();if(act==='approve-ai-proposal')return approveAiProposal(id);if(act==='remove-ai-proposal'){w.aiProposals=w.aiProposals.filter(x=>x.id!==id);save();render();return;}if(act==='refresh-ai-connections')return refreshAiConnections();if(act==='context-preview')return copyQuestContext();if(act==='export')return exportData();if(act==='import')return importData();if(act==='delete-world'){if(!confirm('현재 월드의 퀘스트 데이터를 삭제하시겠습니까? 게임 원본 저장 데이터에는 영향을 주지 않습니다.'))return;delete data.worlds[data.world];data.world=Object.keys(data.worlds)[0]||'';save();render();}
  });
  mount();setTimeout(refreshAiConnections,900);setTimeout(syncWorld,1200);worldSyncTimer=null;const mo=new MutationObserver(()=>{if(!document.hidden&&findHost()!==gameHost)mount();});mo.observe(document.documentElement,{childList:true,subtree:false});
  const sync=setInterval(()=>{if(document.hidden)return;if(!gameHost || !gameHost.isConnected || !getButton())mount();},12000);
  // Re-promote dialog to the browser top layer after entering or exiting fullscreen.
  let fsRefresh=null;
  function refreshFullscreenDialog(){
    if(!panel||!panel.isConnected)return;
    if(fsRefresh)clearTimeout(fsRefresh);
    fsRefresh=setTimeout(()=>{fsRefresh=null;if(!panel||!panel.isConnected)return;try{if(panel.open)panel.close();panel.showModal();}catch(e){console.warn('[퀘스트] 전체화면 팝업 복원 실패',e);}},75);
  }
  document.addEventListener('fullscreenchange',refreshFullscreenDialog);
  document.addEventListener('webkitfullscreenchange',refreshFullscreenDialog);
  window.addEventListener('pagehide',()=>{document.removeEventListener('fullscreenchange',refreshFullscreenDialog);document.removeEventListener('webkitfullscreenchange',refreshFullscreenDialog);if(fsRefresh)clearTimeout(fsRefresh);if(worldSyncTimer)clearInterval(worldSyncTimer);mo.disconnect();if(gameObserver)gameObserver.disconnect();if(gameDebounce)clearTimeout(gameDebounce);clearInterval(sync);});
})();

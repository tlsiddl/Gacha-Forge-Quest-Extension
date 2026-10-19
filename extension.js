/* 퀘스트 v0.1.0 — standalone, local-only manual companion; no modification to Gacha Forge saves. */
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
  const save=()=>{try{localStorage.setItem(STORE,JSON.stringify(data));return true;}catch(e){alert('저장에 실패했어: '+e.message);return false;}};
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

  /* Vanguard-inspired quest UI — scoped to Quest extension only. */
  style.textContent += \`
#gfq-01-panel{--gfq-bg:#101925;--gfq-fg:#eef3fa;background:radial-gradient(circle at 85% 8%,#2c3d53 0,transparent 33%),linear-gradient(150deg,#101722,#1b273a);color:#eef3fa;width:min(1050px,calc(100vw - 32px));height:min(82dvh,720px);max-height:82dvh;margin:auto;inset:0;transform:none;right:0;left:0;top:0;bottom:0;border:1px solid #6c8cad66;border-radius:4px;box-shadow:0 28px 80px #000b;padding:24px 28px 24px 250px;scrollbar-color:#7186a5 transparent;overflow:auto}
#gfq-01-panel::before{content:"QUEST / MISSION ARCHIVE";position:fixed;letter-spacing:.35em;color:#97acbf;font:9px system-ui;top:calc(50% - min(41dvh,360px) + 28px);left:calc(50% - min(525px,50vw - 16px) + 28px);pointer-events:none}
#gfq-01-panel .gfq-head{border-bottom:1px solid #7894ac66;padding:6px 0 15px;margin-bottom:16px}
#gfq-01-panel .gfq-head h2{font-size:22px;font-weight:800;letter-spacing:.09em}
#gfq-01-panel .gfq-tabs{position:fixed;left:calc(50% - min(525px,50vw - 16px) + 22px);top:calc(50% - min(41dvh,360px) + 105px);display:flex;flex-direction:column;align-items:stretch;gap:9px;width:192px;z-index:1;margin:0}
#gfq-01-panel .gfq-tabs button{background:none;border:0;border-left:2px solid #5f748e;border-radius:0;text-align:left;padding:14px 11px;color:#c1d0de;font-weight:700;letter-spacing:.04em;transition:background .15s}
#gfq-01-panel .gfq-tabs button.primary{background:linear-gradient(90deg,#456ba5,#5288da);border-left:3px solid #e5f2ff;color:#fff;box-shadow:0 3px 18px #1d4a8e80}
#gfq-01-panel #gfq-world{max-width:330px;border-color:#57728a;background:#192638;color:#eff5ff}
#gfq-01-panel .gfq-card{background:linear-gradient(115deg,#f7f9fd,#e9edf4);color:#202c3c;border:1px solid #d2e1ef;border-left:5px solid #618bce;border-radius:2px;box-shadow:0 3px 0 #131f30,0 5px 15px #0003;padding:15px 17px;margin:12px 0;position:relative}
#gfq-01-panel .gfq-card::after{content:"✦";position:absolute;right:8px;top:5px;color:#aec1dc70;font-size:20px;pointer-events:none}
#gfq-01-panel .gfq-card b{font-size:15px;letter-spacing:.02em}
#gfq-01-panel .gfq-card .gfq-muted{color:#57687c;opacity:1}
#gfq-01-panel .gfq-card button{border:1px solid #c6d5e9;background:#eff5ff;color:#1c3554;border-radius:2px}
#gfq-01-panel .gfq-card progress{accent-color:#5386dc}
#gfq-01-panel button.primary{background:#315eab;color:#fff;border-color:#6d9eea;border-radius:2px}
#gfq-01-panel input,#gfq-01-panel select,#gfq-01-panel textarea{border-radius:2px}
#gfq-01-panel .gfq-head button{background:none;border:1px solid #6f8ca1;border-radius:2px}
@media(max-width:760px){#gfq-01-panel{padding:14px;inset:4px;width:calc(100vw - 8px);height:calc(100dvh - 8px);max-height:none;margin:auto;overflow:auto}#gfq-01-panel::before{display:none}#gfq-01-panel .gfq-tabs{position:static;flex-direction:row;width:auto;gap:4px;margin:12px 0;overflow-x:auto}#gfq-01-panel .gfq-tabs button{white-space:nowrap;font-size:11px;padding:9px 10px;border-left:0;border-bottom:2px solid #5f748e}#gfq-01-panel .gfq-card{padding:10px}}
\`;
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
  function openPanel(){if(panel){panel.remove();panel=null;mount();return;}panel=document.createElement('dialog');panel.id=ID+'-panel';panel.setAttribute('aria-label','퀘스트');document.body.append(panel);panel.addEventListener('cancel',e=>{e.preventDefault();openPanel();});render();panel.showModal();mount();}
  const btn=(label,action,extra='')=>`<button data-action="${action}" ${extra}>${label}</button>`;
  function worldSelect(){return `<div class="gfq-row"><select id="gfq-world" class="gfq-fill"><option value="">월드 선택</option>${Object.keys(data.worlds).map(w=>`<option value="${esc(w)}" ${data.world===w?'selected':''}>${esc(w)}</option>`).join('')}</select>${btn('＋ 월드','new-world')}</div>`;}
  function render(){if(!panel)return;let w=current();panel.innerHTML=`<div class="gfq-head"><h2>📜 퀘스트</h2>${btn('닫기','close','aria-label="닫기"')}</div><p class="gfq-muted">월드별 수동 기록 · 가챠 재화와 별도 저장</p>${worldSelect()}${w?`<nav class="gfq-tabs">${[['quests','퀘스트'],['assets','자산'],['items','소지품'],['history','기록'],['settings','설정']].map(([key,label])=>`<button class="${currentTab===key?'primary':''}" data-tab="${key}">${label}</button>`).join('')}</nav><div id="gfq-content">${content(w)}</div>`:'<p>먼저 월드를 추가해 줘. 공식 게임 월드와 자동 연결하지 않으므로 정확한 월드 이름을 직접 입력해야 해.</p>'}`;}
  function content(w){switch(currentTab){case 'quests':return `<div class="gfq-row"><select id="gfq-filter">${['전체','일일','주간','의뢰','업적'].map(t=>`<option ${activeFilter===t?'selected':''}>${t}</option>`).join('')}</select>${btn('＋ 퀘스트','add-quest','class="primary"')}</div>${w.quests.filter(q=>activeFilter==='전체'||q.type===activeFilter).map(q=>`<div class="gfq-card"><div class="gfq-row"><b class="gfq-fill">${esc(q.title)}</b><small>${esc(q.type)}</small></div><div class="gfq-muted">${esc(q.detail)}</div><progress value="${Math.max(0,Math.min(q.progress,q.target))}" max="${q.target}"></progress><div class="gfq-row"><span class="gfq-fill">${q.progress} / ${q.target} ${q.claimed?'· 완료':''}</span>${btn('＋1','increment',`data-id="${esc(q.id)}" ${q.claimed?'disabled':''}`)}${btn(q.claimed?'완료됨':'완료','complete',`data-id="${esc(q.id)}" ${q.claimed?'disabled':''}`)}${btn('삭제','delete-quest',`data-id="${esc(q.id)}"`)}</div><div class="gfq-muted">보상(기록용): ${esc(q.reward)}</div></div>`).join('')||'<p class="gfq-muted">등록된 퀘스트가 없어.</p>'}`;
  case 'assets':return `${btn('＋ 필드 추가','add-field','class="primary"')}<p class="gfq-muted">소지금, 은행, 평판, 직업 등 월드별 자유 필드</p>${w.fields.map(f=>`<div class="gfq-card"><div class="gfq-row"><b class="gfq-fill">${esc(f.name)}</b><span>${esc(f.value)} ${esc(f.unit)}</span>${btn('수정','edit-field',`data-id="${esc(f.id)}"`)}${btn('삭제','delete-field',`data-id="${esc(f.id)}"`)}</div></div>`).join('')||'<p class="gfq-muted">추가한 필드가 없어.</p>'}`;
  case 'items':return `${btn('＋ 소지품','add-item','class="primary"')}${w.items.map(i=>`<div class="gfq-card gfq-row"><b class="gfq-fill">${esc(i.name)}</b><span>× ${i.qty}</span>${btn('수정','edit-item',`data-id="${esc(i.id)}"`)}${btn('삭제','delete-item',`data-id="${esc(i.id)}"`)}</div>`).join('')||'<p class="gfq-muted">소지품이 없어.</p>'}`;
  case 'history':return `${w.history.slice(0,100).map(h=>`<div class="gfq-card"><span class="gfq-muted">${esc(h.at)}</span><div>${esc(h.text)}</div></div>`).join('')||'<p class="gfq-muted">변경 기록이 없어.</p>'}`;
  case 'settings':return `<p>현재 월드: <b>${esc(data.world)}</b></p>${btn('백업 내보내기','export')}${btn('백업 가져오기','import')}${btn('월드 삭제','delete-world','class="gfq-danger"')}<p class="gfq-muted">데이터는 현재 브라우저의 로컬 저장소에 보관돼. 기기 간 자동 동기화나 AI 분석은 이 버전에서 지원하지 않아.</p>`;}}
  const ask=(message,def='')=>prompt(message,def);
  const update=fn=>{const w=current();if(!w)return;fn(w);save();render();};
  const record=(w,text)=>{w.history.unshift({at:now(),text});w.history=w.history.slice(0,500);};
  function exportData(){const file=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');const url=URL.createObjectURL(file);a.href=url;a.download='quest-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function importData(){const inp=document.createElement('input');inp.type='file';inp.accept='.json,application/json';inp.onchange=async()=>{const f=inp.files?.[0];if(!f||f.size>2e6)return alert('2MB 이하 JSON만 지원해.');try{const d=JSON.parse(await f.text());if(d.v!==1||typeof d.worlds!=='object'||!d.worlds||Array.isArray(d.worlds))throw Error('백업 형식이 맞지 않아.');for(const w of Object.values(d.worlds)){if(!Array.isArray(w.quests)||!Array.isArray(w.fields)||!Array.isArray(w.items)||!Array.isArray(w.history))throw Error('월드 데이터가 올바르지 않아.');}if(!confirm('현재 로컬 퀘스트 데이터를 가져온 백업으로 교체할까?'))return;const previous=data;data=d;if(!save()){data=previous;return;}render();}catch(e){alert('가져오기 실패: '+e.message);}};inp.click();}
  document.addEventListener('change',e=>{if(!panel||!panel.contains(e.target))return;if(e.target.id==='gfq-world'){data.world=e.target.value;save();render();}if(e.target.id==='gfq-filter'){activeFilter=e.target.value;render();}});
  document.addEventListener('click',e=>{const el=e.target.closest?.('#'+ID+'-panel [data-action],#'+ID+'-panel [data-tab]');if(!el)return;if(el.dataset.tab){currentTab=el.dataset.tab;render();return;}const act=el.dataset.action,id=el.dataset.id,w=current();
  if(act==='close')return openPanel();if(act==='new-world'){const name=ask('새 월드 이름');if(name===null)return;const key=name.trim();if(!key||key.length>100)return alert('1~100자로 입력해.');if(data.worlds[key])return alert('이미 존재하는 월드야.');data.worlds[key]=blank();data.world=key;save();return render();}if(!w)return;
  if(act==='add-quest'){const title=ask('퀘스트 이름');if(!title?.trim())return;const type=ask('종류: 일일 / 주간 / 의뢰 / 업적','의뢰');if(!['일일','주간','의뢰','업적'].includes(type))return alert('올바른 종류가 아니야.');const detail=ask('조건 및 설명','');if(detail===null)return;const count=Number(ask('목표 횟수 (1 이상)','1'));if(!Number.isSafeInteger(count)||count<1)return alert('목표 횟수를 확인해.');const reward=ask('보상 메모 (게임 재화에 자동 지급되지 않음)','');if(reward===null)return;return update(w=>{w.quests.push({id:uid(),title:title.trim(),type,detail,target:count,progress:0,reward,claimed:false});record(w,'퀘스트 등록: '+title);});}
  if(act==='increment'||act==='complete'){return update(w=>{const q=w.quests.find(x=>x.id===id);if(!q||q.claimed)return;q.progress=act==='complete'?q.target:Math.min(q.target,q.progress+1);if(act==='complete'){q.claimed=true;record(w,'퀘스트 완료: '+q.title+' / '+q.reward);}else record(w,'진행도 변경: '+q.title+' '+q.progress+'/'+q.target);});}
  if(act==='delete-quest'){const q=w.quests.find(x=>x.id===id);if(!q||!confirm('퀘스트를 삭제할까?'))return;return update(w=>{w.quests=w.quests.filter(x=>x.id!==id);record(w,'퀘스트 삭제: '+q.title);});}
  if(act==='add-field'||act==='edit-field'){const f=act==='edit-field'?w.fields.find(x=>x.id===id):null;const name=ask('필드 이름',f?.name||'');if(!name?.trim())return;const value=ask('필드 값',f?.value||'');if(value===null)return;const unit=ask('단위 (없으면 빈칸)',f?.unit||'');if(unit===null)return;return update(w=>{if(f){record(w,`${f.name}: ${f.value} → ${value}`);Object.assign(f,{name:name.trim(),value,unit});}else{w.fields.push({id:uid(),name:name.trim(),value,unit});record(w,'필드 추가: '+name);}});}
  if(act==='delete-field'){const f=w.fields.find(x=>x.id===id);if(!f||!confirm('필드를 삭제할까?'))return;return update(w=>{w.fields=w.fields.filter(x=>x.id!==id);record(w,'필드 삭제: '+f.name);});}
  if(act==='add-item'||act==='edit-item'){const it=act==='edit-item'?w.items.find(x=>x.id===id):null;const name=ask('소지품 이름',it?.name||'');if(!name?.trim())return;const qty=Number(ask('수량 (0 이상)',String(it?.qty??1)));if(!Number.isSafeInteger(qty)||qty<0)return alert('수량은 0 이상의 정수여야 해.');return update(w=>{if(it){record(w,`소지품 수정: ${it.name} ${it.qty} → ${qty}`);Object.assign(it,{name:name.trim(),qty});}else{w.items.push({id:uid(),name:name.trim(),qty});record(w,'소지품 추가: '+name);}});}
  if(act==='delete-item'){const it=w.items.find(x=>x.id===id);if(!it||!confirm('소지품을 삭제할까?'))return;return update(w=>{w.items=w.items.filter(x=>x.id!==id);record(w,'소지품 삭제: '+it.name);});}
  if(act==='export')return exportData();if(act==='import')return importData();if(act==='delete-world'){if(!confirm('현재 월드의 퀘스트 데이터를 삭제할까? 게임 원본 세이브는 삭제되지 않아.'))return;delete data.worlds[data.world];data.world=Object.keys(data.worlds)[0]||'';save();render();}
  });
  mount();const mo=new MutationObserver(()=>{if(findHost()!==gameHost)mount();});mo.observe(document.documentElement,{childList:true,subtree:false});
  const sync=setInterval(()=>{if(!gameHost || !gameHost.isConnected || !getButton())mount();},1400);
  window.addEventListener('pagehide',()=>{mo.disconnect();if(gameObserver)gameObserver.disconnect();if(gameDebounce)clearTimeout(gameDebounce);clearInterval(sync);});
})();

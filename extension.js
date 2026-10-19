/* 퀘스트 v0.5.2 — standalone, local-only manual companion; no modification to Gacha Forge saves. */
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
  const save=()=>{try{localStorage.setItem(STORE,JSON.stringify(data));gfqInjectSchedule();return true;}catch(e){alert('저장하지 못했습니다: '+e.message);return false;}};
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

  /* v0.5.2 light techwear layout: scoped to the panel, toasts keep their dark style */
  style.textContent += `
#gfq-01-panel{--pa:#d8dce0;--sh:#eef0f2;--sh2:#e3e6e9;--slab:#262d36;--slab2:#353e4a;--ink:#1b2129;--sub:#5d6772;--line:#adb4bc;--sig:#17a2c4;--sigk:#0c6a82;--amb:#cc8f22;--red:#bd463c;--grn:#2c8d62;--disp:"Bahnschrift","DIN Alternate","Barlow Semi Condensed","Pretendard","Noto Sans KR",system-ui,sans-serif;
position:fixed;inset:0;margin:auto;transform:none;width:min(1100px,calc(100vw - 38px));height:min(780px,calc(100dvh - 36px));max-height:none;padding:0;overflow:hidden;color:var(--ink);border:1px solid #8d959e;border-radius:0;background:var(--pa);box-shadow:0 30px 90px #000a;font:14px/1.55 "Pretendard","Noto Sans KR",system-ui,sans-serif}
#gfq-01-panel::backdrop{background:#0b0f14b8;backdrop-filter:blur(3px)}
#gfq-01-panel .gfq-num{font-family:var(--disp);font-variant-numeric:tabular-nums;letter-spacing:.01em}
#gfq-01-panel .gfq-frame{height:100%;display:grid;grid-template-columns:190px minmax(0,1fr);grid-template-rows:64px minmax(0,1fr) 34px}
#gfq-01-panel .gfq-head{grid-column:1/-1;display:flex;align-items:center;gap:14px;padding:0 18px 0 22px;background:var(--slab);color:#e9edf1;border-bottom:3px solid var(--sig)}
#gfq-01-panel .gfq-mark{width:26px;height:26px;background:repeating-linear-gradient(135deg,var(--sig) 0 3px,transparent 3px 6px);clip-path:polygon(0 0,100% 0,100% 70%,70% 100%,0 100%)}
#gfq-01-panel .gfq-head h2{margin:0;font:700 19px/1 var(--disp);letter-spacing:.06em}
#gfq-01-panel .gfq-head .gfq-en{font-size:11px;color:#8f9aa6;margin-top:3px;letter-spacing:.04em}
#gfq-01-panel .gfq-head button{margin-left:auto;width:38px;height:38px;border:1px solid #56606c;border-radius:0;background:transparent;color:#e9edf1;font-size:16px}
#gfq-01-panel .gfq-head button:hover{background:var(--slab2)}
#gfq-01-panel .gfq-side{display:flex;flex-direction:column;gap:10px;padding:18px 0 16px 14px;min-height:0;background:var(--sh2);border-right:1px solid var(--line)}
#gfq-01-panel .gfq-tabs{display:flex;flex-direction:column;align-items:stretch;gap:6px;margin:0}
#gfq-01-panel .gfq-tabs button{position:relative;display:block;text-align:left;border:0;border-radius:0;padding:12px 14px 12px 30px;background:var(--slab);color:#c9d0d7;font:600 15px/1.2 var(--disp);letter-spacing:.04em;clip-path:polygon(0 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%)}
#gfq-01-panel .gfq-tabs button::before{content:"";position:absolute;left:12px;top:50%;width:6px;height:6px;margin-top:-3px;background:#5b6672}
#gfq-01-panel .gfq-tabs button:hover:not(:disabled){background:var(--slab2);color:#fff;border:0}
#gfq-01-panel .gfq-tabs button.primary:hover:not(:disabled){background:var(--sh);color:var(--ink)}
#gfq-01-panel .gfq-tabs button.primary{background:var(--sh);color:var(--ink);box-shadow:inset 4px 0 var(--sig);margin-right:-1px}
#gfq-01-panel .gfq-tabs button.primary::before{width:0;height:0;margin-top:-5px;background:none;border-left:7px solid var(--sig);border-top:5px solid transparent;border-bottom:5px solid transparent}
#gfq-01-panel .gfq-side-foot{margin-top:auto;margin-right:14px;padding:10px 12px;border:1px solid var(--line);background:var(--sh);display:flex;flex-direction:column;gap:1px;font-size:11px;color:var(--sub)}
#gfq-01-panel .gfq-side-foot b{font-size:17px;color:var(--ink)}
#gfq-01-panel .gfq-main{min-width:0;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:20px 28px 28px;background:var(--sh)}
#gfq-01-panel .gfq-context{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin:0 0 12px}
#gfq-01-panel .gfq-context b{font:700 30px/1 var(--disp);letter-spacing:.03em}
#gfq-01-panel .gfq-count{font-size:28px;font-weight:600;color:var(--ink)}#gfq-01-panel .gfq-count small{font-size:15px;color:var(--sub)}
#gfq-01-panel .gfq-worldbar{margin:0 0 16px;padding-bottom:14px;border-bottom:1px solid var(--line)}
#gfq-01-panel button,#gfq-01-panel select,#gfq-01-panel input,#gfq-01-panel textarea{border-radius:0;border:1px solid var(--line);background:#f7f8f9;color:var(--ink)}
#gfq-01-panel button{font-weight:600;padding:6px 12px;transition:background-color .12s}
#gfq-01-panel button:hover:not(:disabled){background:#fff;border-color:var(--sub)}
#gfq-01-panel button:focus-visible,#gfq-01-panel select:focus-visible,#gfq-01-panel input:focus-visible{outline:2px solid var(--sig);outline-offset:1px}
#gfq-01-panel button.primary{background:var(--slab);color:#fff;border-color:var(--slab)}
#gfq-01-panel button.primary:hover:not(:disabled){background:var(--slab2);border-color:var(--slab2)}
#gfq-01-panel button.gfq-danger{color:var(--red);border-color:#d8a39e}
#gfq-01-panel #gfq-world{min-width:180px;width:min(300px,100%);min-height:36px}
#gfq-01-panel h3{font:700 16px/1.2 var(--disp);letter-spacing:.03em;margin:22px 0 8px}
#gfq-01-panel .gfq-muted{font-size:12px;color:var(--sub);opacity:1}
#gfq-01-panel .gfq-card{margin:10px 0;padding:13px 16px;background:#f8f9fa;border:1px solid var(--line);border-left:4px solid var(--slab);border-radius:0;color:var(--ink);box-shadow:none}
#gfq-01-panel .gfq-card b{color:var(--ink)}
#gfq-01-panel .gfq-card button{padding:4px 10px;margin:2px 0}
#gfq-01-panel .gfq-card button[aria-pressed=true]{background:var(--slab);color:#fff;border-color:var(--slab)}
#gfq-01-panel .gfq-card progress{accent-color:var(--sig);height:6px;margin:8px 0 4px}
#gfq-01-panel details summary{cursor:pointer;font-size:12px;color:var(--sub);margin:4px 0}
#gfq-01-panel .gfq-empty{margin:10px 0;min-height:150px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;text-align:center;padding:24px;border:1px dashed var(--line);background:repeating-linear-gradient(135deg,transparent 0 7px,#0000000a 7px 8px)}
#gfq-01-panel .gfq-empty-symbol{font-size:30px;color:var(--line)}#gfq-01-panel .gfq-empty strong{font-size:15px}
#gfq-01-panel .gfq-footer{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;padding:0 18px;background:var(--slab);color:#8f9aa6;font-size:11px}
#gfq-01-panel .gfq-sec{display:flex;align-items:center;gap:10px;margin:26px 0 8px}
#gfq-01-panel .gfq-sec h3{margin:0;white-space:nowrap}
#gfq-01-panel .gfq-sec-n{font-size:14px;color:var(--sub);white-space:nowrap}
#gfq-01-panel .gfq-sec-line{flex:1;height:1px;background:var(--line)}
#gfq-01-panel .gfq-sec button{padding:4px 10px;font-size:12px}
#gfq-01-panel .gfq-id{position:relative;display:grid;grid-template-columns:minmax(0,1fr) 150px;background:#fbfbfc;border:1px solid var(--line);clip-path:polygon(0 0,calc(100% - 18px) 0,100% 18px,100% 100%,18px 100%,0 calc(100% - 18px));min-height:250px}
#gfq-01-panel .gfq-id::before{content:"";position:absolute;left:8px;top:8px;width:14px;height:14px;border-left:2px solid var(--sig);border-top:2px solid var(--sig)}
#gfq-01-panel .gfq-id-body{padding:22px 24px 18px 28px;display:flex;flex-direction:column;gap:6px;min-width:0}
#gfq-01-panel .gfq-id-world{font-size:12px;color:var(--sigk);font-weight:600}
#gfq-01-panel .gfq-id-name{font:700 38px/1.05 var(--disp);letter-spacing:.02em;margin-bottom:6px;overflow-wrap:anywhere}
#gfq-01-panel .gfq-id-unset{color:var(--line)}
#gfq-01-panel .gfq-id-k{font-size:11px;font-weight:700;color:var(--sub)}
#gfq-01-panel .gfq-id-rep{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
#gfq-01-panel .gfq-id-rep b{font-size:22px;line-height:1}#gfq-01-panel .gfq-id-rep b small{font-size:12px;color:var(--sub);margin-left:2px}
#gfq-01-panel .gfq-seg{display:flex;gap:3px;flex-wrap:wrap;max-width:330px}
#gfq-01-panel .gfq-seg i{width:13px;height:14px;background:#d6dade;clip-path:polygon(25% 0,100% 0,75% 100%,0 100%)}
#gfq-01-panel .gfq-seg i.on{background:var(--sig)}
#gfq-01-panel .gfq-chips{display:flex;gap:6px;flex-wrap:wrap}
#gfq-01-panel .gfq-chip{display:inline-flex;flex-direction:column;padding:4px 10px;background:var(--slab);color:#fff;border-left:3px solid var(--sig)}
#gfq-01-panel .gfq-chip b{color:#fff;font-size:13px}#gfq-01-panel .gfq-chip small{font-size:11px;color:#a9b3bd}
#gfq-01-panel .gfq-id-date{display:flex;flex-direction:column;gap:2px;margin-top:10px;padding-top:12px;border-top:1px dashed var(--line)}
#gfq-01-panel .gfq-id-date b{font-size:20px}
#gfq-01-panel .gfq-id-date .gfq-row{margin-top:6px}#gfq-01-panel .gfq-id-date button{font-size:12px;padding:4px 10px}
#gfq-01-panel .gfq-id-slab{background:var(--slab);color:#e9edf1;padding:18px 16px 14px;display:flex;flex-direction:column;gap:10px}
#gfq-01-panel .gfq-id-initial{font:700 64px/1 var(--disp);color:var(--sh);text-align:center;padding:8px 0 10px;border-bottom:1px solid #4a535e}
#gfq-01-panel .gfq-id-slab dl{display:grid;grid-template-columns:1fr auto;gap:4px 8px;margin:0;font-size:12px}
#gfq-01-panel .gfq-id-slab dt{color:#98a3ae}#gfq-01-panel .gfq-id-slab dd{margin:0;font-size:16px;text-align:right}#gfq-01-panel .gfq-id-slab dd small{color:#98a3ae;font-size:11px}
#gfq-01-panel .gfq-barcode{display:flex;height:34px;margin-top:auto;gap:0}
#gfq-01-panel .gfq-barcode i{background:#e9edf1;min-width:1px}#gfq-01-panel .gfq-barcode i.gap{background:transparent;flex:1}
#gfq-01-panel .gfq-tiles{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
#gfq-01-panel .gfq-tile{display:flex;flex-direction:column;gap:4px;padding:10px 12px;background:#fbfbfc;border:1px solid var(--line);border-top:3px solid var(--slab)}
#gfq-01-panel .gfq-tile span{font-size:12px;color:var(--sub)}#gfq-01-panel .gfq-tile b{font-size:19px;line-height:1.1;overflow-wrap:anywhere}
#gfq-01-panel .gfq-tile.in{border-top-color:var(--grn)}#gfq-01-panel .gfq-tile.out{border-top-color:var(--red)}#gfq-01-panel .gfq-tile.wait{border-top-color:var(--amb)}
#gfq-01-panel .gfq-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:8px}
#gfq-01-panel .gfq-slot{position:relative;display:flex;flex-direction:column;gap:4px;min-height:132px;padding:12px;background:#fbfbfc;border:1px solid var(--line)}
#gfq-01-panel .gfq-slot b{font-size:14px;line-height:1.35;padding-right:34px;overflow-wrap:anywhere}
#gfq-01-panel .gfq-slot small{font-size:11px;color:var(--sub)}
#gfq-01-panel .gfq-slot .gfq-row{margin-top:auto;gap:4px}#gfq-01-panel .gfq-slot button{padding:3px 9px;font-size:12px}
#gfq-01-panel .gfq-slot-qty{position:absolute;right:10px;top:9px;font-size:15px;font-weight:700;color:var(--sub)}
#gfq-01-panel .gfq-slot.pending{background:repeating-linear-gradient(135deg,#f4f5f6 0 7px,#e7e9ec 7px 8px);border:1px dashed #9aa2ab}
#gfq-01-panel .gfq-slot-q{position:absolute;right:10px;top:4px;font:700 34px/1 var(--disp);color:var(--amb)}
#gfq-01-panel .gfq-slot.ticket{border-left:4px solid var(--sig)}
#gfq-01-panel .gfq-slot.ticket .gfq-slot-qty{color:var(--sigk)}
#gfq-01-panel .gfq-slot.used{opacity:.6;border-left-color:var(--line)}
#gfq-01-panel .gfq-tag{display:inline-block;align-self:flex-start;font-size:11px;font-weight:700;padding:1px 7px;background:var(--sh2);color:var(--sub);white-space:nowrap}
#gfq-01-panel .gfq-tag.wait{background:#f6e6c4;color:#7a5410}
#gfq-01-panel .gfq-tx{border-top:1px solid var(--line)}
#gfq-01-panel .gfq-tx-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 14px;padding:10px 4px 10px 12px;border-bottom:1px solid var(--line);border-left:3px solid var(--line)}
#gfq-01-panel .gfq-tx-main{display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0}
#gfq-01-panel .gfq-tx-amt{font-size:17px;font-weight:700;text-align:right}
#gfq-01-panel .gfq-tx-row>small,#gfq-01-panel .gfq-tx-row>details,#gfq-01-panel .gfq-tx-row>.gfq-row{grid-column:1/-1}
#gfq-01-panel .gfq-tx-row>small{font-size:12px;color:var(--sub)}
#gfq-01-panel .gfq-tx-row button{padding:3px 9px;font-size:12px}
#gfq-01-panel .gfq-tx-row.s-received{border-left-color:var(--grn)}#gfq-01-panel .gfq-tx-row.s-paid{border-left-color:var(--red)}#gfq-01-panel .gfq-tx-row.s-pending,#gfq-01-panel .gfq-tx-row.s-receivable{border-left-color:var(--amb)}
#gfq-01-panel .gfq-tx-row.s-received .gfq-tag{background:#d3eadf;color:#1d5e41}#gfq-01-panel .gfq-tx-row.s-paid .gfq-tag{background:#f1d6d3;color:#83291f}#gfq-01-panel .gfq-tx-row.s-pending .gfq-tag,#gfq-01-panel .gfq-tx-row.s-receivable .gfq-tag{background:#f6e6c4;color:#7a5410}
#gfq-01-panel .gfq-field{display:grid;grid-template-columns:minmax(90px,30%) minmax(0,1fr) auto auto;gap:8px;align-items:center;padding:7px 4px;border-bottom:1px solid var(--line)}
#gfq-01-panel .gfq-field span{font-size:12px;color:var(--sub)}#gfq-01-panel .gfq-field b{overflow-wrap:anywhere}#gfq-01-panel .gfq-field button{padding:3px 9px;font-size:12px}
#gfq-01-panel .gfq-more{margin-top:10px}
@media(max-width:700px){#gfq-01-panel{inset:3px;width:calc(100vw - 6px);height:calc(100dvh - 6px)}#gfq-01-panel .gfq-frame{grid-template-columns:1fr;grid-template-rows:52px auto minmax(0,1fr) 30px}#gfq-01-panel .gfq-head{padding:0 10px 0 14px}#gfq-01-panel .gfq-side{flex-direction:row;padding:8px 10px;border-right:0;border-bottom:1px solid var(--line)}#gfq-01-panel .gfq-tabs{flex-direction:row;gap:4px;flex:1}#gfq-01-panel .gfq-tabs button{flex:1;text-align:center;padding:9px 4px;font-size:13px;clip-path:none}#gfq-01-panel .gfq-tabs button::before{display:none}#gfq-01-panel .gfq-tabs button.primary{box-shadow:inset 0 -3px var(--sig);margin:0}#gfq-01-panel .gfq-side-foot{display:none}#gfq-01-panel .gfq-main{padding:14px}#gfq-01-panel .gfq-context b{font-size:24px}#gfq-01-panel .gfq-id{grid-template-columns:1fr}#gfq-01-panel .gfq-id-slab{display:grid;grid-template-columns:auto 1fr;align-items:center}#gfq-01-panel .gfq-id-initial{font-size:40px;border:0;padding:0 8px}#gfq-01-panel .gfq-barcode{grid-column:1/-1}#gfq-01-panel .gfq-id-name{font-size:30px}#gfq-01-panel .gfq-tiles{grid-template-columns:1fr 1fr}#gfq-01-panel .gfq-field{grid-template-columns:1fr auto auto}#gfq-01-panel .gfq-field span{grid-column:1/-1}}
@media(prefers-reduced-motion:reduce){#gfq-01-panel button{transition:none}}
`;
  style.textContent+=`
#${ID}-toasts{position:fixed;inset:16px 16px auto auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;display:flex;flex-direction:column;gap:8px;z-index:2147483002;max-width:min(380px,calc(100vw - 32px))}
#${ID}-toasts:not(:popover-open){display:none}
#${ID}-toasts .gfq-toast{display:flex;flex-direction:column;align-items:flex-start;gap:3px;width:100%;text-align:left;padding:10px 14px;border:1px solid #4d6f99;border-left:4px solid #a5d7ff;border-radius:2px;background:linear-gradient(110deg,#13233a,#1a2c46);color:#eaf2ff;font:13px/1.45 system-ui,"Noto Sans KR",sans-serif;box-shadow:0 10px 28px #000b;cursor:pointer;animation:gfq-toast-in .25s ease-out}
#${ID}-toasts .gfq-toast b{font-size:11px;letter-spacing:.12em;color:#a5d7ff}
#${ID}-toasts .gfq-toast-quest,#${ID}-toasts .gfq-toast-step{border-left-color:#f2c86b}#${ID}-toasts .gfq-toast-quest b,#${ID}-toasts .gfq-toast-step b{color:#f2c86b}
#${ID}-toasts .gfq-toast-money,#${ID}-toasts .gfq-toast-rep{border-left-color:#7fd69b}#${ID}-toasts .gfq-toast-money b,#${ID}-toasts .gfq-toast-rep b{color:#7fd69b}
#${ID}-toasts .gfq-toast-offer{cursor:default;border-color:#c9a55a;box-shadow:0 0 0 1px #f2c86b55,0 12px 32px #000c}
#${ID}-toasts .gfq-offer-row{display:flex;gap:8px;margin-top:6px}#${ID}-toasts .gfq-offer-row button{font:600 12px system-ui,"Noto Sans KR",sans-serif;padding:6px 14px;border-radius:2px;border:1px solid #f2c86b;background:#f2c86b;color:#1b2232;cursor:pointer}#${ID}-toasts .gfq-offer-row button[data-o=later]{background:transparent;color:#f2c86b}
#${ID}-toasts .gfq-toast-date{border-left-color:#c7a6ff}#${ID}-toasts .gfq-toast-date b{color:#c7a6ff}#${ID}-toasts .gfq-toast-date span{font-size:15px;font-weight:700;letter-spacing:.04em}
#${ID}-toasts .gfq-toast-review{border-left-color:#f0a35e}#${ID}-toasts .gfq-toast-review b{color:#f0a35e}
@keyframes gfq-toast-in{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:none}}
@media(prefers-reduced-motion:reduce){#${ID}-toasts .gfq-toast{animation:none}}
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
        gameObserver=new MutationObserver(()=>{if(gameDebounce)return;gameDebounce=setTimeout(()=>{gameDebounce=0;placeButton();gfqSceneTick();},120);});
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
    const items=w.items.filter(i=>i.state!=='pending'&&i.kind!=='voucher').slice(0,35),pendingItems=w.items.filter(i=>i.state==='pending').slice(0,15),vouchers=w.items.filter(i=>i.kind==='voucher'&&i.qty>0).slice(0,15);
    return [
      '[WORLD QUEST CONTEXT — user-maintained reference]',
      'World: '+data.world,
      ...(gfqCurrentDate(w)?['In-world date: '+gfqCurrentDate(w).date+' ('+gfqCurrentDate(w).basis+')']:[]),
      'Active quests:',
      ...(active.length?active.map(q=>'- '+q.title+' ('+q.type+'): '+q.detail+' ['+q.progress+'/'+q.target+']; reward note: '+q.reward):['- none']),
      'Character/world assets:',
      ...(fields.length?fields.map(f=>'- '+f.name+': '+f.value+' '+f.unit):['- none']),
      'Story inventory:',
      ...(items.length?items.map(i=>'- '+i.name+': '+i.qty):['- none']),
      ...(vouchers.length?['Benefits/vouchers held (uses left):',...vouchers.map(i=>'- '+i.name+': '+i.qty)]:[]),
      ...(pendingItems.length?['Promised but not yet received (not owned):',...pendingItems.map(i=>'- '+i.name+(i.timing?' (expected: '+i.timing.text+', said in '+i.timing.anchor+')':''))]:[]),
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
    gfqAutoSchedule(key);
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
        if(['text','narration','narrative','dialogue','content','line','prose'].includes(k.toLowerCase())&&typeof value==='string'&&(value.trim().length>12||gfqDateHeading(value))){
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
      w.gfStorySamples=w.gfStorySamples.slice(-180);save();if(panel&&currentTab==='history'&&data.world===key)render();
      gfqAutoSchedule(key);}
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
  // v0.5.1: the game's /state lists each run with its lorebook settings; keep a copy (no extra request).
  function gfqRememberLore(runId,v){
    const run=(Array.isArray(v?.runs)?v.runs.find(x=>x&&x.runId===runId):null)||(v?.run?.runId===runId?v.run:null)||(v?.activeRun?.runId===runId?v.activeRun:null);
    if(!run||!run.lore||typeof run.lore!=='object')return;
    const key=Object.keys(data.worlds).find(k=>data.worlds[k]?.gfRunId===runId);if(!key)return;
    const lore=gfqCleanLore(run.lore),w=data.worlds[key];
    if(JSON.stringify(w.gfRunLore)!==JSON.stringify(lore)){w.gfRunLore=lore;save();}
  }
  function gfqCleanLore(l){
    const ids=v=>[...new Set((Array.isArray(v)?v:[]).map(x=>String(x||'').trim()).filter(Boolean))].slice(0,24);
    const num=v=>v===null||v===undefined||v===''?null:(Number.isFinite(Number(v))?Number(v):null);
    return {worldIds:ids(l?.worldIds),castIds:ids(l?.castIds),worldBudget:num(l?.worldBudget),castBudget:num(l?.castBudget),beat:l?.beat===true||l?.beat==='true'};
  }
  // Pure: our lorebook first (so a tight budget never drops it), every other setting kept.
  function gfqMergeLore(lore,lorebookId,connect){
    const l=gfqCleanLore(lore),rest=l.worldIds.filter(id=>id!==lorebookId);
    return connect?{...l,worldIds:[lorebookId,...rest].slice(0,24),beat:true}:{...l,worldIds:rest};
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
      if(runId){attachObservedRun(runId,name);rememberChapters(runId,v,req.url||'');intakeStory(runId,v,req.url||'',req);gfqRememberLore(runId,v);}
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
      '<label for="gfq-ai-mode">분석 실행 방식</label><select id="gfq-ai-mode">'+[['manual','수동 분석 (기록 탭의 버튼으로 실행)'],['scene','스토리가 생성되면 바로 자동 분석 (권장)'],['chapter','다음 챕터가 시작된 뒤 지난 챕터 자동 분석']].map(([v,l])=>'<option value="'+v+'" '+((['chapter','scene'].includes(data.aiMode)?data.aiMode:'manual')===v?'selected':'')+'>'+l+'</option>').join('')+'</select>'+
      '<label><input type="checkbox" id="gfq-auto-apply" style="width:auto" '+(data.autoApply?'checked':'')+'> 분석 결과 자동 반영</label>'+
      '<label><input type="checkbox" id="gfq-scene-timed" style="width:auto" '+(data.sceneTimed!==false?'checked':'')+' '+(data.autoApply?'':'disabled')+'> 해당 대사가 나올 때 반영·알림 (새 퀘스트는 수락 창 표시)</label>'+
      '<p class="gfq-muted">자동 반영을 켜면 원문 근거·금액·연결 검증을 통과한 항목은 바로 퀘스트와 프로필(돈·소지품)에 반영되고, 불확실한 항목만 검토 목록에 남습니다. 반영 직전 상태를 저장하므로 기록 탭에서 마지막 자동 반영을 되돌릴 수 있습니다. 자동 분석은 게임 통신을 관찰해, 새 스토리가 들어오고 6초 동안 추가 응답이 없을 때 아직 분석하지 않은 장면만 한 번 분석합니다. 챕터가 한 번에 생성되면 그 챕터 전체가 한 번에 분석됩니다. 장면이 조금씩 들어오는 경우 호출이 잦아질 수 있으니, 그때는 \'다음 챕터가 시작된 뒤\' 방식을 써 주세요.</p>'+
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
    if(!x||!['quest','asset','item','credential','contract','benefit'].includes(x.category))return false;
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
  // v0.4.4: world calendar. Dates come only from the story text; a day change without a written date is an estimate.
  function gfqYmd(y,m,d){
    if(!(y>=1000&&y<=9999&&m>=1&&m<=12&&d>=1&&d<=31))return null;
    const t=new Date(Date.UTC(y,m-1,d));if(t.getUTCMonth()!==m-1)return null;
    return t.toISOString().slice(0,10);
  }
  function gfqDatesIn(text){
    const out=[];
    for(const m of String(text||'').matchAll(/(\d{4})\s*(?:[-./]|년\s*)\s*(\d{1,2})\s*(?:[-./]|월\s*)\s*(\d{1,2})\s*일?/gu)){const v=gfqYmd(+m[1],+m[2],+m[3]);if(v&&!out.includes(v))out.push(v);}
    return out;
  }
  function gfqAddDays(ymd,n){const [y,m,d]=ymd.split('-').map(Number);const t=new Date(Date.UTC(y,m-1,d+n));return t.toISOString().slice(0,10);}
  const GFQ_DAY_WORDS=/(다음\s?날|이튿날|이틀|사흘|나흘|닷새|하루가|밤이 지나|\d+\s*일\s*(?:뒤|후|만에|이 지나)|며칠|일주일)/u;
  // Pure: validate the AI's timeline for one batch. Returns {date,basis,evidence} or null.
  function gfqTimelineFrom(tl,texts,prevDate){
    if(!tl||typeof tl!=='object')return null;
    const ev=typeof tl.dateEvidence==='string'&&tl.dateEvidence.trim().length>=4?gfqLocateEvidence(tl.dateEvidence.trim(),texts):null;
    const date=typeof tl.currentDate==='string'?tl.currentDate.trim():'';
    if(ev&&date&&gfqDatesIn(ev).includes(date))return {date,basis:'원문',evidence:ev};
    const raw=typeof tl.daysEvidence==='string'?tl.daysEvidence.trim():'';
    // Day-change cues are short ('다음 날 아침'), so a verbatim match is accepted here.
    const n=Number(tl.daysPassed),dev=raw.length>=2?(gfqLocateEvidence(raw,texts)||(texts.some(t=>String(t).includes(raw))?raw:null)):null;
    if(prevDate&&Number.isSafeInteger(n)&&n>=1&&n<=60&&dev&&GFQ_DAY_WORDS.test(dev))return {date:gfqAddDays(prevDate,n),basis:'추정',evidence:dev};
    return null;
  }
  function gfqCurrentDate(w){
    const auto=Object.entries(w?.gfDates||{}).map(([ch,v])=>({ch:Number(ch)||0,...v})).sort((a,b)=>a.ch-b.ch).pop()||null;
    // v0.4.6: a date line the reader has reached, or a manual entry, is 'now'. Dates analysed ahead
    // of the reader (a chapter generated but not yet read) only apply to later chapters.
    const man=w?.gfDateManual?{...w.gfDateManual,basis:'직접 입력',ms:Number(w.gfDateManual.ms||0)}:null;
    const read=w?.gfReadingDate?{...w.gfReadingDate,basis:'읽은 장면',ms:Number(w.gfReadingDate.ms||0)}:null;
    const live=[man,read].filter(Boolean).sort((a,b)=>a.ms-b.ms).pop()||null;
    if(live&&(!auto||Number(live.chapter||0)>=auto.ch))return {date:live.date,basis:live.basis,source:live.chapter?'챕터 '+live.chapter+(live.basis==='직접 입력'?' 이후':''):'',chapter:Number(live.chapter||0)};
    return auto?{date:auto.date,basis:auto.basis,source:'챕터 '+auto.ch,chapter:auto.ch,evidence:auto.evidence}:null;
  }
  const gfqWeekday=ymd=>{const [y,m,d]=ymd.split('-').map(Number);return '일월화수목금토'[new Date(Date.UTC(y,m-1,d)).getUTCDay()];};
  function gfqDayDiff(a,b){const t=x=>{const [y,m,d]=x.split('-').map(Number);return Date.UTC(y,m-1,d);};return Math.round((t(b)-t(a))/864e5);}
  // '내일 이 시간' said in chapter 3 → the date it points to, when chapter 3's date is known.
  function gfqResolveTiming(w,t){
    if(!t||!t.text)return null;
    const ch=(String(t.anchor||'').match(/챕터\s*(\d+)/u)||[])[1];
    const base=t.base||(ch&&w?.gfDates?.[ch]?.date)||null;if(!base)return null;
    const m=t.text.match(/(\d+)\s*일\s*(?:후|뒤)/u);
    const n=m?+m[1]:/모레/.test(t.text)?2:/(내일|익일|다음\s?날)/u.test(t.text)?1:/(오늘|금일)/.test(t.text)?0:null;
    return n===null?null:gfqAddDays(base,n);
  }
  // v0.4.5: date headings. A line that is just a date ('2033-04-09', '[2033년 4월 9일 (수)]') sets the date
  // for every line below it until the next heading, across scenes and chapters.
  function gfqDateHeading(line){
    const t=String(line||'').trim().replace(/^[\[\(<【〈《「『\s]+/u,'');
    if(!t||t.length>40)return null;
    const m=t.match(/^(\d{4})\s*(?:[-./]|년\s*)\s*(\d{1,2})\s*(?:[-./]|월\s*)\s*(\d{1,2})\s*일?/u);
    return m?gfqYmd(+m[1],+m[2],+m[3]):null;
  }
  function gfqDateMap(w){
    let cur=null;const recs=[];
    for(const r of gfqStoryRecords(w)){
      const changes=[],start=cur;let off=0;
      for(const line of r.text.split('\n')){const d=gfqDateHeading(line);if(d){changes.push({at:off,date:d});cur=d;}off+=line.length+1;}
      recs.push({source:r.source,text:r.text,start,changes,end:cur});
    }
    return recs;
  }
  function gfqDateAt(map,evidence){
    if(!evidence)return null;
    for(const r of map){
      let at=r.text.indexOf(evidence);
      if(at<0){const loc=gfqLocateEvidence(evidence,[r.text]);if(!loc)continue;at=r.text.indexOf(loc);}
      let d=r.start;for(const c of r.changes)if(c.at<=at)d=c.date;
      return d;
    }
    return null;
  }
  function gfqHeadingDates(map){
    const out={};
    for(const r of map){const ch=(String(r.source).match(/^챕터\s*([^·\s]+)/u)||[])[1];if(ch&&ch!=='?'&&r.changes.length)out[ch]={date:r.end,basis:'원문',evidence:'날짜 표시 '+r.end,source:'챕터 '+ch};}
    return out;
  }
  function gfqStampDates(map,p){
    p.date=gfqDateAt(map,p.evidence)||p.date||null;
    if(p.category==='quest'){const l=gfqEvidenceList(p);p.endDate=gfqDateAt(map,l[l.length-1])||p.date;}
    return p;
  }
  // v0.3.12: words that mark cash income vs. discounts/free services.
  const GFQ_CASH_WORDS=/(수당|보수|급여|기본급|정산금|대금|상금|사례금|보상금|지원금|위로금|일당|월급|용역비)/u;
  const GFQ_DISCOUNT_WORDS=/(감면|할인|우대|면제|무상|무료)/u;
  // Every amount written in a text (1,400,000 / 140만 / 1.5억 / 50퍼센트 ...).
  function gfqAmountsIn(text){
    const out=new Set(),t=String(text||'');
    for(const m of t.matchAll(/(\d[\d,]*(?:\.\d+)?)\s*(억|만|천)?/gu)){
      const n=Number(m[1].replace(/,/g,''));if(!Number.isFinite(n))continue;
      out.add(m[2]==='억'?n*1e8:m[2]==='만'?n*1e4:m[2]==='천'?n*1e3:n);
      if(m[2]==='만'||m[2]==='억')out.add(n); // "140만" may also be read as 140
    }
    return out;
  }
  function gfqSafeProposal(x,ctx=GFQ_GENERIC){
    const result={...x};
    const q=String(result.evidence||''),name=String(result.name||'');
    // v0.3.10: "N원 상당의 <물품>" is the value of goods, never cash owed or received.
    if(['asset','contract'].includes(result.category)&&!GFQ_CASH_WORDS.test(name)&&/원\s*상당(?:의)?\s*(?!금액|현금|액수)\S/u.test(q)){
      const got=/(수령했|받았|건네받|지급받았|손에 넣)/u.test(q);
      Object.assign(result,{category:'item',status:got?'confirmed':'active',financialStatus:got?'ownership':'pending',
        value:typeof result.amount==='number'?result.amount:([...gfqAmountsIn((q.match(/([\d,]+(?:\.\d+)?\s*(?:억|만)?)\s*원\s*상당/u)||[])[1]||'')][0]??null),amount:null,unit:'',
        auditNote:'금액은 물품의 가치이며 현금이 아닙니다. '+(got?'수령한 물품':'수령 예정 물품')+'으로 분류했습니다.'});
    }
    // v0.3.11: a future discount (e.g. '공임 50퍼센트 감면 보장') is a benefit voucher, not money.
    if(['asset','contract'].includes(result.category)&&!GFQ_CASH_WORDS.test(name)&&(String(result.unit||'')==='%'||/퍼센트|%/.test(name))&&GFQ_DISCOUNT_WORDS.test(name+' '+q)){
      result.category='benefit';
    }
    // v0.3.12: money labelled as a benefit goes back to the ledger (수당·보수는 이용권이 아니라 자산입니다).
    if(result.category==='benefit'&&GFQ_CASH_WORDS.test(name)&&(String(result.unit||'')==='원'||!GFQ_DISCOUNT_WORDS.test(name))){
      const mixed=GFQ_DISCOUNT_WORDS.test(name);
      Object.assign(result,{category:'asset',financialStatus:['received','receivable','pending'].includes(result.financialStatus)?result.financialStatus:'pending',
        auditNote:'금전 보수이므로 혜택이 아닌 거래로 분류했습니다.'+(mixed?' 함께 언급된 할인·감면 혜택은 별도 항목으로 확인해 주세요.':'')});
    }
    if(result.category==='benefit'){
      // Voucher: a discount you can use later. Record: a waiver/free service already applied to a specific job. Permanent: ongoing perk.
      const future=/(감면|할인|우대)/u.test(name+' '+q)&&(String(result.unit||'')==='%'||/퍼센트|%|\d+\s*회|이용권|쿠폰|할인권|감면권/u.test(name+' '+q))&&!/(무상 적용|면제합니다|적용되며|적용됩니다)/u.test(q);
      result.benefitMode=result.benefitConsumed?'record':future?'voucher':result.benefitPermanent?'permanent':'record';
      result.benefitUses=Math.max(1,Math.min(99,Number.isSafeInteger(Number(result.benefitUses))?Number(result.benefitUses):1));
      result.auditNote=result.auditNote||(result.benefitMode==='voucher'?'앞으로 쓸 수 있는 할인 혜택입니다. 승인하면 이용권으로 소지품에 추가됩니다.':result.benefitMode==='permanent'?'상시 혜택입니다. 승인하면 프로필 탭의 보유 혜택으로 등록됩니다.':'이미 적용된 면제·무상 혜택입니다. 승인하면 기록만 남깁니다.');
    }
    if(['asset','contract'].includes(result.category)&&result.financialStatus==='received'){
      // Settled/closed accounts are not necessarily bank deposits.
      if(!/(입금(?:됐|되었|받았|완료| 확인)|계좌.{0,24}(입금|입금됐|들어왔)|송금(?:받|완료)|잔액.{0,20}(증가|늘어)|실제.{0,12}(수령|지급받)|(?:판매 ?대금|대금|현금|값).{0,16}(?:받았|건네받|수령했))/u.test(q)){
        result.financialStatus='receivable';result.auditNote='계좌 입금 근거가 없어 미수·정산 기록으로 보류했습니다.';
      }
    }
    // v0.3.5: the same deposit rule applies to quests and their reward candidates.
    if(result.category==='quest'){
      const deposit=/(입금(?:됐|되었|받았|완료| 확인)|계좌.{0,24}(입금|입금됐|들어왔)|송금(?:받|완료)|잔액.{0,20}(증가|늘어)|실제.{0,12}(수령|지급받)|(?:판매 ?대금|대금|현금|값).{0,16}(?:받았|건네받|수령했))/u;
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
      ...(w.gfChapterIndex||[]).map((c,i)=>({source:'챕터 '+c.chapter+' · 줄거리'+(c.cleared?' (게임 기록: 클리어)':''),text:String(c.premise||''),ch:num(c.chapter),ix:-1,order:i})),
      ...(w.gfStorySamples||[]).map((x,i)=>({source:'챕터 '+x.chapter+' · 장면 '+x.index,text:String(x.text||''),ch:num(x.chapter),ix:num(x.index),order:i,id:x.id}))
    ].filter(x=>x.text.trim());
    rows.sort((a,b)=>a.ch-b.ch||a.ix-b.ix||a.order-b.order);
    return rows.map(x=>({source:x.source,text:x.text,ch:x.ch,...(x.id?{id:x.id}:{})}));
  }
  // v0.3.9: one batch per chapter, because the game generates the story a chapter at a time.
  // A chapter too long for one call is split into consecutive parts; later parts and chapters
  // still see earlier results through the running context.
  function gfqChapterBatches(records,limit=15000){
    const batches=[];let batch=null,chars=0;
    const chapterOf=r=>String(r.source||'').match(/^챕터\s*([^·]+?)\s*·/)?.[1]||'?';
    for(const r of records){
      const item={source:r.source,text:String(r.text).slice(0,3500),...(r.id?{id:r.id}:{})},ch=chapterOf(r);
      if(!batch||batch.chapter!==ch||(batch.length&&chars+item.text.length>limit)){
        batch=[];batch.chapter=ch;batch.part=batches.filter(b=>b.chapter===ch).length+1;batches.push(batch);chars=0;
      }
      batch.push(item);chars+=item.text.length;
    }
    for(const b of batches){
      const parts=batches.filter(x=>x.chapter===b.chapter).length;
      b.label=(b.chapter==='?'?'챕터 미상':'챕터 '+b.chapter)+(parts>1?' '+b.part+'/'+parts+'부':'');
    }
    return batches;
  }
  function gfqChapterHashes(batches){
    const text=new Map();
    for(const b of batches)text.set(b.chapter,(text.get(b.chapter)||'')+b.map(t=>t.source+'\n'+t.text).join('\n'));
    const out={};
    for(const [ch,t] of text){let h=2166136261;for(let i=0;i<t.length;i++)h=Math.imul(h^t.charCodeAt(i),16777619)>>>0;out[ch]=h.toString(36)+':'+t.length;}
    return out;
  }
  function gfqParseChapterRange(input,list){
    const want=new Set(),nums=list.map(Number);
    for(const part of String(input).split(/[,\s]+/).filter(Boolean)){
      const m=part.match(/^(\d+)\s*[-~]\s*(\d+)$/);
      if(m){const a=Math.min(+m[1],+m[2]),b=Math.max(+m[1],+m[2]);list.forEach((c,i)=>{if(nums[i]>=a&&nums[i]<=b)want.add(c);});}
      else if(list.includes(part))want.add(part);
    }
    return want;
  }
  // v0.3.5: parse model output; if the reply was cut off, recover every complete event object.
  function gfqParseEvents(raw,key='events'){
    const text=String(raw||'').trim().replace(/^\x60\x60\x60(?:json)?\s*/i,'').replace(/\s*\x60\x60\x60$/,'');
    try{const v=JSON.parse(text);const ev=Array.isArray(v)?v:v?.[key];if(Array.isArray(ev))return {events:ev,partial:false,root:Array.isArray(v)?null:v};}catch{}
    const whole=text.match(/\{[\s\S]*\}/);
    if(whole){try{const v=JSON.parse(whole[0]);if(Array.isArray(v?.[key]))return {events:v[key],partial:false,root:v};}catch{}}
    const at=text.search(new RegExp('"'+key+'"\\s*:\\s*\\[')),start=at>=0?text.indexOf('[',at):text.indexOf('[');
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
    let root=null;const tl=text.match(/"timeline"\s*:\s*(\{[^{}]*\})/);if(tl){try{root={timeline:JSON.parse(tl[1])};}catch{}}
    return events.length?{events,partial:true,root}:null;
  }
  // v0.3.5: one validation path shared by AI analysis and JSON import.
  function gfqBuildProposal(x,evidence,ctx=GFQ_GENERIC){
    const safe=gfqSafeProposal({...x,evidence},ctx);
    return {id:uid(),category:safe.category,name:String(safe.name).slice(0,100),status:safe.status,evidence:String(evidence).slice(0,600),
      ...(safe.category!==x.category?{originalCategory:x.category}:{}),
      questTitle:String(x.questTitle||'').slice(0,90),questObjective:String(x.questObjective||'').slice(0,350),questRewards:Array.isArray(x.questRewards)?x.questRewards.slice(0,8):[],
      source:String(x.source||'').slice(0,120),amount:typeof safe.amount==='number'&&Number.isFinite(safe.amount)?safe.amount:null,
      unit:String(safe.unit||'').slice(0,30),owner:String(x.owner||'unknown'),eventKind:String(x.eventKind||''),
      financialStatus:safe.financialStatus,auditNote:safe.auditNote||'',...(typeof safe.value==='number'?{value:safe.value}:{}),
      ...(safe.category==='benefit'?{benefitUses:safe.benefitUses||1,benefitMode:safe.benefitMode||'record',benefitPermanent:safe.benefitMode==='permanent',benefitConsumed:safe.benefitMode==='record'}:{}),
      ...(Array.isArray(x.soldItems)&&x.soldItems.length&&['received','receivable','pending'].includes(safe.financialStatus)?{soldItems:x.soldItems.slice(0,5).filter(v=>v&&typeof v.name==='string'&&v.name.trim()).map(v=>({name:v.name.trim().slice(0,80),qty:Number.isSafeInteger(Number(v.qty))&&Number(v.qty)>0?Math.min(999,Number(v.qty)):1}))}:{}),
      ...(Array.isArray(x.purchasedItems)&&x.purchasedItems.length&&safe.financialStatus==='paid'?{purchasedItems:x.purchasedItems.slice(0,5).filter(v=>v&&typeof v.name==='string'&&v.name.trim()).map(v=>({name:v.name.trim().slice(0,80),qty:Number.isSafeInteger(Number(v.qty))&&Number(v.qty)>0?Math.min(999,Number(v.qty)):1,received:v.received!==false}))}:{}),
      transactionId:String(x.transactionId||'').slice(0,100),timing:String(x.timing||'').slice(0,80),linkTo:String(x.linkTo||'').slice(0,12)};
  }
  // Returns {proposal} or {reason} so callers can report why candidates were dropped.
  function gfqScreenEvent(x,texts,ctx=GFQ_GENERIC){
    if(!x||typeof x!=='object')return {reason:'format'};
    if(typeof x.name!=='string'||!x.name.trim()||typeof x.evidence!=='string'||x.evidence.trim().length<8)return {reason:'format'};
    if(!gfqEventEligible(x,ctx)||!['completed','active','confirmed','uncertain'].includes(x.status))return {reason:'filtered'};
    const evidence=gfqLocateEvidence(x.evidence.trim(),texts);
    if(!evidence)return {reason:'evidence'};
    const p=gfqBuildProposal(x,evidence,ctx);
    // v0.3.12: a number the AI wrote must actually be in the quoted text (e.g. 900,000원 when the text says 950,000원).
    if(p.category==='quest'){p.amount=null;p.unit='';}
    else if(typeof p.amount==='number'&&['원','%'].includes(p.unit)&&!gfqAmountsIn(evidence).has(p.amount)){
      p.auditNote=[p.auditNote,'AI가 제시한 금액 '+gfqAmount(p.amount,p.unit)+'이(가) 원문 근거에 없어 금액을 비웠습니다.'].filter(Boolean).join(' ');p.amount=null;
    }
    // Rewards written inside a quest are kept only when their own evidence is found in this chapter's text.
    if(p.category==='quest'&&p.questRewards.length){
      p.questRewards=p.questRewards.map(r=>{
        if(!r||typeof r!=='object')return null;
        const ev=typeof r.evidence==='string'&&r.evidence.trim().length>=6?gfqLocateEvidence(r.evidence.trim(),texts):null;
        if(!ev)return null;
        const amount=typeof r.amount==='number'&&(!['원','%'].includes(String(r.unit||''))||gfqAmountsIn(ev).has(r.amount))?r.amount:null;
        return {...r,evidence:ev,amount};
      }).filter(Boolean);
    }
    return {proposal:p};
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
    category:{quest:'퀘스트',asset:'자산·거래',item:'소지품',credential:'자격·면허',contract:'계약',benefit:'혜택'},
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
    return t?{text:t.slice(0,80),anchor:String(x.source||'').slice(0,120),...(x.date?{base:x.date}:{})}:null;
  }
  const gfqTimingText=t=>t?t.text+(t.anchor?' ('+t.anchor+' 시점 기준)':''):'';
  function aiReviewHtml(w){
    const rows=Array.isArray(w.aiProposals)?w.aiProposals:[];
    return '<h3>AI 분석 결과 검토 ('+rows.length+'개)</h3>'+
      '<p class="gfq-muted">설정에서 선택한 AI 연결로 분석합니다. 원문을 확인한 후보만 승인할 수 있으며, 분석만으로 자산은 변경되지 않습니다.</p>'+gfqDiagnosticsHtml(w)+
      '<label for="gfq-ai-range">분석 범위</label><select id="gfq-ai-range"><option value="new" '+((data.aiRange||'new')==='new'?'selected':'')+'>새로 추가·변경된 챕터만</option><option value="all" '+(data.aiRange==='all'?'selected':'')+'>전체 챕터</option><option value="pick" '+(data.aiRange==='pick'?'selected':'')+'>챕터 직접 지정</option></select> '+
      '<button data-action="invoke-quest-bridge">AI 분석 실행</button> <button data-action="prepare-ai-prompt">분석 지침 복사</button> <button data-action="import-ai-result">AI 분석 JSON 가져오기</button>'+
      (rows.length?'<div class="gfq-row"><button data-action="select-all-ai">전체 선택</button><button data-action="unselect-all-ai">선택 해제</button><button data-action="approve-selected-ai">선택 승인</button><button data-action="delete-selected-ai">선택 삭제</button><button data-action="delete-all-ai" class="gfq-danger">전체 삭제</button></div>':'')+
      (rows.map(x=>'<div class="gfq-card"><div class="gfq-row"><input type="checkbox" class="gfq-ai-check" aria-label="분석 후보 선택" value="'+esc(x.id)+'" style="width:17px;height:17px;flex:none"><b class="gfq-fill">'+esc(gfqLabel('category',x.category))+' · '+esc(x.name)+'</b><small>'+esc(gfqLabel('status',x.status))+(x.category==='quest'?'':' · '+esc(gfqLabel('money',x.financialStatus)))+'</small></div><p>'+esc(x.evidence)+'</p><div class="gfq-muted">수량·금액: '+esc(gfqAmount(x.amount,x.unit))+' · 출처: '+esc(x.source||'미확인')+'</div>'+(gfqTiming(x)?'<div class="gfq-muted">'+(x.category==='quest'?'기한·시점':'지급·수령 시점')+': '+esc(gfqTimingText(gfqTiming(x)))+(gfqResolveTiming(w,gfqTiming(x))?' → '+esc(gfqResolveTiming(w,gfqTiming(x))):'')+'</div>':'')+(x.value?'<div class="gfq-muted">물품 가치: '+esc(gfqAmount(x.value,'원'))+' (현금 아님)</div>':'')+gfqClearedHint(w,x)+(x.date?'<div class="gfq-muted">세계관 날짜: '+esc(x.date)+(x.endDate&&x.endDate!==x.date?' ~ '+esc(x.endDate):'')+'</div>':'')+gfqProposalLinkExtra(x)+(x.deferred?'<div class="gfq-muted"><b>장면 도달 대기</b> · 해당 대사가 나오면 자동으로 반영합니다. 지금 반영하려면 [확인 후 반영]을 눌러 주세요.</div>':'')+(x.category==='quest'?'<div class="gfq-muted">목표: '+esc(gfqQuestPresentation(gfqSafeProposal(x,gfqRuleCtx(w))).objective)+'</div>'+gfqProposalQuestExtra(w,x)+'<div class="gfq-muted">보상 후보: '+esc(gfqQuestPresentation(gfqSafeProposal(x,gfqRuleCtx(w))).rewardList.map(gfqRewardText).join(' · '))+'</div>':'')+(x.auditNote?'<p class="gfq-muted">검토 주의: '+esc(x.auditNote)+'</p>':'')+'<div class="gfq-row"><button data-action="approve-ai-proposal" data-id="'+esc(x.id)+'">확인 후 반영</button><button data-action="remove-ai-proposal" data-id="'+esc(x.id)+'">제외</button></div></div>').join('')||'<p class="gfq-muted">검토 대기 중인 AI 분석 결과가 없습니다.</p>');
  }
  // v0.3.13: deterministic safety net for missed payments. Every story sentence that states a won amount
  // together with a payment cue is checked against candidates, quest rewards and the ledger.
  const GFQ_PAY_CUE=/(수당|보수|급여|기본급|정산|지급|입금|송금|대금|상금|사례금|보상금|지원금|일당|용역비|받으|받았|드립니다|보장)/u;
  function gfqSumTotals(amounts){
    const out=new Set(),list=amounts.filter(n=>Number.isFinite(n)&&n>0).slice(0,10);
    for(const t of list){
      const rest=list.filter(n=>n<t);
      for(let mask=1;mask<(1<<rest.length);mask++){const sub=rest.filter((_,i)=>mask&(1<<i));if(sub.length>=2&&sub.reduce((a,b)=>a+b,0)===t){out.add(t);break;}}
    }
    return out;
  }
  function gfqMissingMoney(w){
    const covered=new Set(),texts=[];
    const addAmounts=t=>{for(const n of gfqAmountsIn(t))covered.add(n);};
    for(const p of (w.aiProposals||[])){if(typeof p.amount==='number')covered.add(p.amount);if(typeof p.value==='number')covered.add(p.value);addAmounts(p.evidence);for(const r of (p.questRewards||[])){if(typeof r.amount==='number')covered.add(r.amount);addAmounts(r.name);}}
    for(const t of (w.gfLedger||[])){if(typeof t.amount==='number')covered.add(t.amount);for(const h of (t.history||[]))addAmounts(h.evidence);}
    for(const q of (w.quests||[]))for(const r of (q.rewardDetails||[]))if(typeof r.amount==='number')covered.add(r.amount);
    for(const k of (w.aiAcceptedKeys||[]))addAmounts(k);
    for(const i of (w.items||[]))if(typeof i.value==='number')covered.add(i.value);
    for(const d of (w.gfMoneyDismissed||[]))covered.add(d);
    const out=[],seen=new Set();
    for(const rec of gfqStoryRecords(w)){
      for(const sentence of rec.text.split(/(?<=[.!?。])\s+|\n+/u)){
        if(!GFQ_PAY_CUE.test(sentence))continue;
        const found=[...sentence.matchAll(/(\d[\d,]*(?:\.\d+)?)\s*(억|만|천)?\s*원(?!\s*상당)/gu)].map(m=>Number(m[1].replace(/,/g,''))*(m[2]==='억'?1e8:m[2]==='만'?1e4:m[2]==='천'?1e3:1));
        // v0.4.3: a running total (1,200,000 + 1,300,000 + 1,400,000 = 3,900,000) is a recap, not a payment.
        const totals=gfqSumTotals(found);
        for(const n of found){
          if(!Number.isFinite(n)||n<=0||covered.has(n)||seen.has(n)||totals.has(n))continue;
          seen.add(n);out.push({amount:n,source:rec.source,sentence:sentence.trim().slice(0,300),recap:/(전날|어제|지난|앞서|이전|이미|에 이어|까지 더하면|누적|합계|모두 합)/u.test(sentence)});
          if(out.length>=30)return out;
        }
      }
    }
    return out;
  }
  function gfqMissingMoneyHtml(w){
    const list=w.gfMissingMoney||[];
    if(!list.length)return '';
    return '<div class="gfq-card"><b>누락 의심 금액 ('+list.length+'개)</b><p class="gfq-muted">원문에 지급 관련 금액이 있지만 검토 후보·퀘스트 보상·거래 내역 어디에도 없는 문장입니다. AI 분석이 빠뜨렸을 수 있습니다. 상태를 직접 정해 후보로 추가하거나, 지급과 무관하면 무시해 주세요.</p>'+
      list.map((m,i)=>'<div class="gfq-muted"><b>'+esc(gfqAmount(m.amount,'원'))+'</b> · '+esc(m.source)+(m.recap?' · 지난 지급을 되짚는 문장':'')+'<br>'+esc(m.sentence)+'</div><div class="gfq-row">'+((w.gfLedger||[]).some(t=>t.amount===null)?btn('금액 미확인 거래에 채우기','money-fill-ledger','data-idx="'+i+'"'):'')+btn('후보로 추가','money-to-candidate','data-idx="'+i+'"')+btn('무시','money-dismiss','data-idx="'+i+'"')+'</div>').join('')+
      '<div class="gfq-row">'+btn('누락 금액 다시 검사','money-rescan')+'</div></div>';
  }
  function gfqDiagnosticsHtml(w){
    const a=w.gfLastAnalysis,ev=w.gfEvicted&&Object.entries(w.gfEvicted);
    const parts=[];
    if(a)parts.push('<div class="gfq-muted">최근 분석 ('+esc(a.at)+'): '+esc(gfqAnalysisSummary(a)).replace(/\n/g,'<br>')+'</div>');
    if(ev&&ev.length)parts.push('<div class="gfq-muted">보관 한도(장면 180개)를 넘어 삭제된 오래된 장면: '+ev.map(([c,n])=>'챕터 '+esc(c)+' '+n+'개').join(', ')+'. 이 장면에 있던 거래는 분석 대상에 포함되지 않습니다.</div>');
    if(Array.isArray(w.gfAutoLog)&&w.gfAutoLog.length)parts.push('<details><summary class="gfq-muted">최근 자동 분석 기록 ('+w.gfAutoLog.length+')</summary>'+w.gfAutoLog.slice().reverse().map(l=>'<div class="gfq-muted">'+esc(l.at)+' · 챕터 '+esc(l.chapters.join(', '))+' · 새 장면 '+l.scenes+'개('+l.chars+'자) · '+esc(l.result)+'</div>').join('')+'</details>');
    if(w.gfUndo)parts.push('<div class="gfq-row">'+btn('마지막 자동 반영 되돌리기 ('+w.gfUndo.count+'개 · '+esc(w.gfUndo.at)+')','undo-auto')+'</div>');
    return (parts.length?'<div class="gfq-card">'+parts.join('')+'</div>':'')+gfqMissingMoneyHtml(w);
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
        first.questSteps=group.length>1?group.map(x=>x.questObjective||x.name).filter(Boolean).slice(0,6):[];
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
  // v0.3.15: quests with sub-goals show sub-goal progress; plain quests keep the count-based progress.
  function gfqQuestDatesHtml(q){
    return q.startDate||q.doneDate?'<div class="gfq-muted">세계관 날짜: '+[q.startDate?'시작 '+esc(q.startDate):'',q.doneDate?'완료 '+esc(q.doneDate):''].filter(Boolean).join(' · ')+'</div>':'';
  }
  function gfqQuestProgressHtml(q){
    const steps=Array.isArray(q.steps)?q.steps.length:0;
    if(steps){
      const done=q.steps.filter((_,i)=>q.stepDone?.[i]===true).length;
      return '<progress value="'+done+'" max="'+steps+'"></progress><div class="gfq-row"><span class="gfq-fill">세부 목표 '+done+' / '+steps+(q.claimed?' · 완료':'')+'</span>';
    }
    return '<progress value="'+Math.max(0,Math.min(q.progress,q.target))+'" max="'+q.target+'"></progress><div class="gfq-row"><span class="gfq-fill">'+q.progress+' / '+q.target+(q.claimed?' · 완료':'')+'</span>';
  }
  function gfqStepLine(steps,done){
    return steps.map((t,i)=>(done[i]?'✓ ':'○ ')+t).join(' · ');
  }
  function gfqProposalQuestExtra(w,x){
    const parts=[];
    if(x.updateOf){const q=(w.quests||[]).find(v=>v.id===x.updateOf);parts.push(q?'기존 퀘스트 갱신: '+q.title:'갱신 대상 퀘스트를 찾지 못해 새 퀘스트로 등록됩니다');}
    if(x.mergedCount>1)parts.push('통합된 후보 '+x.mergedCount+'개');
    const p=gfqQuestPresentation(x);
    if(p.steps.length)parts.push('세부 목표: '+gfqStepLine(p.steps,p.stepDone));
    return parts.map(t=>'<div class="gfq-muted">'+esc(t)+'</div>').join('');
  }
  // v0.3.7: apply a consolidated candidate to an existing quest instead of creating a duplicate.
  function gfqUpdateQuest(w,q,x,quest){
    const key=t=>gfqNormMap(t).out;
    q.steps=Array.isArray(q.steps)?q.steps:[];
    q.stepDone=q.steps.map((_,i)=>Array.isArray(q.stepDone)&&q.stepDone[i]===true);
    quest.steps.forEach((text,i)=>{
      const at=q.steps.findIndex(t=>key(t)===key(text));
      if(at<0){q.steps.push(text);q.stepDone.push(quest.stepDone[i]);}
      else if(quest.stepDone[i])q.stepDone[at]=true;
    });
    q.steps=q.steps.slice(0,12);q.stepDone=q.stepDone.slice(0,12);
    q.rewardDetails=Array.isArray(q.rewardDetails)?q.rewardDetails:[];
    for(const r of quest.rewardList){
      if(r.kind==='reputation'&&r.certainty==='suggested'&&!r.assessed)continue;
      if(r.kind==='reputation'&&q.rewardDetails.some(v=>v.kind==='reputation'&&(v.assessed||q.reputationAwarded)))continue;
      if(!q.rewardDetails.some(v=>v.name===r.name&&(v.amount??null)===(r.amount??null)))q.rewardDetails.push(r);
    }
    // A confirmed reward replaces the default reputation suggestion that has not been paid yet.
    if(!q.reputationAwarded&&q.rewardDetails.some(r=>r.kind!=='reputation'))q.rewardDetails=q.rewardDetails.filter(r=>!(r.kind==='reputation'&&r.certainty==='suggested'&&!r.assessed));
    if(!q.rewardDetails.length)q.rewardDetails=quest.rewardList;
    q.reward=q.rewardDetails.map(r=>r.name).join(' · ');
    if(!String(q.detail||'').trim())q.detail=quest.objective;
    q.sourceEvidence=[q.sourceEvidence,x.evidence].flat().filter(Boolean).slice(-12);
    let note='퀘스트 갱신: '+q.title;
    if(x.status==='completed'&&!q.claimed){q.claimed=true;q.progress=q.target;if(x.endDate||x.date)q.doneDate=x.endDate||x.date;note+=' → 완료';gfqAwardQuestReputation(w,q);}
    record(w,note+' · '+x.evidence);
  }
  function gfqDedupeRewards(list){
    const out=[];
    for(const r of list){
      const money=r.kind==='money'&&typeof r.amount==='number';
      const twin=money&&out.find(v=>v.kind==='money'&&v.amount===r.amount&&String(v.unit||'')===String(r.unit||''));
      if(twin){if(!twin.chainKey&&r.chainKey)out[out.indexOf(twin)]=r;continue;}
      const nk=t=>gfqNormMap(t).out;
      if(!money&&out.some(v=>v.kind===r.kind&&(v.name===r.name||(r.evidence&&v.evidence&&nk(v.evidence)===nk(r.evidence))||(nk(v.name).length>=6&&nk(r.name).length>=6&&(nk(v.name).includes(nk(r.name))||nk(r.name).includes(nk(v.name)))))))continue;
      out.push(r);
    }
    // Amounts that add up exactly to another listed amount are its breakdown (e.g. 950,000 + 450,000 = 1,400,000).
    const money=out.filter(r=>r.kind==='money'&&typeof r.amount==='number'&&r.amount>0),drop=new Set();
    for(const total of [...money].sort((a,b)=>b.amount-a.amount)){
      if(drop.has(total))continue;
      const rest=money.filter(r=>r!==total&&!drop.has(r)&&r.amount<total.amount&&String(r.unit||'')===String(total.unit||'')).slice(0,10);
      for(let mask=1;mask<(1<<rest.length);mask++){const sub=rest.filter((_,i)=>mask&(1<<i));if(sub.length>=2&&sub.reduce((s,r)=>s+r.amount,0)===total.amount){sub.forEach(r=>drop.add(r));break;}}
    }
    return out.filter(r=>!drop.has(r));
  }
  function gfqRewardText(r){
    const shown=r.amount!==null&&r.amount!==undefined&&!(r.kind!=='reputation'&&gfqAmountsIn(r.name).has(r.amount));
    const amt=shown?' '+(r.kind==='reputation'?'+':'')+Number(r.amount).toLocaleString('ko-KR')+(r.unit?(r.kind==='reputation'?'':' ')+r.unit:''):'';
    const why=r.kind==='reputation'&&r.assessed&&r.evidence?' — '+String(r.evidence).replace(/^확장 명성 규칙 제안:?\s*/,''):'';
    return r.name+amt+' ('+(r.kind==='benefit'&&r.certainty==='received'?'적용됨':gfqLabel('certainty',r.certainty))+')'+why;
  }
  function gfqQuestPresentation(x){
    const raw=String(x.name||'').trim(),quote=String(x.evidence||''),source=String(x.source||'');
    const title=String(x.questTitle||raw).trim().slice(0,90);
    const objective=String(x.questObjective||x.objective||'').trim().slice(0,350)||
      (quote?('목표: '+quote.slice(0,230)):'목표 세부 정보 확인 필요');
    const rewardCandidates=Array.isArray(x.questRewards)?x.questRewards:[];
    const haveMoney=rewardCandidates.some(r=>r?.kind==='money'&&r.amount!==null&&r.amount!==undefined);
    // The default +1 filler never sits next to a money reward; an assessed reputation (v0.3.11) may.
    let activeRewards=haveMoney?rewardCandidates.filter(r=>r.kind!=='reputation'||r.assessed):rewardCandidates;
    const reps=activeRewards.filter(r=>r?.kind==='reputation');
    if(reps.length>1){const keep=reps.reduce((a,b)=>(b.assessed&&!a.assessed)||((b.assessed===a.assessed)&&(b.amount||1)>(a.amount||1))?b:a);activeRewards=activeRewards.filter(r=>r.kind!=='reputation'||r===keep);}
    const rewardList=gfqDedupeRewards(activeRewards.filter(r=>r&&typeof r.name==='string'&&r.name.trim())).slice(0,8).map(r=>({
      name:String(r.name).slice(0,100),
      kind:['money','item','credential','reputation','benefit','other'].includes(r.kind)?r.kind:'other',
      certainty:['received','confirmed','pending','suggested','uncertain'].includes(r.certainty)?r.certainty:'uncertain',
      amount:typeof r.amount==='number'&&Number.isFinite(r.amount)?r.amount:null,
      unit:String(r.unit||'').slice(0,24),
      evidence:String(r.evidence||'').slice(0,500),
      ...(r.chainKey?{chainKey:String(r.chainKey).slice(0,40)}:{}),
      ...(r.assessed?{assessed:true}:{})
    }));
    if(!rewardList.length)rewardList.push({name:'명성 상승',kind:'reputation',certainty:'suggested',amount:1,unit:'점',evidence:'원문에서 확정된 보상을 찾지 못해 제안한 비금전 보상입니다.'});
    let steps=Array.isArray(x.questSteps)?x.questSteps.map(v=>String(v)).filter(Boolean):[];
    // A single step that just repeats the objective is not a sub-goal.
    if(steps.length===1)steps=[];
    const stepDone=steps.map((_,i)=>Array.isArray(x.questStepDone)&&x.questStepDone[i]===true);
    return {title,objective,rewardList,source,steps,stepDone};
  }
  function gfqAwardQuestReputation(w,q){
    if(q.reputationAwarded)return false;
    const rewards=Array.isArray(q.rewardDetails)?q.rewardDetails:[];
    if(!rewards.some(r=>r.kind==='reputation'))return false;
    const field=w.fields.find(x=>x.name==='명성');
    if(field && (!/^\d+$/.test(String(field.value).trim())||String(field.unit||'')&&!['점',''].includes(String(field.unit)))){
      record(w,'명성 보상 반영 보류: 기존 명성 필드 형식을 확인해 주세요. 퀘스트 '+q.title);return false;
    }
    const reward=rewards.find(r=>r.kind==='reputation');
    const n=Math.max(1,Math.min(5,Math.round(Number(reward?.amount)||1)));
    if(field)field.value=String(Number(field.value)+n);
    else w.fields.push({id:uid(),name:'명성',value:String(n),unit:'점'});
    q.reputationAwarded=true;
    if(reward){reward.amount=n;reward.unit='점';reward.certainty='received';}
    record(w,'퀘스트 명성 보상 지급: '+q.title+' / 명성 +'+n+'점'+(reward?.assessed&&reward.evidence?' ('+reward.evidence+')':''));
    return true;
  }
  function gfqQuestRewardLabel(x){
    const labels={received:'수령 확인',confirmed:'확정',pending:'지급 예정',suggested:'제안·미지급',uncertain:'미확인'};
    const entries=Array.isArray(x.rewardDetails)&&x.rewardDetails.length?x.rewardDetails:null;
    const ledger=current()?.gfLedger||[],items=current()?.items||[];
    if(entries)return entries.map(r=>{
      const tx=r.txId&&ledger.find(t=>t.id===r.txId);
      const item=r.kind==='item'&&r.chainKey&&items.find(i=>i.chainKey===r.chainKey||i.id===r.chainKey);
      const voucher=r.kind==='benefit'&&r.chainKey&&items.find(i=>i.kind==='voucher'&&i.chainKey===r.chainKey);
      const state=tx?gfqLabel('money',tx.state)+' · 거래 내역 연결':r.kind==='benefit'&&r.certainty==='received'&&!voucher?'적용됨':voucher?(voucher.qty>0?'이용권 보유 ×'+voucher.qty:'사용 완료'):item?(item.state==='pending'?'수령 예정':'보유'):labels[r.certainty]||'미확인';
      return r.name+(r.amount!==null&&r.amount!==undefined?' '+(r.kind==='reputation'?'+':'')+Number(r.amount).toLocaleString('ko-KR')+String(r.unit||''):'')+' ['+state+']'+(r.kind==='reputation'&&r.assessed&&r.evidence?' — '+r.evidence.replace(/^확장 명성 규칙 제안:?\s*/,''):'');}).join(' · ');
    return x.reward||'보상 미기록';
  }
  function aiAnalysisPrompt(w, records, contextText){
    const ctx=gfqRuleCtx(w),hero=ctx.hero?'주인공 '+ctx.hero:'주인공(플레이어 캐릭터)';
    const today=gfqCurrentDate(w);
    if(today)contextText=('[세계관 날짜] '+today.date+' ('+today.basis+(today.source?' · '+today.source:'')+')')+(contextText?'\n'+contextText:'');
    const input=(records||gfqStoryRecords(w)).map(x=>'['+x.source+']\n'+x.text).join('\n\n');
    return [
      '한국어 RPG 세계의 사건과 금전 출납부를 분석합니다. 입력에 없는 사실과 금액은 절대 추정하지 않습니다. 줄거리 출처에 \'게임 기록: 클리어\'가 있으면 그 챕터의 임무가 게임에서 마무리됐다는 참고 정보입니다.',
      '반환 JSON: {"timeline":{"currentDate":"분석 대상 마지막 장면 시점의 세계관 날짜 YYYY-MM-DD, 원문에 날짜가 적혀 있을 때만","dateEvidence":"그 날짜가 적힌 원문 인용","daysPassed":"[세계관 날짜] 이후 마지막 장면까지 지난 날 수(원문에 다음 날·이틀 뒤처럼 적힌 경우만) 또는 null","daysEvidence":"날이 바뀐 원문 인용"},"events":[{"category":"quest|asset|item|credential|contract|benefit","name":"한국어 제목","status":"completed|active|confirmed|uncertain","financialStatus":"received|paid|pending|receivable|waived|ownership|not_applicable|uncertain","evidence":"원문에서 그대로 복사한 짧은 연속 문자열","source":"챕터/장면","amount":숫자 또는 null,"unit":"원|%|개 등","transactionId":"동일 계약 또는 정산 사건을 나타내는 간결한 문자열","linkTo":"이전 맥락 목록의 ID(t1, i2 등) 또는 빈 문자열","benefitUses":"혜택일 때 사용 가능 횟수(명시 없으면 1) 또는 null","benefitPermanent":false,"benefitConsumed":false,"purchasedItems":[{"name":"구매한 물품","qty":1,"received":true}],"soldItems":[{"name":"판매한 물품","qty":1}],"timing":"지급·수령·완료 시점을 나타내는 원문 표현 그대로(예: 내일 이 시간, 임무 완료 시, 금일 오후 6시) 또는 빈 문자열","owner":"player|npc|organization|unknown","eventKind":"task|payment|expense|discount|property|item_transfer|credential|contract","questTitle":"퀘스트형 간결한 제목","questObjective":"목표와 완료 조건을 자연스러운 문장으로 요약","questRewards":[{"name":"보상 명칭","kind":"money|item|credential|reputation|benefit|other","certainty":"received|confirmed|pending|suggested|uncertain","amount":null,"unit":"","evidence":"원문 인용 또는 빈 문자열"}]}]}',
      '반드시 화폐 단위가 있는 모든 입금/이체/정산/수당/보수/급여/보상/지급 완료 서술을 빠짐없이 검사합니다. 완료된 입금은 financialStatus=received, 돈을 지출했으면 paid, 약속한 미래 지급이면 pending, 받을 권리가 확정됐으나 미입금이면 receivable, 면제는 waived, 지분은 ownership으로 분류합니다.',
      '거래의 지급 의사나 보장만으로 실제 입금(received)으로 처리하지 않습니다. 금액을 확정했지만 입금 문장이 없으면 received를 쓰지 않습니다. 총액과 그 구성 수당은 같은 transactionId를 사용하고 각각 중복 수입으로 합산하지 않습니다.',
      'name은 반드시 한국어로 씁니다. 수당·보수·기본급·정산금처럼 돈으로 받는 것은 혜택(benefit)이 아니라 category=asset입니다.',
      '총액이 명시된 지급은 총액 1건만 출력하고, 기본 수당·위험 수당 같은 구성 내역은 따로 출력하지 않고 name에 괄호로 적습니다. 총액이 없으면 각 금액을 출력합니다. amount에는 원문에 적힌 숫자만 씁니다.',
      '할인·감면·면제·우선 이용·무료 서비스 같은 혜택은 category=benefit입니다. 앞으로 쓸 수 있으면 benefitUses(명시 없으면 1), 기한 없이 계속 적용되면 benefitPermanent=true, 이미 특정 거래에 적용되어 끝났으면 benefitConsumed=true입니다. amount에는 할인율(%)이나 면제 금액을 넣습니다.',
      '돈을 내고 물건을 산 구매는 category=asset, financialStatus=paid, eventKind=expense로 출력하고 purchasedItems에 산 물품과 수량을 넣습니다. 주문만 하고 아직 받지 않았으면 received=false입니다. 물건이 없는 지출(숙박비, 수수료 등)은 purchasedItems를 빈 배열로 둡니다.',
      '원문에 날짜만 적힌 줄(예: 2033-04-09)은 그 아래 장면의 날짜 표시입니다. 확장이 이 표시로 날짜를 직접 정하므로, 날짜 표시가 있으면 currentDate는 마지막 날짜 표시와 같게 씁니다.',
      'timeline에는 원문에 적힌 날짜와 날짜 변화만 넣습니다. 날짜가 적힌 문서·면허·통지 등이 오늘 발급·작성된 것이 분명할 때만 그 날짜를 currentDate로 씁니다. 과거·미래의 다른 날을 가리키는 날짜는 쓰지 않습니다. 근거가 없으면 빈 문자열과 null로 둡니다.',
      '지난 지급을 되짚는 문장(예: 전날 A 1,200,000원과 오늘 B 1,300,000원에 이어 이번 금액까지 합계 3,900,000원)은 새 수입이 아닙니다. 각 과거 지급은 이전 맥락에 같은 항목이 있으면 linkTo로 연결하고 원문 금액을 amount에 넣어 금액을 보완합니다. 이전 맥락에 없으면 별도 항목으로 출력하되, 합계 금액은 출력하지 않습니다.',
      '물건을 팔고 대금을 받은 판매는 category=asset, eventKind=payment로 출력하고 soldItems에 판 물품과 수량을 넣습니다. 대금을 실제로 받았으면 received, 받기로만 했으면 receivable 또는 pending입니다.',
      'N원 상당의 물품·장비·세트는 돈이 아닙니다. category=item으로 출력하고, 아직 받지 않았으면 financialStatus=pending, amount=null로 둡니다. 받을 돈(receivable)으로 처리하지 않습니다.',
      'timing에는 지급·수령·완료가 실제로 일어나는 시점이나 기한만 넣습니다. \'중도 철수 시\'처럼 일어나지 않을 수도 있는 가정 조건은 넣지 않습니다.',
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
      ...(contextText?['[이전 맥락] 앞선 장면에서 이미 확인된 약속·거래·수령 예정 물품입니다.\n'+contextText,
        '분석 대상의 사건이 이전 맥락 항목의 후속(지급 실행, 입금, 지출, 물품 수령, 조건 충족)이면 그 ID를 linkTo에 넣고 같은 금액·단위를 씁니다. 같은 지급을 새 수입으로 따로 만들지 않습니다. 금액이 다르거나 다른 약속이면 linkTo를 비웁니다. 이전 맥락은 판단 참고용이며, evidence는 반드시 분석 대상 원문에서 복사합니다.']:[]),
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
  // v0.3.8: running context so later scenes can be tied to earlier promises, payments and deliveries.
  const GFQ_RANK={pending:0,receivable:1,received:2};
  const gfqChainOf=t=>(Array.isArray(t.chainKeys)&&t.chainKeys[0])||t.id;
  function gfqContextItems(w,pool){
    const items=[],seen=new Set();
    const add=it=>{if(seen.has(it.chainKey))return;seen.add(it.chainKey);items.push(it);};
    for(const t of (w.gfLedger||[]))add({kind:'ledger',ref:t.id,chainKey:gfqChainOf(t),category:'money',name:t.name,amount:t.amount,unit:t.unit,state:t.state,timing:t.timing||null,source:t.history?.[0]?.source||'',open:!['received','paid','waived'].includes(t.state)});
    for(const i of (w.items||[]))if(i.state==='pending')add({kind:'item',ref:i.id,chainKey:i.chainKey||i.id,category:'item',name:i.name,amount:null,unit:'',state:'pending',timing:i.timing||null,source:'',open:true});
    for(const p of pool){
      if(p.role==='component')continue;
      if(gfqMoney(p))add({kind:'proposal',ref:p.id,chainKey:p.chainKey||p.id,category:'money',name:p.name,amount:p.amount,unit:p.unit,state:p.financialStatus,timing:gfqTiming(p),source:p.source,open:!['received','paid','waived'].includes(p.financialStatus)});
      else if(p.category==='item'&&p.financialStatus==='pending')add({kind:'proposal',ref:p.id,chainKey:p.chainKey||p.id,category:'item',name:p.name,amount:null,unit:'',state:'pending',timing:gfqTiming(p),source:p.source,open:true});
    }
    // Open entries first; the list is capped so each batch prompt grows by ~2,000 characters at most.
    const ordered=[...items.filter(x=>x.open),...items.filter(x=>!x.open)];
    const map=new Map(),lines=[];let chars=0,n=0;
    for(const it of ordered){
      const k=(it.category==='item'?'i':'t')+(++n);
      const line='['+k+'] '+(it.category==='item'?'물품':'거래')+' · '+it.name+(it.category==='money'?' · '+gfqAmount(it.amount,it.unit):'')+' · '+gfqLabel('money',it.state)+(it.timing?' · 시점: '+gfqTimingText(it.timing):(it.source?' · '+it.source:''));
      if(chars+line.length>2000)break;
      map.set(k,it);lines.push(line);chars+=line.length+1;
    }
    return {map,text:lines.join('\n')};
  }
  // Validates an AI-proposed link; returns 'ok', '' (no link) or a rejection reason.
  function gfqResolveLink(p,ctxMap){
    const raw=String(p.linkTo||'').trim();delete p.linkTo;
    if(!raw)return '';
    const it=ctxMap&&ctxMap.get(raw);
    if(!it)return 'unknown';
    const money=gfqMoney(p),item=p.category==='item';
    if(it.category==='money'?!money:!item)return 'category';
    if(money){
      if(typeof p.amount==='number'&&typeof it.amount==='number'&&p.amount!==it.amount)return 'amount';
      if(p.unit&&it.unit&&p.unit!==it.unit)return 'unit';
      const a=GFQ_RANK[it.state],b=GFQ_RANK[p.financialStatus];
      if(!(p.financialStatus===it.state||(a!==undefined&&b!==undefined&&b>=a)||(it.state==='pending'&&p.financialStatus==='paid')))return 'state';
      if(p.amount===null&&typeof it.amount==='number'){p.amount=it.amount;if(!p.unit)p.unit=it.unit;p.auditNote=[p.auditNote,'금액은 연결된 이전 기록에서 가져왔습니다.'].filter(Boolean).join(' ');}
    }
    p.chainKey=it.chainKey;p.linkInfo={kind:it.kind,name:it.name,from:it.state};
    return 'ok';
  }
  const GFQ_LINK_REASON={unknown:'없는 맥락 ID',category:'유형 불일치',amount:'금액 불일치',unit:'단위 불일치',state:'상태 역행'};
  function gfqApplyLink(p,ctxMap,stats){
    const r=gfqResolveLink(p,ctxMap);
    if(r==='ok'){stats.linked=(stats.linked||0)+1;return;}
    if(!r)return;
    stats.linkRejected=(stats.linkRejected||0)+1;
    p.auditNote=[p.auditNote,'이전 기록 연결 제안을 거부했습니다('+(GFQ_LINK_REASON[r]||r)+'). 별개 항목으로 검토해 주세요.'].filter(Boolean).join(' ');
  }
  // Generic version of the 950,000 + 450,000 = 1,400,000 rule: within one contract or scene,
  // amounts that add up exactly to another amount are its breakdown, not extra income.
  function gfqMarkComponents(list){
    const money=list.filter(p=>gfqMoney(p)&&typeof p.amount==='number'&&p.amount>0&&!p.role);
    const passes=[p=>String(p.transactionId||'').trim()?'tx:'+String(p.transactionId).trim()+'|'+p.unit:null,p=>p.source?'src:'+p.source+'|'+p.unit:null];
    let marked=0;
    for(const keyOf of passes){
      const groups=new Map();
      for(const p of money){if(p.role)continue;const k=keyOf(p);if(!k)continue;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(p);}
      for(const g of groups.values()){
        if(g.length<3)continue;
        for(const total of [...g].sort((a,b)=>b.amount-a.amount)){
          if(total.role)continue;
          const rest=g.filter(p=>p!==total&&!p.role&&p.amount<total.amount).slice(0,10);
          let pick=null;
          for(let mask=1;mask<(1<<rest.length)&&!pick;mask++){
            const sub=rest.filter((_,i)=>mask&(1<<i));
            if(sub.length>=2&&sub.reduce((s,p)=>s+p.amount,0)===total.amount)pick=sub;
          }
          if(!pick)continue;
          total.role='total';total.componentNote='구성: '+pick.map(p=>p.name+' '+gfqAmount(p.amount,p.unit)).join(' + ');
          for(const c of pick){c.role='component';c.componentOf=total.id;c.chainKey=total.chainKey||total.id;c.auditNote='총액 '+gfqAmount(total.amount,total.unit)+'('+total.name+')의 구성 금액입니다. 별도 수입으로 기록하지 않습니다.';marked++;}
        }
      }
    }
    return marked;
  }
  // v0.3.10: the game's own chapter-cleared flag is shown as a hint; it never changes a status by itself.
  function gfqClearedHint(w,x){
    if(x.category!=='quest'||x.status==='completed')return '';
    const chs=[...String(x.source||'').matchAll(/챕터\s*([^\s·/]+)/gu)].map(m=>m[1]);
    const cleared=chs.length&&chs.every(c=>(w.gfChapterIndex||[]).some(v=>String(v.chapter)===c&&v.cleared));
    return cleared?'<div class="gfq-muted">참고: 게임 기록상 이 챕터는 클리어 상태입니다. 퀘스트 완료 여부를 확인해 주세요.</div>':'';
  }
  function gfqProposalLinkExtra(x){
    const parts=[];
    if(x.linkInfo)parts.push('이전 기록 연결: '+x.linkInfo.name+' ('+gfqLabel('money',x.linkInfo.from)+' → '+(x.category==='item'?(x.financialStatus==='pending'?'수령 예정':'수령'):gfqLabel('money',x.financialStatus))+')');
    if(x.role==='total'&&x.componentNote)parts.push(x.componentNote);
    if(x.role==='component')parts.push('구성 금액 · 승인해도 거래 내역에 별도 수입으로 기록하지 않습니다');
    if(x.category==='benefit')parts.push(x.benefitMode==='record'?'이미 적용된 혜택 · 승인하면 기록만 남깁니다':x.benefitMode==='permanent'?'상시 혜택 · 승인하면 프로필 탭에 \'보유 혜택\'으로 등록됩니다':'승인하면 소지품에 이용권 ×'+(x.benefitUses||1)+'로 추가됩니다');
    if(Array.isArray(x.soldItems)&&x.soldItems.length)parts.push('판매 물품: '+x.soldItems.map(v=>v.name+' ×'+v.qty).join(', ')+' · 승인하면 소지품에서 차감합니다');
    if(Array.isArray(x.purchasedItems)&&x.purchasedItems.length)parts.push('구매 물품: '+x.purchasedItems.map(v=>v.name+' ×'+v.qty+(v.received?'':' (수령 예정)')).join(', '));
    return parts.map(t=>'<div class="gfq-muted">'+esc(t)+'</div>').join('');
  }
  // v0.3.7: shared call into the engine's existing AI connection.
  async function gfqGenerate(host,connectionId,runId,system,user,maxTokens,signal){
    const opts={method:'POST',credentials:'same-origin',cache:'no-store',signal,
      headers:{'content-type':'application/json','x-marinara-csrf':'1'},
      body:JSON.stringify({connectionId,runId,streaming:false,
        messages:[{role:'system',content:system},{role:'user',content:user}],
        parameters:{maxTokens,temperature:0.1}})
    };
    const response=typeof host.apiFetch==='function'?await host.apiFetch('generate/raw',opts):
      typeof host.fetch==='function'?await host.fetch('/api/generate/raw',opts):await fetch('/api/generate/raw',opts);
    const body=await response.json().catch(()=>null);
    if(!response.ok)throw Error(String(body?.error||body?.message||('HTTP '+response.status)));
    return questModelText(body);
  }
  // v0.3.7: generic quest consolidation. The AI only proposes groupings by short ID;
  // the code validates every ID and never invents evidence, so a bad reply cannot corrupt data.
  function gfqConsolidationInput(w,pool){
    const cands=pool.filter(p=>p.category==='quest').slice(0,80);
    const open=(w.quests||[]).filter(q=>!q.claimed),done=(w.quests||[]).filter(q=>q.claimed);
    const quests=[...done.slice(-15),...open.slice(-25)];
    const candMap=new Map(),questMap=new Map();
    const candidates=cands.map((p,i)=>{const k='c'+(i+1);candMap.set(k,p.id);return {id:k,title:String(p.questTitle||p.name||'').slice(0,90),objective:String(p.questObjective||'').slice(0,220),status:p.status,source:p.source,evidence:String(p.evidence||'').slice(0,160)};});
    const existing=quests.map((q,i)=>{const k='e'+(i+1);questMap.set(k,q.id);return {id:k,title:String(q.title||'').slice(0,90),objective:String(q.detail||'').slice(0,220),steps:(q.steps||[]).slice(0,8),status:q.claimed?'completed':'active'};});
    // v0.3.10: money, item and credential candidates can be assigned to a mission as its rewards.
    const rewardMap=new Map();
    const rewards=pool.filter(p=>p.category!=='quest'&&p.role!=='component'&&gfqRewardFromProposal(p)).slice(0,40).map((p,i)=>{const k='r'+(i+1);rewardMap.set(k,p.id);return {id:k,kind:gfqLabel('category',p.category),name:String(p.name||'').slice(0,80),amount:gfqAmount(p.amount,p.unit),state:gfqLabel('money',p.financialStatus),source:p.source,evidence:String(p.evidence||'').slice(0,120)};});
    return {candidates,existing,candMap,questMap,rewards,rewardMap};
  }
  function gfqRewardFromProposal(p){
    const amount=typeof p.amount==='number'?p.amount:null,base={name:String(p.name||'').slice(0,100),amount,unit:String(p.unit||''),evidence:String(p.evidence||'').slice(0,500),chainKey:p.chainKey||p.id};
    if(gfqMoney(p)){
      if(p.financialStatus==='paid')return null;
      if(p.financialStatus==='waived')return {...base,kind:'benefit',certainty:'confirmed'};
      return {...base,kind:'money',certainty:{received:'received',receivable:'confirmed',pending:'pending',ownership:'confirmed'}[p.financialStatus]||'uncertain'};
    }
    if(p.category==='item')return {...base,amount:null,unit:'',kind:'item',certainty:p.financialStatus==='pending'?'pending':'confirmed'};
    if(p.category==='credential')return {...base,amount:null,unit:'',kind:'credential',certainty:['completed','confirmed'].includes(p.status)?'received':'pending'};
    if(p.category==='benefit')return {...base,kind:'benefit',certainty:p.benefitMode==='record'?'received':'confirmed'};
    return null;
  }
  function gfqConsolidationPrompt(input,hero){
    return [
      'RPG 퀘스트 기록을 정리합니다. \'새 퀘스트 후보\'와 \'등록된 퀘스트\'를 보고 같은 임무를 하나로 묶습니다.',
      '- 하나의 의뢰·작전·용역에 속한 조사, 이동, 전투, 보고, 정산 같은 세부 행동은 한 그룹으로 묶고 steps로 정리합니다.',
      '- 의뢰인·장소·목적이 다른 임무는 묶지 않습니다. 확신이 없으면 묶지 않습니다.',
      '- 새 후보가 등록된 퀘스트의 이어지는 장면(진행·완료)이면 existingQuestId에 그 퀘스트 ID(e로 시작)를 넣습니다.',
      '- 모든 새 후보 ID(c로 시작)는 정확히 한 그룹에만 넣습니다. 묶을 대상이 없는 후보도 단독 그룹으로 출력합니다.',
      '- title은 게임 의뢰처럼 간결한 한국어 제목, objective는 장소·행동·완료 조건을 담은 한 문장입니다.',
      '- steps는 시간순 2~6개입니다. done은 후보 내용으로 완료가 확인된 단계만 true입니다.',
      '- status는 후보 중 완료가 확인될 때만 completed, 아니면 active입니다.',
      '- \'보상 후보\' 중 그 임무의 대가로 받는 수당·보수·물품·자격이 있으면 ID(r로 시작)를 rewardIds에 넣습니다. 임무와 무관한 거래, 다른 임무의 보상은 넣지 않습니다. 확신이 없으면 넣지 않습니다.',
      '- reputation은 이 확장의 명성 규칙에 따른 제안입니다. 임무의 규모와 공적을 보고 amount를 정합니다: 1 소규모 의뢰, 2 다수의 인명·시설을 지킨 주목할 공적, 3 협회·길드 차원에서 인정받을 공적, 4 도시 단위 위기 해결, 5 세계관 전체에 알려질 업적. reason에는 근거가 된 공적을 한 문장으로 적습니다. 공적이 불분명하면 1입니다.',
      '- 후보와 등록된 퀘스트에 없는 사건이나 보상을 만들지 않습니다. 주인공: '+(hero||'플레이어 캐릭터')+'.',
      '반환 JSON만 출력: {"groups":[{"memberIds":["c1"],"existingQuestId":"","rewardIds":[],"reputation":{"amount":1,"reason":""},"title":"","objective":"","steps":[{"text":"","done":false}],"status":"active"}]}',
      '[새 퀘스트 후보]\n'+JSON.stringify(input.candidates),
      '[등록된 퀘스트]\n'+JSON.stringify(input.existing),
      '[보상 후보]\n'+JSON.stringify(input.rewards||[])
    ].join('\n\n');
  }
  function gfqApplyConsolidation(pool,groups,candMap,questMap,rewardMap=new Map()){
    const byId=new Map(pool.filter(p=>p.category==='quest').map(p=>[p.id,p])),all=new Map(pool.map(p=>[p.id,p])),rewardUsed=new Set();let rewardLinks=0;
    const clean=(v,n)=>String(v||'').replace(/\s+/g,' ').trim().slice(0,n);
    const used=new Set(),firstOf=new Map();let mergedGroups=0,updates=0;
    for(const g of (Array.isArray(groups)?groups:[]).slice(0,80)){
      if(!g||typeof g!=='object')continue;
      const members=[...new Set((Array.isArray(g.memberIds)?g.memberIds:[]).map(v=>candMap.get(String(v))))].filter(id=>id&&byId.has(id)&&!used.has(id));
      if(!members.length)continue;
      const existing=questMap.get(String(g.existingQuestId||''))||'';
      // Each reward candidate belongs to at most one mission.
      const linkedRewards=[...new Set((Array.isArray(g.rewardIds)?g.rewardIds:[]).map(v=>rewardMap.get(String(v))))].filter(id=>id&&all.has(id)&&!rewardUsed.has(id)).map(id=>{rewardUsed.add(id);return gfqRewardFromProposal(all.get(id));}).filter(Boolean);
      // v0.3.11: assessed reputation (1-5 with a reason) is a proposal of this extension's own rule.
      const repN=Number(g.reputation?.amount),repReason=clean(g.reputation?.reason,120);
      if(Number.isFinite(repN)&&repN>=1)linkedRewards.push({name:'명성 상승',kind:'reputation',certainty:'suggested',amount:Math.max(1,Math.min(5,Math.round(repN))),unit:'점',assessed:true,evidence:'확장 명성 규칙 제안'+(repReason?': '+repReason:'')});
      if(members.length===1&&!existing&&!linkedRewards.length)continue; // nothing to merge: keep the original candidate untouched
      const ms=members.map(id=>byId.get(id));members.forEach(id=>used.add(id));
      const base=ms.find(p=>Array.isArray(p.questRewards)&&p.questRewards.length)||ms[0];
      const title=clean(g.title,90)||base.questTitle||base.name;
      const steps=(Array.isArray(g.steps)?g.steps:[]).slice(0,8).map(v=>typeof v==='string'?{text:v,done:false}:{text:v?.text,done:v?.done===true}).map(v=>({text:clean(v.text,80),done:v.done})).filter(v=>v.text);
      const anyDone=ms.some(p=>p.status==='completed'),allDone=ms.every(p=>p.status==='completed');
      const rewards=[...linkedRewards],seen=new Set(linkedRewards.map(r=>r.name+'|'+(r.amount??'')));
      rewardLinks+=linkedRewards.filter(r=>r.kind!=='reputation').length;
      // Rewards the extraction already wrote on the quest are dropped when a linked candidate has the same amount.
      for(const r of ms.flatMap(p=>Array.isArray(p.questRewards)?p.questRewards:[])){if(!r)continue;const k=String(r.name||'')+'|'+(r.amount??'');if(seen.has(k)||(typeof r.amount==='number'&&linkedRewards.some(v=>v.amount===r.amount&&v.unit===String(r.unit||''))))continue;seen.add(k);rewards.push(r);}
      const evidence=[...new Set(ms.flatMap(p=>Array.isArray(p.sourceEvidence)&&p.sourceEvidence.length?p.sourceEvidence:[p.evidence]).filter(Boolean))].slice(0,12);
      const merged={...base,id:uid(),name:title,questTitle:title,questObjective:clean(g.objective,350)||base.questObjective||'',
        questSteps:steps.map(v=>v.text),questStepDone:steps.map(v=>v.done),
        // Completion needs every member completed, or the AI's verdict backed by all listed steps being done.
        status:allDone||(g.status==='completed'&&anyDone&&steps.length>0&&steps.every(v=>v.done))?'completed':'active',
        questRewards:[...rewards.filter(r=>r.kind!=='reputation'),...rewards.filter(r=>r.kind==='reputation')].slice(0,8),sourceEvidence:evidence,
        source:[...new Set(ms.map(p=>p.source).filter(Boolean))].join(' / ').slice(0,120),
        mergedCount:ms.length,updateOf:existing};
      firstOf.set(members[0],merged);
      if(ms.length>1)mergedGroups++;if(existing)updates++;
    }
    const list=[];
    for(const p of pool){if(!used.has(p.id)){list.push(p);continue;}const m=firstOf.get(p.id);if(m)list.push(m);}
    return {list,mergedGroups,updates,absorbed:used.size,rewardLinks};
  }
  async function gfqConsolidateQuests(w,pool,host,connectionId,runId,signal){
    const input=gfqConsolidationInput(w,pool);
    if(!input.candidates.length||(input.candidates.length<2&&!input.existing.length&&!input.rewards.length))return {list:pool,skipped:true};
    const raw=await gfqGenerate(host,connectionId,runId,'Group RPG quest candidates into missions. Return only JSON.',gfqConsolidationPrompt(input,gfqRuleCtx(w).hero),3000,signal);
    const parsed=gfqParseEvents(raw,'groups');
    if(!parsed)throw Error('통합 응답에서 JSON을 찾지 못했습니다');
    return gfqApplyConsolidation(pool,parsed.events,input.candMap,input.questMap,input.rewardMap);
  }
  function gfqConsolidationSummary(c){
    if(!c||c.skipped)return '';
    if(c.error)return '퀘스트 통합: 실패해 개별 후보로 유지했습니다 ('+c.error+')';
    return '퀘스트 통합: 후보 '+c.absorbed+'개를 정리했습니다 (묶음 '+c.mergedGroups+'개, 기존 퀘스트 갱신 '+c.updates+'개, 보상 연결 '+(c.rewardLinks||0)+'개)';
  }
  // v0.4.0: the analysis core is shared by the manual button and the automatic triggers.
  let gfqBusy=false;
  async function invokeQuestBridge(){
    const w=current();if(!w)return;
    if(gfqBusy)return alert('분석이 이미 진행 중입니다. 끝난 뒤 다시 시도해 주세요.');
    const connectionId=String(data.aiConnectionId||'').trim();
    if(!connectionId)return alert('설정에서 분석용 AI 연결을 먼저 선택해 주세요.');
    const allRecords=gfqStoryRecords(w);
    if(!allRecords.length)return alert('분석할 스토리 기록이 없습니다.');
    const allBatches=gfqChapterBatches(allRecords),hashes=gfqChapterHashes(allBatches);
    // v0.3.11: analysis range. 'new' re-analyses only chapters that are new or changed since their last successful analysis.
    const mode=data.aiRange||'new';let chosen=allBatches;
    if(mode==='new'){
      chosen=allBatches.filter(b=>(w.gfAnalyzed||{})[b.chapter]!==hashes[b.chapter]);
      if(!chosen.length)return alert('새로 추가되거나 바뀐 챕터가 없습니다. 이미 분석한 챕터를 다시 보려면 분석 범위를 \'전체\' 또는 \'챕터 지정\'으로 바꿔 주세요.');
    }else if(mode==='pick'){
      const list=[...new Set(allBatches.map(b=>b.chapter))];
      const ans=ask('분석할 챕터를 입력해 주세요. (예: 4 또는 2-4)\n저장된 챕터: '+list.join(', '),list[list.length-1]||'');
      if(ans===null)return;
      const want=gfqParseChapterRange(ans,list);
      if(!want.size)return alert('입력한 범위에 해당하는 저장된 챕터가 없습니다.');
      chosen=allBatches.filter(b=>want.has(b.chapter));
    }
    const chapterCount=new Set(chosen.map(b=>b.chapter)).size,recordCount=chosen.reduce((n,b)=>n+b.length,0);
    if(!confirm((mode==='new'?'새로 추가·변경된 ':'')+'챕터 '+chapterCount+'개('+[...new Set(chosen.map(b=>b.chapter))].join(', ')+')의 스토리 '+recordCount+'개를 '+chosen.length+'회 나눠 분석하시겠습니까? 챕터마다 AI를 호출합니다.'+(data.autoApply?'\n\n자동 반영이 켜져 있어, 검증을 통과한 결과는 바로 반영됩니다.':'')))return;
    const r=await gfqRunAnalysis(data.world,chosen,hashes,{auto:false});
    if(r.error)return alert('AI 분석에 실패했습니다: '+r.error);
    alert('AI 분석이 완료되었습니다. '+r.found+'개의 새 후보를 찾았습니다.'+(r.applied?'\n자동 반영 '+r.applied+'개 · 검토 필요 '+r.left+'개':'')+'\n\n'+gfqAnalysisSummary(r.world.gfLastAnalysis));
  }
  async function gfqRunAnalysis(worldKey,batches,hashes,opts={}){
    const w=data.worlds[worldKey];
    if(!w)return {error:'월드를 찾지 못했습니다.'};
    if(gfqBusy)return {error:'분석이 이미 진행 중입니다.'};
    const connectionId=String(data.aiConnectionId||'').trim();
    if(!connectionId)return {error:'AI 연결이 선택되지 않았습니다.'};
    gfqBusy=true;
    const requestRun='gfq-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9);
    const host=typeof marinara==='object'&&marinara?marinara:globalThis.marinara||{};
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),Math.min(1800000,120000*Math.max(1,batches.length)));
    const stats={format:0,filtered:0,evidence:0,duplicate:0};
    const failures=[];let partialBatches=0,processed=0;const chapterFailed=new Set();
    try{
      const known=gfqKnownKeys(w);
      const eventsToAdd=[];
      const dateMap=gfqDateMap(w),headed=gfqHeadingDates(dateMap);
      w.gfDates={...(w.gfDates||{}),...headed};
      for(let batchIndex=0;batchIndex<batches.length;batchIndex++){
        if(controller.signal.aborted){batches.slice(batchIndex).forEach(b=>chapterFailed.add(b.chapter));failures.push(batches.slice(batchIndex).map(b=>b.label).join(', ')+': 제한 시간 초과로 실행하지 않았습니다');break;}
        const linkCtx=gfqContextItems(w,[...(w.aiProposals||[]),...eventsToAdd]);
        const segment=batches[batchIndex],promptText=aiAnalysisPrompt(w,segment,linkCtx.text),label=segment.label+' ('+(batchIndex+1)+'/'+batches.length+'회차)';
        // v0.3.5: one failed batch no longer discards the results of the others.
        try{
          const text=await gfqGenerate(host,connectionId,requestRun+'-'+batchIndex,'Extract exhaustive story events and all actual or promised financial transactions. Return only a JSON object with events array.',promptText,4000,controller.signal);
          const parsed=gfqParseEvents(text);
          if(!parsed)throw Error('AI 응답에서 JSON 사건 목록을 찾지 못했습니다');
          if(parsed.partial)partialBatches++;
          const before=eventsToAdd.length;
          const tl=gfqTimelineFrom(parsed.root?.timeline,segment.map(t=>t.text),gfqCurrentDate(w)?.date||null);
          if(tl&&segment.chapter&&segment.chapter!=='?'&&!headed[segment.chapter]){w.gfDates||={};w.gfDates[segment.chapter]={...tl,source:segment.label};stats.dated=(stats.dated||0)+1;}
          gfqCollectEvents(parsed.events.slice(0,75),segment.map(t=>t.text),w,known,eventsToAdd,stats);
          for(const p of eventsToAdd.slice(before))gfqApplyLink(p,linkCtx.map,stats);
          processed++;
        }catch(e){
          chapterFailed.add(segment.chapter);
          if(controller.signal.aborted)failures.push(label+': 제한 시간 초과');
          else failures.push(label+': '+String(e?.message||e));
        }
      }
      if(data.worlds[worldKey]!==w)throw Error('분석 중 월드 데이터가 바뀌어 결과를 적용하지 않았습니다.');
      if(!processed)throw Error('모든 회차의 분석에 실패했습니다.\n'+failures.slice(0,6).join('\n'));
      const merged=gfqIntegrateQuests(eventsToAdd,gfqRuleCtx(w));
      stats.components=gfqMarkComponents(merged);
      let pool=[...(w.aiProposals||[]),...merged],consolidation=null;
      try{consolidation=await gfqConsolidateQuests(w,pool,host,connectionId,requestRun+'-q',controller.signal);pool=consolidation.list;}
      catch(e){consolidation={error:controller.signal.aborted?'제한 시간 초과':String(e?.message||e)};}
      if(data.worlds[worldKey]!==w)throw Error('분석 중 월드 데이터가 바뀌어 결과를 적용하지 않았습니다.');
      const before=new Set((w.aiProposals||[]).map(p=>p.id));
      for(const p of pool)if(!before.has(p.id))gfqStampDates(dateMap,p);
      w.aiProposals=pool;
      w.gfMissingMoney=gfqMissingMoney(w);
      const done=[...new Set(batches.map(b=>b.chapter))].filter(ch=>!chapterFailed.has(ch));
      w.gfAnalyzed||={};for(const ch of done)if(hashes[ch])w.gfAnalyzed[ch]=hashes[ch];
      // v0.4.0: remember which scenes were analysed so scene-mode only sends new ones.
      const seen=new Set(w.gfSeenScenes||[]);for(const b of batches)if(!chapterFailed.has(b.chapter))for(const t of b)if(t.id)seen.add(t.id);
      w.gfSeenScenes=[...seen].slice(-2000);
      w.gfLastAnalysis={at:now(),auto:!!opts.auto,missing:w.gfMissingMoney.length,chapters:done,batches:batches.length,processed,partial:partialBatches,failures:failures.slice(0,12),added:merged.length,consolidation:gfqConsolidationSummary(consolidation),...stats};
      let applied=0,left=w.aiProposals.length,events=[];
      if(data.autoApply){
        const fresh=pool.filter(p=>!before.has(p.id));
        if(data.sceneTimed!==false&&w===current()){
          // v0.4.2: hold validated results until their line is on screen; chapters already behind the reader apply now.
          const vn=gfqVNState(gameRoot),behind=p=>vn&&vn.chapter&&gfqChapterOfSource(p.source)&&Number(gfqChapterOfSource(p.source))<Number(vn.chapter);
          const now_=fresh.filter(p=>gfqAutoEligible(p)&&behind(p)),later=fresh.filter(p=>gfqAutoEligible(p)&&!behind(p));
          for(const p of later)p.deferred=true;
          const r=gfqAutoApply(w,now_.map(p=>p.id));applied=r.applied;events=r.events;
          w.gfLastAnalysis.deferred=later.length;left=(w.aiProposals||[]).filter(p=>!p.deferred).length;
        }else{const r=gfqAutoApply(w,fresh.map(p=>p.id));applied=r.applied;left=r.left;events=r.events;}
        w.gfLastAnalysis.autoApplied=applied;
      }
      save();if(panel)render();
      gfqNotifyChanges(events,{found:merged.length,applied,left,auto:!!opts.auto,missing:w.gfMissingMoney.length,deferred:w.gfLastAnalysis.deferred||0});
      sceneKey='';gfqSceneTick();
      return {world:w,found:merged.length,applied,left};
    }catch(e){
      return {error:String(e?.message||e)};
    }finally{clearTimeout(timer);gfqBusy=false;}
  }
  // v0.4.0: automatic application. Only candidates that passed every check are applied; anything the
  // checks flagged stays in the review list. The state right before is kept for a one-step undo.
  const GFQ_REVIEW_NOTES=/(원문 근거에 없어|연결 제안을 거부|별도 항목으로 확인|누락 의심 금액에서)/u;
  function gfqAutoEligible(p){
    if(!p||p.status==='uncertain'||p.financialStatus==='uncertain')return false;
    return !GFQ_REVIEW_NOTES.test(String(p.auditNote||''));
  }
  function gfqAutoApply(w,ids){
    const pending=()=>(w.aiProposals||[]).length;
    if(w!==current())return {applied:0,left:pending(),events:[]};
    const want=new Set(ids),list=(w.aiProposals||[]).filter(p=>want.has(p.id)&&gfqAutoEligible(p));
    if(!list.length)return {applied:0,left:pending(),events:[]};
    const snap=JSON.stringify({quests:w.quests,fields:w.fields,items:w.items,gfLedger:w.gfLedger||[],aiProposals:w.aiProposals||[],aiAcceptedKeys:w.aiAcceptedKeys||[],history:w.history});
    const before=new Map((w.quests||[]).map(q=>[q.id,{claimed:!!q.claimed,done:(q.steps||[]).map((_,i)=>q.stepDone?.[i]===true),rep:!!q.reputationAwarded}]));
    // Money, items and benefits first so quest rewards can link to them; quests last.
    const ordered=[...list.filter(p=>p.category!=='quest'),...list.filter(p=>p.category==='quest')];
    const events=[];let applied=0;
    for(const p of ordered){
      const count=(w.quests||[]).length;
      if(!approveAiProposal(p.id,true))continue;
      applied++;events.push(...gfqEventsFor(w,p,before,count));
    }
    if(applied){w.gfUndo={at:now(),count:applied,snap};record(w,'자동 반영: '+applied+'개 항목 (기록 탭에서 되돌릴 수 있습니다)');}
    return {applied,left:pending(),events};
  }
  function gfqEventsFor(w,p,before,questCount){
    const ev=[];
    if(p.category==='quest'){
      const q=p.updateOf?(w.quests||[]).find(v=>v.id===p.updateOf):((w.quests||[]).length>questCount?w.quests[w.quests.length-1]:null);
      if(!q)return ev;
      const b=before.get(q.id);
      if(!b)ev.push({kind:'quest',title:q.claimed?'퀘스트 완료':'새 퀘스트',text:q.title});
      else{
        (q.steps||[]).forEach((t,i)=>{if(q.stepDone?.[i]===true&&!b.done[i])ev.push({kind:'step',title:'목표 달성',text:q.title+' · '+t});});
        if(q.claimed&&!b.claimed)ev.push({kind:'quest',title:'퀘스트 완료',text:q.title});
      }
      if(q.reputationAwarded&&!(b&&b.rep)){const r=(q.rewardDetails||[]).find(v=>v.kind==='reputation');if(r)ev.push({kind:'rep',title:'명성 상승',text:'+'+(r.amount||1)+'점 · '+q.title});}
    }else if(gfqMoney(p)){
      // v0.4.2: game-style money and item notices ("돈 수령 +1,400,000원", "아이템 획득 건틀릿 ×1").
      if(p.role!=='component'){
        const amt=typeof p.amount==='number'?gfqAmount(p.amount,p.unit).replace(' 원','원'):'금액 미확인';
        const t={received:['돈 수령','+'+amt],paid:['지출',(typeof p.amount==='number'?'−':'')+amt],pending:['지급 예정',amt],receivable:['받을 돈 확정',amt],waived:['비용 면제',amt],ownership:['지분 획득',amt]}[p.financialStatus]||[gfqLabel('money',p.financialStatus),amt];
        ev.push({kind:'money',title:t[0],text:t[1]+' · '+p.name});
      }
      for(const it of (p.purchasedItems||[]))ev.push({kind:'item',title:it.received?'아이템 구매':'구매 · 수령 예정',text:it.name+' ×'+it.qty});
      for(const it of (p.soldItems||[]))ev.push({kind:'item',title:'아이템 판매',text:it.name+' ×'+it.qty});
    }else if(p.category==='item'){
      const waiting=p.financialStatus==='pending'||p.status==='active';
      ev.push({kind:'item',title:waiting?'수령 예정':'아이템 획득',text:p.name+(!waiting&&typeof p.amount==='number'&&p.unit!=='원'?' ×'+p.amount:'')+(waiting&&gfqTiming(p)?' · '+gfqTiming(p).text:'')});
    }
    else if(p.category==='benefit'&&p.benefitMode==='voucher')ev.push({kind:'benefit',title:'혜택 획득',text:(/권$/.test(p.name)?p.name:p.name+'권')+' ×'+(p.benefitUses||1)});
    else if(p.category==='benefit'&&p.benefitMode==='permanent')ev.push({kind:'benefit',title:'상시 혜택',text:p.name});
    else if(p.category==='credential')ev.push({kind:'credential',title:'자격 취득',text:p.name});
    return ev;
  }
  // v0.4.0: quest notifications. A top-layer popover so they also show in fullscreen.
  let toastBox=null;
  function gfqToastHide(){if(toastBox&&!toastBox.children.length){try{toastBox.hidePopover?.();}catch{}}}
  function gfqToastBox(){
    if(!toastBox){toastBox=document.createElement('div');toastBox.id=ID+'-toasts';toastBox.setAttribute('popover','manual');document.body.append(toastBox);}
    try{if(toastBox.showPopover&&!toastBox.matches(':popover-open'))toastBox.showPopover();}catch{}
    return toastBox;
  }
  function gfqToastTrim(){const plain=[...toastBox.children].filter(e=>!e.classList.contains('gfq-toast-offer'));while(plain.length>4)plain.shift().remove();}
  // v0.4.2: a quest offer waits for the player's answer (no auto-hide).
  function gfqToastOffer(title,text,onAccept,onLater){
    if(!document.body)return;
    const box=gfqToastBox(),el=document.createElement('div');el.className='gfq-toast gfq-toast-quest gfq-toast-offer';
    el.innerHTML='<b>'+esc(title)+'</b><span>'+esc(text)+'</span><div class="gfq-offer-row"><button type="button" data-o="yes">수락</button><button type="button" data-o="later">나중에</button></div>';
    el.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;el.remove();gfqToastHide();(b.dataset.o==='yes'?onAccept:onLater)();});
    box.append(el);
  }
  function gfqToast(title,text,kind='info'){
    if(!document.body)return;
    gfqToastBox();
    const el=document.createElement('button');el.type='button';el.className='gfq-toast gfq-toast-'+kind;
    el.innerHTML='<b>'+esc(title)+'</b><span>'+esc(text)+'</span>';
    el.addEventListener('click',()=>{el.remove();gfqToastHide();currentTab=['date','money','item','benefit','credential','rep'].includes(kind)?'profile':['review','info'].includes(kind)?'history':'quests';if(!panel)openPanel();else render();});
    toastBox.append(el);gfqToastTrim();
    setTimeout(()=>{el.remove();gfqToastHide();},kind==='review'?12000:7000);
  }
  function gfqNotifyChanges(events,info){
    const shown=events.slice(0,4);
    for(const e of shown)gfqToast(e.title,e.text,e.kind);
    if(events.length>shown.length)gfqToast('그 밖의 변경','외 '+(events.length-shown.length)+'건이 반영되었습니다','info');
    if(info.deferred)gfqToast('분석 완료',info.deferred+'건은 해당 대사가 나오면 반영합니다','info');
    if(!info.auto)return;
    if(!data.autoApply&&info.found)gfqToast('새 분석 후보',info.found+'건 · 기록 탭에서 검토해 주세요','review');
    else if(data.autoApply&&info.left)gfqToast('검토 필요',info.left+'건은 자동 반영하지 않았습니다 · 기록 탭에서 확인해 주세요','review');
    if(info.missing)gfqToast('누락 의심 금액',info.missing+'개 · 기록 탭에서 확인해 주세요','review');
  }
  // v0.4.0: automatic triggers driven by observed game traffic. One pending one-shot timer at most.
  let autoTimer=0,autoAgain=false;
  function gfqAutoSchedule(key){
    if(!['chapter','scene'].includes(data.aiMode)||!String(data.aiConnectionId||'').trim()||key!==data.world)return;
    if(autoTimer)clearTimeout(autoTimer);
    autoTimer=setTimeout(()=>{autoTimer=0;gfqAutoRun(key);},6000);
  }
  async function gfqAutoRun(key){
    if(gfqBusy){autoAgain=true;return;}
    const w=data.worlds[key];if(!w||key!==data.world)return;
    const {list,hashes}=gfqAutoBatches(w,data.aiMode);
    if(!list.length)return;
    // v0.4.3: guards against back-to-back runs while the game loads scenes one by one.
    const gate=gfqAutoGate(w,list,Date.now(),data.aiMode);
    if(gate.wait){if(autoTimer)clearTimeout(autoTimer);autoTimer=setTimeout(()=>{autoTimer=0;gfqAutoRun(key);},gate.wait);return;}
    const chapters=[...new Set(list.map(b=>b.chapter))],scenes=list.reduce((n,b)=>n+b.filter(t=>t.id).length,0);
    w.gfAutoLastAt=Date.now();
    gfqToast('자동 분석','챕터 '+chapters.join(', ')+' · 새 장면 '+scenes+'개 분석을 시작합니다','info');
    const r=await gfqRunAnalysis(key,list,hashes,{auto:true});
    w.gfAutoLog=[...(w.gfAutoLog||[]),{at:now(),chapters,scenes,chars:list.reduce((n,b)=>n+b.reduce((m,t)=>m+t.text.length,0),0),result:r.error?'실패: '+r.error.slice(0,60):'완료 · 새 후보 '+r.found+'개'}].slice(-10);
    if(!r.error)w.gfAutoLastChapter=Math.max(Number(w.gfAutoLastChapter||0),...chapters.map(c=>Number(c)||0));
    if(r.error){w.gfAutoFailAt=Date.now();gfqToast('자동 분석 실패',r.error.slice(0,140),'review');}
    save();
    if(autoAgain){autoAgain=false;gfqAutoSchedule(key);}
  }
  // Pure: whether to run now or wait. Scene mode waits for a meaningful amount of new text and
  // never runs more often than every 90 s; after a failure it waits 5 minutes.
  function gfqAutoGate(w,list,nowMs,mode){
    const since=nowMs-(w.gfAutoLastAt||0),failSince=nowMs-(w.gfAutoFailAt||0);
    if(w.gfAutoFailAt&&failSince<300000)return {wait:300000-failSince};
    if(mode==='scene'){
      // A chapter newer than anything analysed so far was just generated: run now.
      if(Math.max(...list.map(b=>Number(b.chapter)||0))>Number(w.gfAutoLastChapter||0))return {wait:0};
      if(since<90000)return {wait:90000-since};
      const chars=list.reduce((n,b)=>n+b.filter(t=>t.id).reduce((m,t)=>m+t.text.length,0),0);
      const chapterAhead=list.some(b=>Number(b.chapter)<Math.max(...list.map(x=>Number(x.chapter)||0)));
      if(chars<600&&!chapterAhead&&since<600000)return {wait:Math.max(30000,90000-since)};
    }
    return {wait:0};
  }
  function gfqAutoBatches(w,mode){
    const all=gfqChapterBatches(gfqStoryRecords(w)),hashes=gfqChapterHashes(all);
    const chapters=[...new Set(all.map(b=>b.chapter))],num=c=>Number(c);
    if(mode==='chapter'){
      // A chapter is finished once a later chapter has started or the game marks it cleared/complete.
      const finished=c=>chapters.some(o=>Number.isFinite(num(o))&&Number.isFinite(num(c))&&num(o)>num(c))||
        (w.gfChapterIndex||[]).some(v=>String(v.chapter)===c&&v.cleared)||(w.gfContinuityIndex||[]).some(v=>String(v.chapter)===c&&v.complete);
      return {list:all.filter(b=>finished(b.chapter)&&(w.gfAnalyzed||{})[b.chapter]!==hashes[b.chapter]),hashes};
    }
    if(mode==='scene'){
      const seen=new Set(w.gfSeenScenes||[]),out=[];
      for(const b of all){
        const fresh=b.filter(t=>t.id?!seen.has(t.id):(w.gfAnalyzed||{})[b.chapter]===undefined);
        if(!fresh.some(t=>t.id))continue;
        Object.assign(fresh,{chapter:b.chapter,part:b.part,label:b.label});out.push(fresh);
      }
      return {list:out,hashes:{}}; // scene runs never mark a whole chapter as analysed
    }
    return {list:[],hashes};
  }
  // v0.4.2: scene-timed delivery. Results are analysed ahead of time but delivered when the matching
  // line of dialogue is on screen. The game shows one line at a time inside .vn; .vn-caption names the
  // chapter ('3챕터 · …') and .vn-count the line ('07 / 58').
  function gfqVNState(root){
    const vn=root?.querySelector('.vn');if(!vn)return null;
    const cap=root.querySelector('.vn-caption')?.textContent||'';
    const cnt=(root.querySelector('.vn-count')?.textContent||'').match(/(\d+)\s*\/\s*(\d+)/);
    return {text:vn.textContent||'',chapter:(cap.match(/(\d+)\s*챕터/u)||[])[1]||'',line:cnt?+cnt[1]:0,total:cnt?+cnt[2]:0};
  }
  function gfqVNDate(root){
    const vn=root?.querySelector('.vn');if(!vn)return null;
    for(const el of vn.querySelectorAll('*')){if(el.children.length)continue;const t=(el.textContent||'').trim();if(t.length&&t.length<=40){const d=gfqDateHeading(t);if(d)return d;}}
    return null;
  }
  const gfqChapterOfSource=s=>(String(s||'').match(/챕터\s*(\d+)/u)||[])[1]||'';
  function gfqEvidenceList(p){
    const l=[...new Set((Array.isArray(p.sourceEvidence)&&p.sourceEvidence.length?p.sourceEvidence:[p.evidence]).filter(Boolean))];
    return l.length?l:[String(p.evidence||'')];
  }
  // A line matches when it contains the quoted evidence, or the evidence's opening/closing words.
  function gfqLineHits(evidence,visibleNorm){
    const e=gfqNormMap(evidence).out;if(e.length<6)return false;
    if(visibleNorm.includes(e))return true;
    const k=Math.min(16,e.length);
    return e.length>=12&&(visibleNorm.includes(e.slice(0,k))||visibleNorm.includes(e.slice(-k)));
  }
  // Which deferred proposals the current screen reaches. Pure: returns [{p, at}] with at = evidence index or 'flush'.
  function gfqSceneHits(proposals,vn){
    const vis=gfqNormMap(vn.text).out,out=[];
    for(const p of proposals){
      if(!p.deferred)continue;
      const ch=gfqChapterOfSource(p.source);
      if(vn.chapter&&ch&&Number(ch)<Number(vn.chapter)){out.push({p,at:'flush'});continue;}
      if(vn.total&&vn.line>=vn.total&&ch&&ch===vn.chapter){out.push({p,at:'flush'});continue;}
      const list=gfqEvidenceList(p);
      for(let i=p.stage||0;i<list.length;i++)if(gfqLineHits(list[i],vis)){out.push({p,at:i});break;}
    }
    return out;
  }
  function gfqDeliver(w,p,at,events){
    const list=gfqEvidenceList(p),last=list.length-1;
    if(p.category!=='quest'){
      p.deferred=false;const count=(w.quests||[]).length;
      if(approveAiProposal(p.id,true))events.push(...gfqEventsFor(w,p,new Map(),count));
      return;
    }
    const target=(w.quests||[]).find(q=>q.id===(p.updateOf||p.acceptedQuestId));
    if(!target){
      if(at==='flush'){p.deferred=false;const count=(w.quests||[]).length;if(approveAiProposal(p.id,true))events.push(...gfqEventsFor(w,p,new Map(),count));return;}
      if(p.offered)return;
      p.offered=true;
      const pres=gfqQuestPresentation(gfqSafeProposal(p,gfqRuleCtx(w)));
      gfqToastOffer('새 퀘스트',pres.title+(pres.objective?' — '+pres.objective:''),()=>gfqAcceptQuest(p.id,at),()=>gfqLaterQuest(p.id));
      return;
    }
    const before=new Map([[target.id,{claimed:!!target.claimed,done:(target.steps||[]).map((_,k)=>target.stepDone?.[k]===true),rep:!!target.reputationAwarded}]]);
    if(at==='flush'||at>=last){
      p.updateOf=target.id;p.deferred=false;
      if(approveAiProposal(p.id,true))events.push(...gfqEventsFor(w,p,before,(w.quests||[]).length));
      return;
    }
    // An intermediate evidence line completes the next unfinished sub-goal.
    target.stepDone=(target.steps||[]).map((_,k)=>target.stepDone?.[k]===true);
    const k=target.stepDone.indexOf(false);
    if(k>=0){target.stepDone[k]=true;record(w,'세부 목표 달성: '+target.title+' · '+target.steps[k]);events.push({kind:'step',title:'목표 달성',text:target.title+' · '+target.steps[k]});}
    p.stage=at+1;
  }
  function gfqAcceptQuest(id,at){
    const w=current(),p=w?.aiProposals?.find(v=>v.id===id);if(!p)return;
    const events=[];
    if(gfqEvidenceList(p).length<=1){
      p.deferred=false;const count=(w.quests||[]).length;
      if(approveAiProposal(p.id,true))events.push(...gfqEventsFor(w,p,new Map(),count));
    }else{
      // Accepted now, completed by later lines: start with every sub-goal open.
      const pres=gfqQuestPresentation(gfqSafeProposal(p,gfqRuleCtx(w)));
      const q={id:uid(),...(p.date?{startDate:p.date}:{}),title:pres.title,type:'의뢰',detail:pres.objective,target:1,progress:0,reward:pres.rewardList.map(r=>r.name).join(' · '),rewardDetails:pres.rewardList,claimed:false,sourceEvidence:p.evidence,source:p.source,steps:pres.steps,stepDone:pres.steps.map(()=>false),rewardTransactionId:''};
      w.quests.push(q);p.acceptedQuestId=q.id;p.stage=(typeof at==='number'?at:0)+1;
      record(w,'퀘스트 수락: '+q.title);gfqRelinkQuestRewards(w);
      events.push({kind:'quest',title:'퀘스트 수락',text:q.title});
    }
    save();if(panel)render();for(const e of events)gfqToast(e.title,e.text,e.kind);
  }
  function gfqLaterQuest(id){
    const w=current(),p=w?.aiProposals?.find(v=>v.id===id);if(!p)return;
    p.deferred=false;save();if(panel)render();
    gfqToast('검토 목록으로 이동',(p.questTitle||p.name)+' · 기록 탭에서 언제든 반영할 수 있습니다','review');
  }
  let sceneKey='',sceneRecheck=0;
  function gfqDateTick(w,vn){
    const d=gfqVNDate(gameRoot);if(!d)return;
    const prev=gfqCurrentDate(w)?.date||null;
    if(w.gfReadingDate?.date===d)return;
    w.gfReadingDate={date:d,chapter:vn.chapter,ms:Date.now(),at:now()};
    const gap=prev?gfqDayDiff(prev,d):null;
    record(w,'세계관 날짜 변경: '+(prev?prev+' → ':'')+d+' (챕터 '+vn.chapter+' 날짜 줄)');
    save();if(panel&&currentTab==='profile')render();
    gfqToast('날짜 변경',d+' ('+gfqWeekday(d)+')'+(gap===1?' · 하루가 지났습니다':gap>1?' · '+gap+'일이 지났습니다':''),'date');
  }
  let lineKey='';
  function gfqSceneTick(settled=false){
    const w=current();if(!w)return;
    const vn=gfqVNState(gameRoot);if(!vn)return;
    // Typewriter text may still be appearing: look once more shortly after a new line starts.
    const lk=vn.chapter+'|'+vn.line;
    if(lk!==lineKey){lineKey=lk;if(sceneRecheck)clearTimeout(sceneRecheck);sceneRecheck=setTimeout(()=>{sceneRecheck=0;sceneKey='';gfqSceneTick(true);},1200);}
    // v0.4.6: the in-world date follows the date lines the reader reaches (read only once the line has settled).
    if(settled)gfqDateTick(w,vn);
    if(!data.autoApply||data.sceneTimed===false||!(w.aiProposals||[]).some(p=>p.deferred))return;
    const key=vn.chapter+'|'+vn.line+'|'+vn.text.length;if(key===sceneKey)return;
    sceneKey=key;
    const hits=gfqSceneHits(w.aiProposals,vn);if(!hits.length)return;
    const snap=JSON.stringify({quests:w.quests,fields:w.fields,items:w.items,gfLedger:w.gfLedger||[],aiProposals:w.aiProposals||[],aiAcceptedKeys:w.aiAcceptedKeys||[],history:w.history});
    // Money, items and benefits before quests so rewards can link.
    const events=[];hits.sort((a,b)=>(a.p.category==='quest')-(b.p.category==='quest'));
    for(const h of hits)gfqDeliver(w,h.p,h.at,events);
    if(events.length){w.gfUndo={at:now(),count:events.length,snap};}
    save();if(panel)render();
    for(const e of events.slice(0,4))gfqToast(e.title,e.text,e.kind);
  }
  // v0.5.0: story injection through a Marinara lorebook. Gacha Forge re-reads the world lorebooks for every
  // scene it narrates (when 'lorebooks feed story scenes' is on) and always includes constant entries, so
  // keeping one constant entry current puts the quest status into the next scene's prompt.
  function gfqInjectText(w,limit=600){
    const lines=[],ledger=w.gfLedger||[],items=w.items||[],fields=w.fields||[];
    const head='[퀘스트 현황 · 퀘스트 확장 자동 기록] '+(String(w.protagonist||'').trim()||'주인공')+'의 확정된 진행 상태입니다. 이야기와 어긋나지 않게 이어 가되, 여기에 없는 지급·획득·완료를 새로 만들지 마세요.';
    const won=(n,u)=>typeof n==='number'?gfqAmount(n,u).replace(' 원','원'):'금액 미확인';
    const date=gfqCurrentDate(w);if(date)lines.push(['날짜',date.date+' ('+gfqWeekday(date.date)+')']);
    const open=(w.quests||[]).filter(q=>!q.claimed).slice(-4).reverse();
    for(const q of open){const k=(q.steps||[]).findIndex((_,i)=>q.stepDone?.[i]!==true);lines.push(['진행 중',q.title+(k>=0?' — 다음 목표: '+q.steps[k]:'')]);}
    for(const t of ledger.filter(t=>['pending','receivable'].includes(t.state)).slice(-6))lines.push(['받을 돈',t.name+' '+won(t.amount,t.unit)+(t.state==='pending'?' (지급 예정'+(t.timing?.text?' · '+t.timing.text:'')+')':' (확정·미입금)')]);
    for(const i of items.filter(i=>i.state==='pending').slice(-5)){const d=gfqResolveTiming(w,i.timing);lines.push(['수령 예정',i.name+(d?' ('+d+')':i.timing?.text?' ('+i.timing.text+')':'')]);}
    for(const i of items.filter(i=>i.kind==='voucher'&&i.qty>0).slice(-5))lines.push(['이용권',i.name+' ×'+i.qty]);
    for(const t of ledger.filter(t=>['received','paid'].includes(t.state)).slice(-3).reverse()){const h=(t.history||[]).slice().reverse().find(h=>h.state===t.state);lines.push([t.state==='received'?'최근 입금':'최근 지출',t.name+' '+won(t.amount,t.unit)+(h?.date?' ('+h.date+')':'')]);}
    for(const f of fields.filter(f=>/^보유 (자격|혜택) · /.test(f.name)).slice(0,5))lines.push([f.name.startsWith('보유 자격')?'보유 자격':'보유 혜택',f.name.replace(/^보유 (자격|혜택) · /,'')+(f.value&&!['취득','적용 중'].includes(f.value)?' ('+f.value+')':'')]);
    const rep=fields.find(f=>f.name==='명성');if(rep)lines.push(['명성',rep.value+(rep.unit||'')]);
    for(const q of (w.quests||[]).filter(q=>q.claimed).slice(-3).reverse())lines.push(['완료',q.title+(q.doneDate?' ('+q.doneDate+')':'')]);
    for(const i of items.filter(i=>i.state!=='pending'&&i.kind!=='voucher'&&i.qty>0).slice(-8))lines.push(['소지품',i.name+' ×'+i.qty]);
    // Group by label in priority order, then trim whole items from the end to fit the limit.
    let out=head;const max=Math.max(150,Number(limit)||600);
    for(const [label,text] of lines){
      const seg=out.includes('\n'+label+': ')?' · '+text:'\n'+label+': '+text;
      if(out.length+seg.length>max)continue;
      if(seg.startsWith(' · ')){const i=out.lastIndexOf('\n'+label+': ');const end=out.indexOf('\n',i+1);out=end<0?out+seg:out.slice(0,end)+seg+out.slice(end);}
      else out+=seg;
    }
    return out;
  }
  async function gfqApi(path,method,body){
    const host=typeof marinara==='object'&&marinara?marinara:globalThis.marinara||{};
    // v0.5.1: when Marinara is opened remotely it requires Admin Access; send the same X-Admin-Secret header Marinara's
    // own client and Gacha Forge send (read from the same storage key), and only to same-origin /api paths.
    let admin='';try{admin=String(localStorage.getItem('marinara_admin_secret')||'').trim();}catch{}
    const opts={method,credentials:'same-origin',cache:'no-store',headers:{'content-type':'application/json','x-marinara-csrf':'1',...(admin?{'X-Admin-Secret':admin}:{})},...(body!==undefined?{body:JSON.stringify(body)}:{})};
    const r=typeof host.apiFetch==='function'?await host.apiFetch(path.replace(/^\/api\//,''),opts):await fetch(path,opts);
    const j=await r.json().catch(()=>null);
    if(!r.ok)throw Object.assign(Error(String(j?.error||j?.message||('HTTP '+r.status))),{status:r.status});
    return j;
  }
  async function gfqInjectCreate(w){
    const name=('퀘스트 확장 · '+(w.gfDisplayName||data.world)).slice(0,200);
    const book=await gfqApi('/api/lorebooks','POST',{name,description:'가챠 포지 퀘스트 확장이 자동으로 갱신하는 퀘스트 현황입니다. 내용은 확장이 덮어쓰므로 직접 고치지 마세요.',enabled:true,isGlobal:false,tags:['gacha-forge-quest']});
    const entry=await gfqApi('/api/lorebooks/'+encodeURIComponent(book.id)+'/entries','POST',{name:'퀘스트 현황',content:gfqInjectText(w,w.gfInject?.limit),constant:true,enabled:true,keys:[],order:1,position:0,description:'퀘스트 확장 자동 기록'});
    w.gfInject={...(w.gfInject||{}),enabled:true,lorebookId:book.id,lorebookName:name,entryId:entry.id,lastHash:'',error:''};
    record(w,'스토리 반영용 로어북 생성: '+name);
    return book;
  }
  async function gfqInjectConnect(w,connect){
    const g=w.gfInject||{};if(!g.lorebookId||!w.gfRunId)throw Error('로어북 또는 게임 월드 연결 정보가 없습니다.');
    let lore=w.gfRunLore;
    if(!lore){const st=await gfqApi('/api/gacha-forge/state','GET');gfqRememberLore(w.gfRunId,st);lore=w.gfRunLore;}
    if(!lore)throw Error('게임에서 이 월드의 로어북 설정을 읽지 못했습니다.');
    let next;
    if(connect){if(!g.prevLore)g.prevLore=gfqCleanLore(lore);next=gfqMergeLore(lore,g.lorebookId,true);}
    else{const prev=g.prevLore?gfqCleanLore(g.prevLore):null;next={...gfqMergeLore(lore,g.lorebookId,false),beat:prev?prev.beat:gfqCleanLore(lore).beat};}
    const r=await gfqApi('/api/gacha-forge/run/lorebooks','POST',{runId:w.gfRunId,lore:next});
    if(r&&r.ok===false)throw Error(String(r.error||'게임이 설정 변경을 거부했습니다.'));
    w.gfRunLore=gfqCleanLore(r?.lore||next);g.connected=connect;if(!connect)delete g.prevLore;w.gfInject=g;
    record(w,connect?'가챠 포지 월드 로어북에 연결: '+(g.lorebookName||g.lorebookId)+' (맨 앞, 스토리 장면에도 사용)':'가챠 포지 월드 로어북 연결 해제: '+(g.lorebookName||g.lorebookId));
    save();return w.gfRunLore;
  }
  var injectTimer=0,injectBusy=false;
  function gfqInjectSchedule(){
    const w=typeof current==='function'?current():null;
    if(!w?.gfInject?.enabled||!w.gfInject.entryId)return;
    if(injectTimer)clearTimeout(injectTimer);
    injectTimer=setTimeout(()=>{injectTimer=0;gfqInjectSync(false);},3000);
  }
  async function gfqInjectSync(force){
    const w=current();if(!w?.gfInject?.entryId||injectBusy)return false;
    const text=gfqInjectText(w,w.gfInject.limit);
    let h=2166136261;for(let i=0;i<text.length;i++)h=Math.imul(h^text.charCodeAt(i),16777619)>>>0;
    const hash=h.toString(36)+':'+text.length;
    if(!force&&hash===w.gfInject.lastHash)return false;
    injectBusy=true;
    try{
      await gfqApi('/api/lorebooks/'+encodeURIComponent(w.gfInject.lorebookId)+'/entries/'+encodeURIComponent(w.gfInject.entryId),'PATCH',{content:text,constant:true,enabled:true});
      w.gfInject.lastHash=hash;w.gfInject.lastAt=now();w.gfInject.error='';
    }catch(e){w.gfInject.error=e.status===404?'로어북 항목을 찾지 못했습니다. 설정 탭에서 다시 만들어 주세요.':String(e.message||e);}
    finally{injectBusy=false;}
    try{localStorage.setItem(STORE,JSON.stringify(data));}catch{}
    if(panel&&currentTab==='settings')render();
    return !w.gfInject.error;
  }
  function gfqTokens(t){try{const h=typeof marinara==='object'&&marinara?marinara:globalThis.marinara;if(h&&typeof h.estimateTextTokens==='function')return h.estimateTextTokens(t);}catch{}return Math.ceil(String(t).length*0.9);}
  function gfqInjectHtml(w){
    const g=w.gfInject||{},text=gfqInjectText(w,g.limit);
    return '<div class="gfq-card"><b>스토리 반영 (로어북)</b><p class="gfq-muted">퀘스트·돈·물품·날짜 현황을 전용 로어북의 상시 항목 하나로 계속 갱신합니다. 가챠 포지가 장면을 쓸 때마다 이 로어북을 새로 읽어, 다음 장면부터 이야기에 반영됩니다. 게임 저장 데이터와 직접 쓰신 지침은 바꾸지 않습니다.</p>'+
      (g.lorebookId?'<p class="gfq-muted">연결된 로어북: <b>'+esc(g.lorebookName||g.lorebookId)+'</b>'+(g.lastAt?' · 마지막 갱신 '+esc(g.lastAt):'')+(g.error?' · <span class="gfq-danger">'+esc(g.error)+'</span>':'')+'</p>':'')+
      '<label><input type="checkbox" id="gfq-inject-on" style="width:auto" '+(g.enabled&&g.lorebookId?'checked':'')+'> 현황을 로어북에 자동 반영</label>'+
      '<label for="gfq-inject-limit">최대 글자 수 (중요한 항목부터 채웁니다)</label><input id="gfq-inject-limit" type="number" min="150" max="4000" step="50" value="'+esc(g.limit||600)+'">'+
      '<label>현재 반영 내용 ('+text.length+'자 · 약 '+gfqTokens(text).toLocaleString('ko-KR')+'토큰'+(w.gfRunLore?' / 월드 로어북 예산 '+(w.gfRunLore.worldBudget||6000).toLocaleString('ko-KR')+'토큰':'')+')</label><textarea readonly rows="7">'+esc(text)+'</textarea>'+
      (g.lorebookId?'<p class="gfq-muted">가챠 포지 연결: '+(w.gfRunLore?(w.gfRunLore.worldIds.includes(g.lorebookId)?'<b>연결됨</b>'+(w.gfRunLore.worldIds[0]===g.lorebookId?' (월드 로어북 맨 앞)':'')+(w.gfRunLore.beat?' · 스토리 장면에도 사용':' · <span class="gfq-danger">스토리 장면 사용 꺼짐</span>'):'<span class="gfq-danger">연결 안 됨</span>'):'게임 설정을 아직 읽지 못했습니다 (가챠 포지 화면을 한 번 열어 주세요)')+'</p>':'')+
      '<div class="gfq-row">'+(g.lorebookId?btn('지금 반영','inject-now')+(w.gfRunLore&&w.gfRunLore.worldIds.includes(g.lorebookId)?btn('가챠 포지 연결 해제','inject-disconnect'):btn('가챠 포지에 연결','inject-connect','class="primary"'))+btn('로어북 다시 만들기','inject-create'):btn('스토리 반영용 로어북 만들기','inject-create','class="primary"'))+'</div>'+
      '<p class="gfq-muted">[가챠 포지에 연결]은 이 월드의 로어북 설정에서 기존 로어북과 예산을 그대로 두고, 이 로어북을 월드 로어북 <b>맨 앞</b>에 추가한 뒤 스토리 장면에도 쓰도록 켭니다. 맨 앞에 두면 예산이 모자랄 때도 이 항목은 빠지지 않고, 뒤쪽 기록이 먼저 빠집니다. 연결 전 설정은 저장해 두며 [연결 해제]로 되돌립니다. 자동 연결이 안 되면 가챠 포지 설정에서 직접 추가해 주세요.</p></div>';
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
    const lines=[...(a.chapters?.length?['분석한 챕터: '+a.chapters.join(', ')]:[]),'처리한 분석 회차: '+a.processed+'/'+a.batches+(a.partial?' (응답이 잘려 부분 복구한 회차 '+a.partial+'개)':'')];
    const dropped=[];
    if(a.evidence)dropped.push('원문 근거 불일치 '+a.evidence+'개');
    if(a.filtered)dropped.push('주인공 무관·유형 제외 '+a.filtered+'개');
    if(a.duplicate)dropped.push('중복 '+a.duplicate+'개');
    if(a.format)dropped.push('형식 오류 '+a.format+'개');
    if(dropped.length)lines.push('제외된 후보: '+dropped.join(', '));
    if(a.linked||a.linkRejected)lines.push('이전 기록 연결: '+(a.linked||0)+'개'+(a.linkRejected?' (검증 실패로 거부 '+a.linkRejected+'개)':''));
    if(a.components)lines.push('총액의 구성 금액으로 판정: '+a.components+'개');
    if(a.dated)lines.push('세계관 날짜 갱신: 챕터 '+a.dated+'개');
    if(a.consolidation)lines.push(a.consolidation);
    if(a.deferred)lines.push('장면 도달 대기: '+a.deferred+'개 (해당 대사가 나오면 반영)');
    if(a.missing)lines.push('누락 의심 금액: '+a.missing+'개 (아래 목록에서 확인해 주세요)');
    if(a.failures?.length)lines.push('실패한 회차:\n'+a.failures.join('\n'));
    return lines.join('\n');
  }
  async function importAiResult(){
    const w=current();if(!w)return;const worldKey=data.world;
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
      for(const x of added)delete x.linkTo;
      const merged=gfqIntegrateQuests(added,gfqRuleCtx(w));
      stats.components=gfqMarkComponents(merged);
      let pool=[...(w.aiProposals||[]),...merged],consolidation=null;
      const connectionId=String(data.aiConnectionId||'').trim();
      if(connectionId&&merged.some(p=>p.category==='quest')){
        const host=typeof marinara==='object'&&marinara?marinara:globalThis.marinara||{};
        try{consolidation=await gfqConsolidateQuests(w,pool,host,connectionId,'gfq-import-'+Date.now().toString(36),undefined);pool=consolidation.list;}
        catch(e){consolidation={error:String(e?.message||e)};}
      }
      if(data.world!==worldKey||current()!==w)throw Error('처리 중 월드가 변경되어 결과를 적용하지 않았습니다.');
      {const dm=gfqDateMap(w),old=new Set((w.aiProposals||[]).map(p=>p.id));for(const p of pool)if(!old.has(p.id))gfqStampDates(dm,p);}
      w.aiProposals=pool;
      w.gfMissingMoney=gfqMissingMoney(w);
      save();render();
      alert(merged.length+'개의 검증된 분석 후보를 추가했습니다.'+(parsed.partial?' 입력이 중간에 잘려 있어 완전한 항목만 복구했습니다.':'')+'\n\n'+gfqAnalysisSummary({processed:1,batches:1,partial:0,failures:[],consolidation:gfqConsolidationSummary(consolidation),...stats}));
    }catch(e){alert('JSON을 가져오지 못했습니다: '+String(e.message||e));}
  }
  const GFQ_MONEY_STATES=['pending','receivable','received','paid','waived','ownership'];
  const gfqMoney=x=>(['asset','contract'].includes(x.category)&&GFQ_MONEY_STATES.includes(x.financialStatus));
  function gfqLedgerRecord(w,x,bulk=false){
    w.gfLedger||=[];
    const key=String(x.transactionId||'').trim();
    // v0.3.8: a validated chain (earlier promise -> later payment) matches without asking.
    const chain=String(x.chainKey||x.id||'').trim();
    const chained=chain?w.gfLedger.find(t=>t.id===chain||(Array.isArray(t.chainKeys)&&t.chainKeys.includes(chain))):null;
    let matches=key?w.gfLedger.filter(t=>t.sourceKey===key&&t.unit===String(x.unit||'')&&
      (t.amount===x.amount||t.amount===null||x.amount===null)&&t.name===String(x.name||'')):[];
    // A ledger entry created from a quest reward is the same payment when amount and unit match exactly once.
    if(!matches.length&&typeof x.amount==='number')matches=w.gfLedger.filter(t=>t.origin==='quest-reward'&&t.amount===x.amount&&t.unit===String(x.unit||''));
    // Never auto-merge collisions or independently authored events.
    let prior=chained||(matches.length===1?matches[0]:null);
    // v0.3.14: ask only when an existing entry could be the same payment (same amount, or an amount still unknown).
    const plausible=(!chained&&!bulk)?w.gfLedger.filter(t=>(t.unit===String(x.unit||'')||!t.unit||!x.unit)&&(t.amount===x.amount||t.amount===null||x.amount===null||typeof x.amount!=='number')):[];
    if(!chained&&!bulk&&plausible.length){
      const options=plausible.map((t,i)=>(i+1)+': '+t.name+' · '+gfqAmount(t.amount,t.unit)+' · '+gfqLabel('money',t.state)+(t.history?.[0]?.source?' · '+t.history[0].source:'')).join('\n').slice(0,3500);
      const answer=prompt('승인하려는 항목: '+String(x.name||'')+' · '+gfqAmount(x.amount,x.unit)+'\n\n이 돈이 아래 기존 거래와 같은 지급이면 그 번호를, 별개의 새 거래면 0을 입력해 주세요.\n(예: 지급 예정이던 보수가 입금된 장면이면 기존 번호)\n\n'+options,prior&&plausible.includes(prior)?String(plausible.indexOf(prior)+1):'0');
      if(answer===null)return false;
      const n=Number(answer);
      if(!Number.isSafeInteger(n)||n<0||n>plausible.length){alert('거래 번호를 확인해 주세요.');return false;}
      prior=n?plausible[n-1]:null;
    }else if(!chained&&!bulk){prior=null;}else if(!chained&&bulk&&matches.length!==1){prior=null;}
    const at=now(),state=x.financialStatus,evidence=String(x.evidence||''),amount=Number.isFinite(x.amount)?x.amount:null,unit=String(x.unit||'');
    if(prior){
      // A total can replace an unknown amount, but component amounts must not silently overwrite it.
      if(prior.history?.some(h=>h.evidence===evidence&&h.state===state))return prior;
      // Never move a payment backwards (e.g. received -> pending) because an earlier scene was approved later.
      const ro=GFQ_RANK[prior.state],rn=GFQ_RANK[state];
      const regress=prior.state!==state&&((ro!==undefined&&rn!==undefined&&rn<ro)||(prior.state==='paid'&&state==='pending'));
      const changedState=prior.state!==state&&!regress;
      prior.history||=[];
      prior.history.push({at,state,amount,evidence,source:x.source||'',...(x.date?{date:x.date}:{}),...(regress?{note:'이전 단계 근거'}:{})});
      if(!regress)prior.state=state;prior.updatedAt=at;
      if(chain){prior.chainKeys=Array.isArray(prior.chainKeys)?prior.chainKeys:[];if(chain!==prior.id&&!prior.chainKeys.includes(chain))prior.chainKeys.push(chain);}
      if(prior.amount===null&&amount!==null)prior.amount=amount;
      if(!prior.sourceKey&&key)prior.sourceKey=key;
      if(!prior.timing)prior.timing=gfqTiming(x);
      record(w,'거래 상태 갱신: '+prior.name+' '+(changedState?'→ '+gfqLabel('money',state):regress?'(이전 단계 근거 추가)':'(추가 근거)')+' · '+evidence);
      return prior;
    }else{
      const tx={id:uid(),sourceKey:key,name:String(x.name||''),state,amount,unit,
        componentOf:'',timing:gfqTiming(x),chainKeys:chain?[chain]:[],origin:String(x.origin||''),createdAt:at,updatedAt:at,history:[{at,state,amount,evidence,source:x.source||'',...(x.date?{date:x.date}:{})}]};
      w.gfLedger.push(tx);record(w,'거래 생성: '+tx.name+' ['+gfqLabel('money',state)+'] · '+evidence);
      return tx;
    }
  }
  // v0.3.8: items promised for later are kept as '수령 예정' and become owned when a linked receipt is approved.
  function gfqApplyItem(w,x){
    const chain=String(x.chainKey||'').trim();
    const waiting=chain?(w.items||[]).find(i=>i.state==='pending'&&(i.chainKey===chain||i.id===chain)):null;
    const qtyOk=typeof x.amount==='number'&&Number.isSafeInteger(x.amount)&&x.amount>0&&x.unit!=='원';
    const receiving=x.financialStatus!=='pending'&&['confirmed','completed'].includes(x.status);
    if(waiting&&receiving){
      delete waiting.state;waiting.receivedAt=now();if(qtyOk)waiting.qty=x.amount;
      record(w,'물품 수령 확인: '+waiting.name+' · '+x.evidence);return true;
    }
    if(!receiving){
      if(waiting){record(w,'수령 예정 물품 추가 근거: '+waiting.name+' · '+x.evidence);return true;}
      const value=typeof x.value==='number'?x.value:(x.unit==='원'&&typeof x.amount==='number'?x.amount:null);
      w.items.push({id:uid(),name:String(x.name||'').slice(0,100),qty:qtyOk?x.amount:1,state:'pending',chainKey:chain||x.id,timing:gfqTiming(x),
        ...(value!==null?{value}:{})});
      record(w,'수령 예정 물품 등록: '+x.name+(gfqTiming(x)?' · '+gfqTimingText(gfqTiming(x)):''));return true;
    }
    // Never add an owned item from a mention without a confirmed quantity.
    if(x.status!=='confirmed'||!qtyOk)return false;
    const item=w.items.find(i=>i.name===x.name&&i.state!=='pending'&&i.kind!=='voucher');if(item)item.qty+=x.amount;else w.items.push({id:uid(),name:x.name,qty:x.amount});
    return true;
  }
  // v0.3.11: benefits. One-off discounts become vouchers in the inventory; lasting ones are an asset field.
  function gfqApplyBenefit(w,x){
    if(x.benefitMode==='record'||(!x.benefitMode&&x.benefitConsumed)){record(w,'혜택 적용 확인: '+x.name+' · '+x.evidence);return 'consumed';}
    if(x.benefitMode==='permanent'||(!x.benefitMode&&x.benefitPermanent)){
      const name='보유 혜택 · '+x.name,f=w.fields.find(v=>v.name===name);
      if(!f)w.fields.push({id:uid(),name,value:'적용 중',unit:''});
      record(w,'상시 혜택 등록: '+x.name+' · '+x.evidence);return 'permanent';
    }
    const uses=Math.max(1,Math.min(99,Number(x.benefitUses)||1));
    const label=/권$/.test(x.name)?x.name:x.name+'권';
    const chain=x.chainKey||x.id;
    const v=w.items.find(i=>i.kind==='voucher'&&(i.chainKey===chain||i.name===label));
    if(v&&v.chainKey===chain){record(w,'혜택 추가 근거: '+label+' · '+x.evidence);return 'voucher';}
    if(v)v.qty+=uses;else w.items.push({id:uid(),name:label,qty:uses,kind:'voucher',chainKey:chain,detail:typeof x.amount==='number'?gfqAmount(x.amount,x.unit):''});
    record(w,'이용권 획득: '+label+' ×'+uses+' · '+x.evidence);return 'voucher';
  }
  // v0.3.11: a purchase records the expense (ledger) and what was bought (inventory).
  function gfqApplyPurchase(w,x){
    for(const it of x.purchasedItems){
      if(it.received){
        const owned=w.items.find(i=>i.name===it.name&&i.state!=='pending'&&i.kind!=='voucher');
        if(owned)owned.qty+=it.qty;else w.items.push({id:uid(),name:it.name,qty:it.qty});
        record(w,'구매 물품 추가: '+it.name+' ×'+it.qty+' ('+x.name+')');
      }else{
        w.items.push({id:uid(),name:it.name,qty:it.qty,state:'pending',chainKey:(x.chainKey||x.id)+':'+it.name,timing:gfqTiming(x)});
        record(w,'구매 물품 수령 예정: '+it.name+' ×'+it.qty+' ('+x.name+')');
      }
    }
  }
  // v0.3.11: a sale records the proceeds (ledger) and removes what was sold from the inventory.
  function gfqApplySale(w,x){
    for(const it of x.soldItems){
      const owned=w.items.find(i=>i.name===it.name&&i.state!=='pending'&&i.kind!=='voucher')||w.items.find(i=>i.state!=='pending'&&i.kind!=='voucher'&&(i.name.includes(it.name)||it.name.includes(i.name)));
      if(!owned){record(w,'판매 물품을 소지품에서 찾지 못했습니다: '+it.name+' ×'+it.qty+' ('+x.name+') · 필요하면 직접 수정해 주세요.');continue;}
      const before=owned.qty;owned.qty=Math.max(0,owned.qty-it.qty);
      record(w,'판매 물품 차감: '+owned.name+' '+before+' → '+owned.qty+' ('+x.name+')');
    }
  }
  // v0.3.11: ledger totals (원 only). Derived from approved records; never edits fields or game currency.
  function gfqLedgerSummary(w){
    const sum={received:0,paid:0,receivable:0,pending:0,unknown:0,other:0};
    for(const t of (w.gfLedger||[])){
      if(t.unit!=='원'){sum.other++;continue;}
      if(typeof t.amount!=='number'){if(['received','paid','receivable','pending'].includes(t.state))sum.unknown++;continue;}
      if(t.state in sum)sum[t.state]+=t.amount;
    }
    return sum;
  }
  // v0.3.8: quest money rewards point at ledger entries so their paid/unpaid state is shown from one place.
  function gfqRelinkQuestRewards(w){
    const ledger=w.gfLedger||[];let linked=0;
    for(const q of (w.quests||[]))for(const r of (Array.isArray(q.rewardDetails)?q.rewardDetails:[])){
      if(r.kind!=='money'||(r.txId&&ledger.some(t=>t.id===r.txId)))continue;
      const chained=r.chainKey&&ledger.find(t=>t.id===r.chainKey||(Array.isArray(t.chainKeys)&&t.chainKeys.includes(r.chainKey)));
      if(chained){r.txId=chained.id;linked++;continue;}
      if(typeof r.amount!=='number')continue;
      const hits=ledger.filter(t=>t.amount===r.amount&&t.unit===String(r.unit||''));
      if(hits.length===1){r.txId=hits[0].id;linked++;}
    }
    return linked;
  }
  function gfqRewardToLedger(w,q,index){
    const r=q.rewardDetails?.[index];
    if(!r||r.kind!=='money'||typeof r.amount!=='number'||r.txId)return null;
    const state=r.certainty==='received'?'received':r.certainty==='confirmed'?'receivable':'pending';
    const tx=gfqLedgerRecord(w,{id:r.chainKey||uid(),name:r.name,financialStatus:state,amount:r.amount,unit:String(r.unit||''),evidence:r.evidence||(Array.isArray(q.sourceEvidence)?q.sourceEvidence[0]:q.sourceEvidence)||q.detail||'',source:q.source||'퀘스트 보상',origin:'quest-reward'},true);
    if(tx)r.txId=tx.id;
    return tx;
  }
  function gfqCalendarHtml(w){
    const c=gfqCurrentDate(w);
    return '<div class="gfq-id-date"><span class="gfq-id-k">세계관 날짜</span><b class="gfq-num">'+esc(c?c.date+' ('+gfqWeekday(c.date)+')':'미확인')+'</b>'+
      '<span class="gfq-muted">'+(c?esc(c.basis)+(c.source?' · '+esc(c.source):''):'원문에서 날짜를 아직 찾지 못했습니다. 직접 입력할 수 있습니다.')+'</span>'+
      '<div class="gfq-row">'+btn('날짜 직접 입력','date-set')+btn('하루 경과','date-next',c?'':'disabled')+'</div></div>';
  }
  function gfqSection(title,count,extra=''){return '<div class="gfq-sec"><h3>'+title+'</h3>'+(count===null||count===undefined?'':'<span class="gfq-sec-n gfq-num">'+count+'</span>')+'<span class="gfq-sec-line"></span>'+extra+'</div>';}
  function gfqBarcode(seed){
    // decorative only: bar widths come from the world key so each world keeps the same code
    let h=2166136261;for(const ch of String(seed||'gf'))h=Math.imul(h^ch.charCodeAt(0),16777619)>>>0;
    let out='';for(let i=0;i<34;i++){h=Math.imul(h^(h>>>13),1597334677)>>>0;out+='<i style="flex:'+(1+h%4)+'"></i>'+(h&8?'<i class="gap"></i>':'');}
    return '<div class="gfq-barcode" aria-hidden="true">'+out+'</div>';
  }
  function gfqProfileCard(w){
    const name=String(w.protagonist||'').trim(),world=w.gfDisplayName||data.world||'';
    const rep=w.fields.find(f=>f.name==='명성'),repN=rep&&/^\d+$/.test(String(rep.value).trim())?Number(rep.value):null;
    const cells=repN===null?0:Math.min(50,Math.max(10,Math.ceil(repN/10)*10));
    const creds=w.fields.filter(f=>/^보유 자격 · /.test(f.name));
    const owned=w.items.filter(i=>i.state!=='pending'&&i.kind!=='voucher').length,pend=w.items.filter(i=>i.state==='pending').length;
    return '<section class="gfq-id" aria-label="프로필">'+
      '<div class="gfq-id-body">'+
        '<div class="gfq-id-world">'+esc(world)+'</div>'+
        '<div class="gfq-id-name">'+(name?esc(name):'<span class="gfq-id-unset">이름 미설정</span>')+'</div>'+
        (name?'':'<p class="gfq-muted">설정 탭의 주인공 이름을 입력하면 여기에 표시됩니다.</p>')+
        '<div class="gfq-id-rep"><span class="gfq-id-k">명성</span>'+(repN===null?'<span class="gfq-muted">'+(rep?esc(rep.value+(rep.unit||'')):'아직 없음')+'</span>':'<span class="gfq-seg" role="img" aria-label="명성 '+repN+'점">'+Array.from({length:cells},(_,i)=>'<i'+(i<repN?' class="on"':'')+'></i>').join('')+'</span><b class="gfq-num">'+repN+'<small>점</small></b>')+'</div>'+
        '<div class="gfq-id-k">보유 자격</div><div class="gfq-chips">'+(creds.map(f=>'<span class="gfq-chip"><b>'+esc(f.name.replace(/^보유 자격 · /,''))+'</b>'+(f.value?'<small>'+esc(f.value)+'</small>':'')+'</span>').join('')||'<span class="gfq-muted">아직 없음</span>')+'</div>'+
        gfqCalendarHtml(w)+
      '</div>'+
      '<div class="gfq-id-slab"><div class="gfq-id-initial">'+esc(name?[...name][0]:'?')+'</div>'+
        '<dl><dt>소지품</dt><dd class="gfq-num">'+owned+'</dd><dt>수령 예정</dt><dd class="gfq-num">'+pend+'</dd><dt>퀘스트</dt><dd class="gfq-num">'+w.quests.filter(q=>!q.claimed).length+'<small>/'+w.quests.length+'</small></dd></dl>'+
        gfqBarcode(data.world)+'</div>'+
    '</section>';
  }
  function gfqMoneyTiles(w){
    const tx=w.gfLedger||[];if(!tx.length)return '';const sm=gfqLedgerSummary(w),net=sm.received-sm.paid;
    const tile=(k,v,cls='')=>'<div class="gfq-tile '+cls+'"><span>'+k+'</span><b class="gfq-num">'+esc(v)+'</b></div>';
    return gfqSection('돈 요약',null)+'<div class="gfq-tiles">'+tile('입금 확인',gfqAmount(sm.received,'원'),'in')+tile('지출',gfqAmount(sm.paid,'원'),'out')+tile('순변동',(net>=0?'+':'')+gfqAmount(net,'원'),net>=0?'in':'out')+tile('받을 돈',gfqAmount(sm.receivable+sm.pending,'원'),'wait')+'</div>'+
      '<p class="gfq-muted">승인한 거래만 합산합니다'+(sm.unknown?' · 금액 미확인 '+sm.unknown+'건 제외':'')+'. 받을 돈은 미수금과 지급 예정을 더한 금액입니다. 소지금 항목이나 게임 재화는 자동으로 바꾸지 않습니다.</p>';
  }
  function gfqItemsHtml(w){
    const pend=w.items.filter(i=>i.state==='pending'),own=w.items.filter(i=>i.state!=='pending'&&i.kind!=='voucher'),vou=w.items.filter(i=>i.kind==='voucher');
    const tiles=pend.map(i=>'<div class="gfq-slot pending"><div class="gfq-slot-q" aria-hidden="true">?</div><b>'+esc(i.name)+'</b><span class="gfq-tag wait">수령 예정</span>'+
        (i.timing?'<small>'+esc(gfqTimingText(i.timing))+(gfqResolveTiming(w,i.timing)?' → '+esc(gfqResolveTiming(w,i.timing)):'')+'</small>':'')+(i.value?'<small>가치 '+esc(gfqAmount(i.value,'원'))+'</small>':'')+
        '<div class="gfq-row">'+btn('수령 확인','receive-item',`data-id="${esc(i.id)}" class="primary"`)+btn('삭제','delete-item',`data-id="${esc(i.id)}"`)+'</div></div>').join('')+
      own.map(i=>'<div class="gfq-slot"><div class="gfq-slot-qty gfq-num">×'+esc(i.qty)+'</div><b>'+esc(i.name)+'</b>'+(i.detail?'<small>'+esc(i.detail)+'</small>':'')+
        '<div class="gfq-row">'+btn('수정','edit-item',`data-id="${esc(i.id)}"`)+btn('삭제','delete-item',`data-id="${esc(i.id)}"`)+'</div></div>').join('');
    return gfqSection('소지품',own.length+(pend.length?' + 예정 '+pend.length:''),btn('＋ 소지품','add-item'))+
      (tiles?'<div class="gfq-slots">'+tiles+'</div>'+(pend.length?'<p class="gfq-muted">물음표 칸은 아직 받지 않은 물품입니다. 수령을 확인하기 전까지 보유품과 스토리 반영에서 제외합니다.</p>':''):'<div class="gfq-empty"><div class="gfq-empty-symbol">◇</div><strong>소지품이 비어 있습니다</strong><span class="gfq-muted">스토리에서 얻은 물품을 직접 추가하거나 AI 분석으로 채울 수 있습니다.</span></div>')+
      (vou.length?gfqSection('혜택·이용권',vou.length)+'<div class="gfq-slots">'+vou.map(i=>'<div class="gfq-slot ticket'+(i.qty>0?'':' used')+'"><div class="gfq-slot-qty gfq-num">'+(i.qty>0?i.qty+'회':'사용 완료')+'</div><b>'+esc(i.name)+'</b>'+(i.detail?'<small>'+esc(i.detail)+'</small>':'')+
        '<div class="gfq-row">'+btn('사용','use-voucher',`data-id="${esc(i.id)}" ${i.qty>0?'':'disabled'}`)+btn('삭제','delete-item',`data-id="${esc(i.id)}"`)+'</div></div>').join('')+'</div><p class="gfq-muted">퀘스트 보상이나 계약으로 받은 할인·감면 혜택입니다. 사용하면 횟수가 줄고 변경 기록에 남습니다.</p>':'');
  }
  function gfqLedgerHtml(w){
    const tx=w.gfLedger||[];
    return gfqSection('거래 내역',tx.length+'건')+'<p class="gfq-muted">돈이 오가거나 오가기로 한 일을 거래마다 한 줄로 모읍니다. 같은 거래는 상태만 갱신하고, 세부 수당과 총액은 따로 더하지 않습니다.</p>'+
      (tx.length?'<div class="gfq-tx">'+tx.slice().reverse().map(t=>'<div class="gfq-tx-row s-'+esc(t.state)+'"><div class="gfq-tx-main"><b>'+esc(t.name)+'</b><span class="gfq-tag">'+esc(gfqLabel('money',t.state))+'</span></div>'+
        '<div class="gfq-tx-amt gfq-num">'+esc(gfqAmount(t.amount,t.unit))+'</div>'+
        (t.timing?'<small>지급 시점: '+esc(gfqTimingText(t.timing))+(gfqResolveTiming(w,t.timing)?' → '+esc(gfqResolveTiming(w,t.timing)):'')+'</small>':'')+
        '<details><summary>상태 변경 이력 '+(t.history||[]).length+'건</summary>'+(t.history||[]).map(h=>'<p class="gfq-muted">'+(h.date?'['+esc(h.date)+'] ':'')+esc(h.at)+' · '+esc(gfqLabel('money',h.state))+' · '+esc(h.evidence)+'</p>').join('')+'<small class="gfq-muted">거래 ID '+esc(t.id)+'</small></details>'+
        '<div class="gfq-row"><button data-action="ledger-update" data-id="'+esc(t.id)+'">상태 수동 갱신</button></div></div>').join('')+'</div>':'<p class="gfq-muted">기록된 거래가 없습니다.</p>');
  }
  function gfqProfileHtml(w){
    const fields=w.fields.filter(f=>f.name!=='명성'&&!/^보유 자격 · /.test(f.name)),special=w.fields.filter(f=>f.name==='명성'||/^보유 자격 · /.test(f.name));
    const row=f=>'<div class="gfq-field"><span>'+esc(f.name)+'</span><b>'+esc(f.value)+' '+esc(f.unit)+'</b>'+btn('수정','edit-field',`data-id="${esc(f.id)}"`)+btn('삭제','delete-field',`data-id="${esc(f.id)}"`)+'</div>';
    return gfqProfileCard(w)+gfqMoneyTiles(w)+gfqItemsHtml(w)+gfqLedgerHtml(w)+
      gfqSection('프로필 항목',w.fields.length,btn('＋ 항목','add-field'))+'<p class="gfq-muted">소지금, 은행, 직업처럼 직접 관리하는 항목입니다.</p>'+
      (fields.map(row).join('')||'<p class="gfq-muted">직접 추가한 항목이 없습니다.</p>')+
      (special.length?'<details class="gfq-more"><summary>명성·자격 항목 직접 고치기</summary>'+special.map(row).join('')+'</details>':'');
  }
  function approveAiProposal(id,bulk=false){
    const w=current(),x=w?.aiProposals?.find(v=>v.id===id);if(!x)return false;
    const ctx=gfqRuleCtx(w);
    if(!gfqEventEligible(x,ctx))return bulk?false:alert('이 사건은 주인공 자산·의뢰와 무관해 반영할 수 없습니다.');
    if(['asset','contract'].includes(x.category)&&x.financialStatus==='received'&&!/(입금(?:됐|되었|받았|완료| 확인)|계좌.{0,24}(입금|들어왔)|송금(?:받|완료)|잔액.{0,20}(증가|늘어)|실제.{0,12}(수령|지급받)|(?:판매 ?대금|대금|현금|값).{0,16}(?:받았|건네받|수령했))/u.test(String(x.evidence||''))){if(!bulk)alert('정산 완료만으로 실제 입금은 확정할 수 없습니다. 기존 후보를 삭제하고 재분석하거나 수동 확인해 주세요.');return false;}
    if(!x.updateOf&&(w.quests||[]).some(q=>x.category==='quest'&&gfqDuplicate({category:'quest',name:q.title,evidence:q.detail||''},x,ctx)))return bulk?false:alert('이미 등록된 유사 퀘스트입니다.');
    if(x.status==='uncertain'||x.financialStatus==='uncertain'&&x.category==='asset'){if(!bulk)alert('불확실한 사건은 자동으로 반영할 수 없습니다. 원문을 확인한 후 수동으로 등록해 주세요.');return false;}
    if(!bulk&&!confirm('원문과 상태를 확인하셨습니까? '+x.category+' · '+x.name+'을(를) 기록에 반영하시겠습니까?'))return false;
    if(gfqMoney(x)&&x.role==='component')record(w,'구성 금액 확인: '+x.name+' '+gfqAmount(x.amount,x.unit)+' (총액에 포함, 별도 수입 아님)');
    else if(gfqMoney(x)&&!gfqLedgerRecord(w,x,bulk))return false;
    if(x.category==='quest'){
      const quest=gfqQuestPresentation(gfqSafeProposal(x,gfqRuleCtx(w)));
      const target=x.updateOf?(w.quests||[]).find(v=>v.id===x.updateOf):null;
      if(target)gfqUpdateQuest(w,target,x,quest);
      else{
      const q={id:uid(),stepDone:quest.stepDone,...(x.date?{startDate:x.date}:{}),...(x.status==='completed'&&(x.endDate||x.date)?{doneDate:x.endDate||x.date}:{}),title:quest.title,type:'의뢰',detail:quest.objective,target:1,progress:x.status==='completed'?1:0,reward:quest.rewardList.map(r=>r.name).join(' · '),rewardDetails:quest.rewardList,claimed:x.status==='completed',sourceEvidence:x.evidence,source:x.source,steps:quest.steps,rewardTransactionId:x.rewardTransactionId||''};
      w.quests.push(q);if(q.claimed)gfqAwardQuestReputation(w,q);
      }
    }
    else if(x.category==='credential'){
      // v0.3.15: store the licence, not the act of receiving it ('… 면허 교부' → '… 면허').
      const name='보유 자격 · '+(String(x.name).replace(/\s*(교부|발급|취득|획득|승인|수여)$/u,'').trim()||x.name);
      // v0.3.10: '물리계 정식 면허 교부' and '물리계 C급 정식 면허' are the same licence.
      const words=t=>String(t).replace(/^보유 자격 · /,'').replace(/(교부|발급|취득|획득|승인|수여)$/u,'').trim().split(/\s+/).filter(Boolean);
      const mine=words(x.name);
      const same=w.fields.find(v=>v.name!==name&&/^보유 자격 · /.test(v.name)&&(()=>{const o=words(v.name);return mine.length&&mine.every(t=>o.includes(t))||o.length&&o.every(t=>mine.includes(t));})());
      if(same){record(w,'자격 중복 확인: '+x.name+' → 기존 \''+same.name.replace(/^보유 자격 · /,'')+'\' 유지 · '+x.evidence);w.aiAcceptedKeys||=[];w.aiAcceptedKeys.push(x.category+'|'+x.evidence);w.aiProposals=w.aiProposals.filter(v=>v.id!==id);if(!bulk){save();render();}return true;}
      const field=w.fields.find(v=>v.name===name);
      const dated=gfqDatesIn(x.evidence)[0],value=dated?'취득 · '+dated:'취득';
      if(field)field.value=value;else w.fields.push({id:uid(),name,value,unit:''});
      record(w,'자격 취득 확인: '+x.name+' · '+x.evidence);
    }else if(x.category==='benefit'){
      gfqApplyBenefit(w,x);
    }else if(x.category==='contract'){
      record(w,'계약 확인: '+x.name+' · '+x.evidence);
    }else if(x.category==='item'){
      if(!gfqApplyItem(w,x)){if(!bulk)alert('아이템은 획득 확정 및 개수 확인 시, 또는 수령 예정 물품으로만 반영할 수 있습니다.');return false;}
    }else if(x.category==='asset'&&!gfqMoney(x)){
      record(w,'자산 검토: '+x.name+' · '+x.evidence);
    }
    if(gfqMoney(x)&&x.financialStatus==='paid'&&Array.isArray(x.purchasedItems))gfqApplyPurchase(w,x);
    if(gfqMoney(x)&&Array.isArray(x.soldItems))gfqApplySale(w,x);
    gfqRelinkQuestRewards(w);
    record(w,'AI 검토 승인: '+x.name+' · '+x.source);
    w.aiAcceptedKeys||=[];w.aiAcceptedKeys.push(x.category+'|'+x.evidence);
    w.aiProposals=w.aiProposals.filter(v=>v.id!==id);if(!bulk){save();render();}return true;
  }
  const btn=(label,action,extra='')=>`<button data-action="${action}" ${extra}>${label}</button>`;
  function worldSelect(){return `<div class="gfq-row"><select id="gfq-world" class="gfq-fill"><option value="">월드 선택</option>${Object.keys(data.worlds).map(w=>`<option value="${esc(w)}" ${data.world===w?'selected':''}>${esc(data.worlds[w]?.gfDisplayName||w)}</option>`).join('')}</select>${btn('＋ 월드','new-world')}</div>`;}
  function render(){if(!panel)return;let w=current();if(currentTab==='assets'||currentTab==='items')currentTab='profile';const tabs=[['quests','퀘스트'],['profile','프로필'],['history','기록'],['settings','설정']];const ti=Math.max(0,tabs.findIndex(t=>t[0]===currentTab));const today=w?gfqCurrentDate(w):null;const empty='<div class="gfq-empty"><div class="gfq-empty-symbol">◇</div><strong>아직 등록된 내용이 없습니다</strong><span class="gfq-muted">월드의 퀘스트와 자산을 여기에서 관리할 수 있습니다.</span></div>';panel.innerHTML=`<div class="gfq-frame"><header class="gfq-head"><div class="gfq-mark" aria-hidden="true"></div><div><h2>퀘스트</h2><div class="gfq-en">Gacha Forge</div></div>${btn('✕','close','aria-label="닫기"')}</header><aside class="gfq-side"><nav class="gfq-tabs">${tabs.map(([key,label])=>`<button class="${currentTab===key?'primary':''}" data-tab="${key}" ${currentTab===key?'aria-current="page"':''}>${label}</button>`).join('')}</nav><div class="gfq-side-foot">${today?`<span>세계관 날짜</span><b class="gfq-num">${esc(today.date)}</b><span>${esc(gfqWeekday(today.date))}요일 · ${esc(today.basis)}</span>`:'<span>세계관 날짜</span><b>미확인</b>'}</div></aside><main class="gfq-main"><div class="gfq-context"><b>${tabs[ti][1]}</b><span class="gfq-count gfq-num">${String(ti+1).padStart(2,'0')}<small>/${String(tabs.length).padStart(2,'0')}</small></span></div><div class="gfq-worldbar">${worldSelect()}</div><div id="gfq-content">${w?content(w):currentTab==='history'?`${btn('월드 연결 다시 시도','resync-world','class="primary"')}<p class="gfq-muted">현재 월드가 연결되지 않았습니다. 버튼을 눌러 연결 상태를 확인해 주세요.</p>${lastSyncError?'<div class="gfq-card">연결 진단: '+esc(lastSyncError)+'</div>':''}`:empty}</div></main><footer class="gfq-footer"><span>이 브라우저에만 저장됩니다</span><span class="gfq-num">v0.5.2</span></footer></div>`;}
  function content(w){switch(currentTab){case 'quests':return `<div class="gfq-row"><select id="gfq-filter">${['전체','일일','주간','의뢰','업적'].map(t=>`<option ${activeFilter===t?'selected':''}>${t}</option>`).join('')}</select>${btn('＋ 퀘스트','add-quest','class="primary"')}</div>${w.quests.filter(q=>activeFilter==='전체'||q.type===activeFilter).map(q=>`<div class="gfq-card"><div class="gfq-row"><b class="gfq-fill">${esc(q.title)}</b><small>${esc(q.type)}</small></div><div class="gfq-muted">${esc(q.detail)}</div>${Array.isArray(q.steps)&&q.steps.length?`<div class="gfq-muted">세부 목표</div><div class="gfq-row">${q.steps.map((t,i)=>btn((q.stepDone?.[i]?'✓ ':'○ ')+esc(t),'toggle-step',`data-id="${esc(q.id)}" data-step="${i}" aria-pressed="${q.stepDone?.[i]?'true':'false'}"`)).join("")}</div>`:""}${gfqQuestDatesHtml(q)}${gfqQuestProgressHtml(q)}${btn('＋1','increment',`data-id="${esc(q.id)}" ${q.claimed?'disabled':''}`)}${btn(q.claimed?'완료됨':'완료','complete',`data-id="${esc(q.id)}" ${q.claimed?'disabled':''}`)}${btn('삭제','delete-quest',`data-id="${esc(q.id)}"`)}</div><div class="gfq-muted">보상(기록용): ${esc(gfqQuestRewardLabel(q))}</div>${(q.rewardDetails||[]).map((r,i)=>r.kind==='money'&&typeof r.amount==='number'&&!(r.txId&&(w.gfLedger||[]).some(t=>t.id===r.txId))?btn('거래 내역에 기록: '+esc(r.name),'reward-to-ledger',`data-id="${esc(q.id)}" data-idx="${i}"`):'').join('')}</div>`).join('')||'<div class="gfq-empty"><div class="gfq-empty-symbol">▤</div><strong>진행 중인 퀘스트가 없습니다</strong><span class="gfq-muted">새 퀘스트를 등록하면 여기에 표시됩니다.</span></div>'}`;
  case 'profile':return gfqProfileHtml(w);
  case 'history':return `${btn('월드 표시 이름 수정','rename-display')} ${btn('월드 연결 다시 시도','resync-world','class="primary"')} ${w.gfRunId?btn('기존 스토리 목록 조회','scan-chapters','class="primary"')+'<p class="gfq-muted">연결된 게임 월드 ID: '+esc(w.gfRunId)+'</p>':'<p class="gfq-muted">아직 게임 월드와 연결되지 않았습니다.</p>'}${lastSyncError?'<div class="gfq-card">연결 진단: '+esc(lastSyncError)+'</div>':''}${chapterIndexHTML(w)}${aiReviewHtml(w)}${candidateHtml(w)}<h3>변경 기록</h3>${w.history.slice(0,100).map(h=>`<div class="gfq-card"><span class="gfq-muted">${esc(h.at)}</span><div>${esc(h.text)}</div></div>`).join('')||'<div class="gfq-empty"><div class="gfq-empty-symbol">≡</div><strong>아직 기록이 없습니다</strong><span class="gfq-muted">항목을 수정하면 변경 이력이 남습니다.</span></div>'}`;
  case 'settings':return `${aiSettingsHTML()}${gfqWorldRulesHtml(w)}${gfqInjectHtml(w)}<p>현재 월드: <b>${esc(w.gfDisplayName||data.world)}</b></p>${btn('주입문 확인·복사','context-preview','class="primary"')}${btn('백업 내보내기','export')}${btn('백업 가져오기','import')}${btn('월드 삭제','delete-world','class="gfq-danger"')}<p class="gfq-muted">데이터는 현재 브라우저의 로컬 저장소에 보관됩니다. 기기 간 자동 동기화는 지원하지 않으므로 백업 내보내기를 이용해 주세요.</p>`;}}
  const ask=(message,def='')=>prompt(message,def);
  const update=fn=>{const w=current();if(!w)return;fn(w);save();render();};
  const record=(w,text)=>{w.history.unshift({at:now(),text});w.history=w.history.slice(0,500);};
  function exportData(){const file=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');const url=URL.createObjectURL(file);a.href=url;a.download='quest-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function importData(){const inp=document.createElement('input');inp.type='file';inp.accept='.json,application/json';inp.onchange=async()=>{const f=inp.files?.[0];if(!f||f.size>2e6)return alert('2MB 이하의 JSON 파일만 지원합니다.');try{const d=JSON.parse(await f.text());if(d.v!==1||typeof d.worlds!=='object'||!d.worlds||Array.isArray(d.worlds))throw Error('백업 형식이 올바르지 않습니다.');for(const w of Object.values(d.worlds)){if(!Array.isArray(w.quests)||!Array.isArray(w.fields)||!Array.isArray(w.items)||!Array.isArray(w.history))throw Error('월드 데이터가 올바르지 않습니다.');}if(!confirm('현재 퀘스트 데이터를 백업 파일로 교체하시겠습니까?'))return;const previous=data;data=d;if(!save()){data=previous;return;}render();}catch(e){alert('가져오지 못했습니다: '+e.message);}};inp.click();}
  document.addEventListener('change',e=>{if(!panel||!panel.contains(e.target))return;if(e.target.id==='gfq-world'){data.world=e.target.value;save();render();}if(e.target.id==='gfq-filter'){activeFilter=e.target.value;render();}if(e.target.id==='gfq-ai-connection'){data.aiConnectionId=e.target.value;save();render();}if(e.target.id==='gfq-ai-mode'){data.aiMode=e.target.value;save();render();}if(e.target.id==='gfq-auto-apply'){data.autoApply=e.target.checked;save();render();}if(e.target.id==='gfq-scene-timed'){data.sceneTimed=e.target.checked;save();render();}if(e.target.id==='gfq-inject-on'){const w=current();if(w){if(!w.gfInject?.lorebookId){e.target.checked=false;alert('먼저 [스토리 반영용 로어북 만들기]를 눌러 주세요.');return;}w.gfInject.enabled=e.target.checked;record(w,'로어북 자동 반영 '+(e.target.checked?'켜기':'끄기'));save();render();if(e.target.checked)gfqInjectSync(true);}}if(e.target.id==='gfq-inject-limit'){const w=current();if(w){w.gfInject={...(w.gfInject||{}),limit:Math.max(150,Math.min(4000,Number(e.target.value)||600))};save();render();}}if(e.target.id==='gfq-ai-range'){data.aiRange=e.target.value;save();}if(e.target.id==='gfq-hero'){const w=current();if(w){gfqRuleCtx(w);w.protagonist=String(e.target.value||'').trim().slice(0,40);record(w,'주인공 이름 설정: '+(w.protagonist||'(비움)'));save();render();}}if(e.target.id==='gfq-legacy'){const w=current();if(w){gfqRuleCtx(w);w.gfRulePack=e.target.checked?GFQ_LEGACY_PACK:'';record(w,'기존 월드 전용 보정 규칙 '+(e.target.checked?'사용':'해제'));save();render();}}});
  document.addEventListener('click',e=>{const el=e.target.closest?.('#'+ID+'-panel [data-action],#'+ID+'-panel [data-tab]');if(!el)return;if(el.dataset.tab){currentTab=el.dataset.tab;render();return;}const act=el.dataset.action,id=el.dataset.id,w=current();
  if(act==='close')return openPanel();if(act==='resync-world')return syncWorld();if(act==='new-world'){const name=ask('새 월드 이름');if(name===null)return;const key=name.trim();if(!key||key.length>100)return alert('1~100자로 입력해 주세요.');if(data.worlds[key])return alert('이미 존재하는 월드입니다.');data.worlds[key]=blank();data.world=key;save();return render();}if(!w)return;
  if(act==='review-candidate'||act==='dismiss-candidate'){const c=storyCandidates(w).find(x=>x.id===id);if(!c)return;const key=c.type+'|'+c.quote;if(act==='review-candidate'){if(!confirm('다음 문장을 검토 기록으로 채택하시겠습니까? 실제 퀘스트 및 자산 상태는 변경되지 않습니다.\\n\\n'+c.quote))return;w.gfReviewed||=[];w.gfReviewed.push(key);record(w,'스토리 검토: ['+c.type+'] '+c.source+' · '+c.quote);}else{w.gfDismissed||=[];w.gfDismissed.push(key);}save();render();return;}
  if(act==='rename-display'){const label=ask('표시할 월드 이름을 입력해 주세요.',w.gfDisplayName||data.world);if(!label?.trim())return;w.gfDisplayName=label.trim().slice(0,100);save();render();return;}
  if(act==='add-quest'){const title=ask('퀘스트 이름');if(!title?.trim())return;const type=ask('종류: 일일 / 주간 / 의뢰 / 업적','의뢰');if(!['일일','주간','의뢰','업적'].includes(type))return alert('올바른 퀘스트 종류가 아닙니다.');const detail=ask('조건 및 설명','');if(detail===null)return;const count=Number(ask('목표 횟수 (1 이상)','1'));if(!Number.isSafeInteger(count)||count<1)return alert('목표 횟수를 확인해 주세요.');const reward=ask('보상 메모 (게임 재화로 자동 지급되지 않습니다)','');if(reward===null)return;return update(w=>{w.quests.push({id:uid(),title:title.trim(),type,detail,target:count,progress:0,reward,claimed:false});record(w,'퀘스트 등록: '+title);});}
  if(act==='inject-create'){
    if(w.gfInject?.lorebookId&&!confirm('새 로어북을 만들어 연결합니다. 가챠 포지 설정의 월드 로어북도 새 로어북으로 바꿔 주셔야 합니다. 계속하시겠습니까?'))return;
    (async()=>{try{await gfqInjectCreate(w);save();render();
      if(confirm('로어북을 만들었습니다: '+w.gfInject.lorebookName+'\n\n이어서 이 월드의 가챠 포지 로어북 설정에 자동으로 연결할까요? (기존 로어북은 그대로 두고 맨 앞에 추가, 스토리 장면에도 사용)')){try{await gfqInjectConnect(w,true);render();gfqToast('가챠 포지 연결','다음 챕터·장면부터 퀘스트 현황이 반영됩니다','info');}catch(e){alert('자동 연결에 실패했습니다: '+(e.message||e)+'\n가챠 포지 설정 → 월드 로어북에 직접 추가하고, 로어북을 스토리 장면에도 사용하는 설정을 켜 주세요.');}}
    }catch(e){alert('로어북을 만들지 못했습니다: '+(e.message||e)+(e.status===403?'\n\n원격 접속에서는 마리나라 설정 → 고급 → Admin Access가 필요합니다.':''));}})();
    return;
  }
  if(act==='inject-connect'||act==='inject-disconnect'){
    const on=act==='inject-connect';
    if(on&&!confirm('이 월드의 가챠 포지 로어북 설정에 \''+(w.gfInject?.lorebookName||'')+'\'을(를) 맨 앞에 추가하고, 로어북을 스토리 장면에도 사용하도록 켭니다. 기존 로어북과 예산은 그대로 둡니다. 진행하시겠습니까?'))return;
    (async()=>{try{await gfqInjectConnect(w,on);render();gfqToast(on?'가챠 포지 연결':'연결 해제',on?'다음 챕터·장면부터 퀘스트 현황이 반영됩니다':'로어북 설정을 연결 전으로 되돌렸습니다','info');}catch(e){alert((on?'자동 연결':'연결 해제')+'에 실패했습니다: '+(e.message||e)+(e.status===403?'\n\n원격 접속에서는 마리나라 설정 → 고급 → Admin Access가 필요합니다.':'')+'\n\n가챠 포지 설정의 월드 로어북에서 직접 '+(on?'추가':'제거')+'해 주세요.');}})();
    return;
  }
  if(act==='inject-now'){(async()=>{const ok=await gfqInjectSync(true);alert(ok?'로어북에 현재 현황을 반영했습니다.':'반영하지 못했습니다: '+(w.gfInject?.error||''));})();return;}
  if(act==='date-set'||act==='date-next'){
    const c=gfqCurrentDate(w),latest=Math.max(0,...Object.keys(w.gfDates||{}).map(Number).filter(Number.isFinite),c?.chapter||0);
    let date=null;
    if(act==='date-next'){if(!c)return;date=gfqAddDays(c.date,1);}
    else{const ans=ask('세계관 현재 날짜를 입력해 주세요. (예: 2033-04-08)',c?.date||'');if(ans===null)return;date=gfqDatesIn(ans)[0]||null;if(!date)return alert('YYYY-MM-DD 형식으로 입력해 주세요.');}
    return update(w=>{w.gfDateManual={date,chapter:latest,at:now(),ms:Date.now()};record(w,'세계관 날짜 '+(act==='date-next'?'하루 경과':'직접 입력')+': '+date);});
  }
  if(act==='undo-auto'){if(!w.gfUndo)return;if(!confirm('마지막 자동 반영('+w.gfUndo.count+'개) 직전 상태로 퀘스트·자산·소지품·거래 내역·검토 목록을 되돌리시겠습니까? 그 이후 직접 수정한 내용도 함께 되돌아갑니다.'))return;try{const s=JSON.parse(w.gfUndo.snap);Object.assign(w,s);delete w.gfUndo;record(w,'마지막 자동 반영을 되돌렸습니다.');save();render();}catch(e){alert('되돌리지 못했습니다: '+e.message);}return;}
  if(act==='money-rescan'){w.gfMissingMoney=gfqMissingMoney(w);save();render();return alert('누락 의심 금액 '+w.gfMissingMoney.length+'개를 찾았습니다.');}
  if(act==='money-fill-ledger'){
    const m=(w.gfMissingMoney||[])[Number(el.dataset.idx)];if(!m)return;
    const open=(w.gfLedger||[]).filter(t=>t.amount===null);if(!open.length)return;
    const ans=ask('이 금액('+gfqAmount(m.amount,'원')+')이 어느 거래의 금액인지 번호를 입력해 주세요. 상태(입금 여부)는 바뀌지 않습니다.\n'+m.sentence.slice(0,160)+'\n\n'+open.map((t,i)=>(i+1)+': '+t.name+' · '+gfqLabel('money',t.state)+(t.history?.[0]?.source?' · '+t.history[0].source:'')).join('\n'),'1');
    if(ans===null)return;const t=open[Number(ans)-1];if(!t)return alert('번호를 확인해 주세요.');
    t.amount=m.amount;t.unit=t.unit||'원';t.history||=[];t.history.push({at:now(),state:t.state,amount:m.amount,evidence:m.sentence,source:m.source,note:'금액 보완'});
    record(w,'거래 금액 보완: '+t.name+' → '+gfqAmount(m.amount,'원')+' · '+m.source);
    w.gfMissingMoney=w.gfMissingMoney.filter(v=>v!==m);gfqRelinkQuestRewards(w);save();render();return;
  }
  if(act==='money-dismiss'){const m=(w.gfMissingMoney||[])[Number(el.dataset.idx)];if(!m)return;w.gfMoneyDismissed||=[];w.gfMoneyDismissed.push(m.amount);w.gfMissingMoney=w.gfMissingMoney.filter(v=>v!==m);save();render();return;}
  if(act==='money-to-candidate'){
    const m=(w.gfMissingMoney||[])[Number(el.dataset.idx)];if(!m)return;
    const name=ask('거래 이름을 입력해 주세요.\n'+m.sentence,'');if(!name?.trim())return;
    const state=ask('상태 코드를 입력해 주세요.\npending: 지급 예정 / receivable: 미수금 / received: 입금 확인 / paid: 지출',"pending");
    if(state===null)return;if(!['pending','receivable','received','paid'].includes(state.trim()))return alert('올바른 상태 코드를 입력해 주세요.');
    const p=gfqBuildProposal({category:'asset',name:name.trim(),status:'confirmed',financialStatus:state.trim(),amount:m.amount,unit:'원',owner:'player',source:m.source,eventKind:state.trim()==='paid'?'expense':'payment'},m.sentence,gfqRuleCtx(w));
    p.auditNote=[p.auditNote,'누락 의심 금액에서 직접 추가한 후보입니다.'].filter(Boolean).join(' ');
    w.aiProposals||=[];w.aiProposals.push(p);w.gfMissingMoney=w.gfMissingMoney.filter(v=>v!==m);save();render();return;
  }
  if(act==='use-voucher'){const it=w.items.find(x=>x.id===id&&x.kind==='voucher');if(!it||it.qty<1)return;const where=ask('어디에 사용하셨는지 적어 주세요. (예: 챕터 5 · 건틀릿 강화 공임)','');if(where===null)return;return update(w=>{it.qty-=1;record(w,'이용권 사용: '+it.name+' (남은 횟수 '+it.qty+')'+(where.trim()?' · '+where.trim():''));});}
  if(act==='receive-item'){const it=w.items.find(x=>x.id===id&&x.state==='pending');if(!it)return;const ev=ask('수령을 확인한 근거를 입력해 주세요. (예: 챕터 4 · 장면 2에서 건틀릿을 받음)','');if(!ev?.trim())return alert('수령 근거가 필요합니다.');return update(w=>{delete it.state;it.receivedAt=now();record(w,'물품 수령 확인(수동): '+it.name+' · '+ev.trim());});}
  if(act==='reward-to-ledger'){const q=w.quests.find(x=>x.id===id),i=Number(el.dataset.idx),r=q?.rewardDetails?.[i];if(!r)return;if(!confirm('퀘스트 보상 \''+r.name+' '+gfqAmount(r.amount,r.unit)+'\'을(를) 거래 내역에 '+gfqLabel('certainty',r.certainty)+' 상태로 기록하시겠습니까? 같은 금액의 거래가 이미 있으면 기존 거래에 연결됩니다.'))return;return update(w=>{const hits=(w.gfLedger||[]).filter(t=>t.amount===r.amount&&t.unit===String(r.unit||''));if(hits.length===1){r.txId=hits[0].id;record(w,'퀘스트 보상 거래 내역 연결: '+r.name+' → '+hits[0].name);}else if(hits.length>1){alert('같은 금액의 거래가 여러 건 있어 자동으로 연결하지 않았습니다. 프로필 탭의 거래 내역에서 해당 거래를 확인해 주세요.');}else gfqRewardToLedger(w,q,i);});}
  if(act==='toggle-step'){const i=Number(el.dataset.step);return update(w=>{const q=w.quests.find(x=>x.id===id);if(!q||!Array.isArray(q.steps)||!Number.isSafeInteger(i)||i<0||i>=q.steps.length)return;q.stepDone=q.steps.map((_,k)=>q.stepDone?.[k]===true);q.stepDone[i]=!q.stepDone[i];record(w,'세부 목표 '+(q.stepDone[i]?'완료':'완료 취소')+': '+q.title+' · '+q.steps[i]);});}
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
    try{if(toastBox&&toastBox.matches(':popover-open')){toastBox.hidePopover();toastBox.showPopover();}}catch{}
    if(!panel||!panel.isConnected)return;
    if(fsRefresh)clearTimeout(fsRefresh);
    fsRefresh=setTimeout(()=>{fsRefresh=null;if(!panel||!panel.isConnected)return;try{if(panel.open)panel.close();panel.showModal();}catch(e){console.warn('[퀘스트] 전체화면 팝업 복원 실패',e);}},75);
  }
  document.addEventListener('fullscreenchange',refreshFullscreenDialog);
  document.addEventListener('webkitfullscreenchange',refreshFullscreenDialog);
  window.addEventListener('pagehide',()=>{if(injectTimer)clearTimeout(injectTimer);if(autoTimer)clearTimeout(autoTimer);if(sceneRecheck)clearTimeout(sceneRecheck);document.removeEventListener('fullscreenchange',refreshFullscreenDialog);document.removeEventListener('webkitfullscreenchange',refreshFullscreenDialog);if(fsRefresh)clearTimeout(fsRefresh);if(worldSyncTimer)clearInterval(worldSyncTimer);mo.disconnect();if(gameObserver)gameObserver.disconnect();if(gameDebounce)clearTimeout(gameDebounce);clearInterval(sync);});
})();

const fs=require('fs'),assert=require('assert');
const src=fs.readFileSync(process.argv[2]||require("path").join(__dirname,"..","extension.js"),'utf8');
const grab=name=>{const i=src.indexOf('  function '+name+'(');if(i<0)throw Error('missing '+name);let d=0,j=src.indexOf('{',i);for(;j<src.length;j++){if(src[j]==='{')d++;else if(src[j]==='}'){d--;if(!d)break;}}return src.slice(i,j+1);};
const grabConst=c=>{const i=src.indexOf('  const '+c+'=');if(i<0)throw Error('missing const '+c);const j=src.indexOf('=',i)+1;if(src[j]==='{'){let d=0,k=j;for(;k<src.length;k++){if(src[k]==='{')d++;else if(src[k]==='}'){d--;if(!d)break;}}return src.slice(i,k+1)+';\n';}return src.slice(i,src.indexOf('\n',i)+1);};
const consts=['GFQ_SKIP','GFQ_TIMING','GFQ_LEGACY_PACK','GFQ_GENERIC','gfqEsc','GFQ_LABELS','gfqLabel','gfqAmount','gfqTimingText','GFQ_MONEY_STATES','gfqMoney','GFQ_RANK','gfqChainOf','GFQ_LINK_REASON'].map(grabConst).join('');
const names=['gfqChapterBatches','gfqContextItems','gfqResolveLink','gfqApplyLink','gfqMarkComponents','gfqLedgerRecord','gfqRelinkQuestRewards','gfqApplyItem','gfqConsolidationInput','gfqApplyConsolidation','gfqQuestPresentation','gfqStepLine','gfqUpdateQuest','gfqAwardQuestReputation','gfqRuleCtx','gfqTiming','gfqEventEligible','gfqSafeProposal','gfqNormMap','gfqLocateEvidence','gfqStoryRecords','gfqParseEvents','gfqBuildProposal','gfqScreenEvent','gfqDuplicate','gfqCollectEvents','gfqKnownKeys','gfqIntegrateQuests','gfqQuestGroup','gfqAnalysisSummary'];
const code="let n=0;const uid=()=>'id'+(n++);const record=(w,text)=>{(w.history||=[]).unshift({text});};const now=()=>'T';const prompt=()=>{throw Error(\"prompt called\")};const alert=()=>{};"+consts+names.map(grab).join('\n')+'\nreturn {'+names.join(',')+'};';
const F=new Function(code)();
const L={legacy:true,hero:'채서래'};
let pass=0;const t=(name,fn)=>{fn();pass++;console.log('✓',name);};
const story='채서래는 계약서에 서명했다.  기본 수당 950,000원과 위험 수당 450,000원, 총 1,400,000원이 지급될 예정이다. 그는 이후 C급 면허를 취득했다.';
t('근거: 공백·따옴표 차이 허용, 원문 구간 반환',()=>{
  assert.strictEqual(F.gfqLocateEvidence('기본 수당 950,000원과  위험 수당',[story]),'기본 수당 950,000원과 위험 수당');
  assert.strictEqual(F.gfqLocateEvidence('계약서에 서명했다. 기본',[story]),'계약서에 서명했다.  기본');
  assert.strictEqual(F.gfqLocateEvidence('“계약서에 서명했다”',[story]),'계약서에 서명했다');
});
t('근거: 원문에 없는 문장은 거부',()=>{assert.strictEqual(F.gfqLocateEvidence('계좌에 140만 원이 입금됐다',[story]),null);});
t('근거: 너무 짧은 인용은 거부',()=>{assert.strictEqual(F.gfqLocateEvidence('원과',[story]),null);});
t('면허 이름: 다른 면허는 강제 변경하지 않음',()=>{
  const a=F.gfqSafeProposal({category:'credential',name:'B급 탐색자 면허',evidence:'B급 탐색자 면허를 받았다'});
  assert.strictEqual(a.name,'B급 탐색자 면허');
  const b=F.gfqSafeProposal({category:'credential',name:'C급 면허',evidence:'물리계 C급 정식 면허를 발급받았다'},L);
  assert.strictEqual(b.name,'물리계 C급 정식 면허');
});
t('정산 완료만으로 received 확정 안 함 (기존 동작 유지)',()=>{
  const r=F.gfqSafeProposal({category:'asset',financialStatus:'received',name:'보수',evidence:'정산을 완료했다'});
  assert.strictEqual(r.financialStatus,'receivable');
});
t('잘린 JSON에서 완전한 사건만 복구',()=>{
  const raw='```json\n{"events":[{"category":"asset","name":"a","evidence":"x}y"},{"category":"quest","name":"b"},{"category":"item","name":"잘';
  const p=F.gfqParseEvents(raw);assert.ok(p.partial);assert.strictEqual(p.events.length,2);assert.strictEqual(p.events[0].evidence,'x}y');
});
t('정상 JSON / 배열 / 쓰레기 입력',()=>{
  assert.strictEqual(F.gfqParseEvents('{"events":[]}').partial,false);
  assert.strictEqual(F.gfqParseEvents('[{"a":1}]').events.length,1);
  assert.strictEqual(F.gfqParseEvents('응답 없음'),null);
});
t('시간순 정렬: 챕터 → 줄거리 → 장면 번호',()=>{
  const w={gfChapterIndex:[{chapter:2,premise:'P2'},{chapter:1,premise:'P1'}],gfStorySamples:[{chapter:'2',index:'1',text:'S2-1'},{chapter:'1',index:'10',text:'S1-10'},{chapter:'1',index:'2',text:'S1-2'},{chapter:'?',index:'?',text:'S?'}]};
  assert.deepStrictEqual(F.gfqStoryRecords(w).map(r=>r.text),['P1','S1-2','S1-10','P2','S2-1','S?']);
});
t('수집: 근거 위치를 원문 구간으로 교정하고 탈락 사유 집계',()=>{
  const w={aiProposals:[],aiAcceptedKeys:[]},out=[],stats={format:0,filtered:0,evidence:0,duplicate:0};
  F.gfqCollectEvents([
    {category:'asset',name:'보수 총액',status:'active',financialStatus:'pending',owner:'player',amount:1400000,unit:'원',evidence:'총 1,400,000원이  지급될 예정이다'},
    {category:'asset',name:'가짜',status:'active',financialStatus:'received',owner:'player',evidence:'계좌에 300만 원이 입금됐다'},
    {category:'asset',name:'NPC 돈',status:'active',financialStatus:'received',owner:'npc',evidence:'기본 수당 950,000원과'},
    {category:'asset',name:'보수 총액',status:'active',financialStatus:'pending',owner:'player',amount:1400000,unit:'원',evidence:'총 1,400,000원이 지급될 예정이다'},
    {name:''}
  ],[story],w,F.gfqKnownKeys(w),out,stats);
  assert.strictEqual(out.length,1);assert.strictEqual(out[0].evidence,'총 1,400,000원이 지급될 예정이다');
  assert.deepStrictEqual(stats,{format:1,filtered:1,evidence:1,duplicate:1});
});
t('이미 승인한 근거는 다시 후보로 만들지 않음',()=>{
  const w={aiProposals:[],aiAcceptedKeys:['asset|총 1,400,000원이 지급될 예정이다']},out=[],stats={format:0,filtered:0,evidence:0,duplicate:0};
  F.gfqCollectEvents([{category:'asset',name:'x',status:'active',financialStatus:'pending',owner:'player',evidence:'총 1,400,000원이 지급될 예정이다'}],[story],w,F.gfqKnownKeys(w),out,stats);
  assert.strictEqual(out.length,0);assert.strictEqual(stats.duplicate,1);
});
t('v0.3.4 통합 사례 회귀: 구성 수당 제거, 총액 유지',()=>{
  const ev=[{category:'asset',name:'긴급 설비 방어 보수',amount:1400000,unit:'원',source:'챕터 3 · 장면 4'},{category:'asset',name:'기본 수당',amount:950000,unit:'원',source:'챕터 3 · 장면 4'},{category:'asset',name:'위험 수당',amount:450000,unit:'원',source:'챕터 3 · 장면 4'}];
  const r=F.gfqIntegrateQuests(ev,L);assert.strictEqual(r.length,1);assert.strictEqual(r[0].name,'긴급 설비 방어 보수 총액');
});
t('퀘스트 보상: 정산 완료 표현만으로 수령 확인 금지',()=>{
  const a=F.gfqSafeProposal({category:'quest',status:'completed',financialStatus:'received',evidence:'현장 긴급 대응 수당 정산을 완료한다',questRewards:[{name:'현장 긴급 대응 수당',kind:'money',certainty:'received',evidence:''}]});
  assert.strictEqual(a.financialStatus,'receivable');assert.strictEqual(a.questRewards[0].certainty,'confirmed');
  const b=F.gfqSafeProposal({category:'quest',status:'active',financialStatus:'received',evidence:'방어 보수 정산을 마무리한다',questRewards:[{name:'보수',kind:'money',certainty:'received'}]});
  assert.strictEqual(b.financialStatus,'pending');assert.strictEqual(b.questRewards[0].certainty,'pending');
  const c=F.gfqSafeProposal({category:'quest',status:'completed',financialStatus:'received',evidence:'수당이 계좌에 입금됐다',questRewards:[{name:'수당',kind:'money',certainty:'received'}]});
  assert.strictEqual(c.financialStatus,'received');assert.strictEqual(c.questRewards[0].certainty,'received');
});
t('지급 시점: 상대 표현은 발화 장면 기준으로 기록',()=>{
  const a=F.gfqTiming({evidence:'맞춤 경량 건틀릿 및 특수 수선 세트를 내일 이 시간에 그대로 수령하시게 됩니다.',source:'챕터 3 · 장면 1'});
  assert.deepStrictEqual(a,{text:'내일 이 시간',anchor:'챕터 3 · 장면 1'});
  assert.strictEqual(F.gfqTiming({evidence:'임무 완료 시 금일 오후 6시 정각에 세후 총 1,400,000원을 정산',source:'s'}).text,'임무 완료 시 · 금일 오후 6시 정각');
  assert.strictEqual(F.gfqTiming({timing:'임무 완료 시',evidence:'',source:'s'}).text,'임무 완료 시');
  assert.strictEqual(F.gfqTiming({evidence:'기본급 500,000원은 그대로 보장됩니다',source:'s'}),null);
});
t('총액 보정이 퀘스트 제목을 덮어쓰지 않음',()=>{
  const r=F.gfqIntegrateQuests([{category:'quest',name:'제1공방 방어',questObjective:'제1공방 용해로 폭발을 막는다',amount:1400000,unit:'원',source:'챕터 3 · 장면 1',evidence:'e'}],L);
  assert.strictEqual(r[0].name,'제1공방 긴급 방어 작전');
});
t('월드 판별: 기존 월드는 이름과 보정 규칙을 자동 설정',()=>{
  const old={gfStorySamples:[{text:'채서래는 하역 통로를 지켰다.'}]};
  assert.deepStrictEqual(F.gfqRuleCtx(old),{legacy:true,hero:'채서래'});
  const fresh={gfStorySamples:[{text:'홍길동은 의뢰를 받았다.'}]};
  assert.deepStrictEqual(F.gfqRuleCtx(fresh),{legacy:false,hero:''});
  fresh.protagonist='홍길동';assert.deepStrictEqual(F.gfqRuleCtx(fresh),{legacy:false,hero:'홍길동'});
  old.gfRulePack='';assert.strictEqual(F.gfqRuleCtx(old).legacy,false);
});
t('새 월드: 기존 월드 전용 규칙이 적용되지 않음',()=>{
  const ev=[{category:'asset',name:'긴급 설비 방어 보수',amount:1400000,unit:'원',source:'챕터 3 · 장면 4'},{category:'asset',name:'기본 수당',amount:950000,unit:'원',source:'챕터 3 · 장면 4'},{category:'quest',name:'냉장 물류창고 조사',source:'챕터 1 · 줄거리',evidence:'x'}];
  const r=F.gfqIntegrateQuests(ev);assert.strictEqual(r.length,3);assert.strictEqual(r[0].name,'긴급 설비 방어 보수');
  assert.strictEqual(F.gfqSafeProposal({category:'credential',name:'물리계 C급 면허',evidence:'물리계 C급 면허'}).name,'물리계 C급 면허');
  assert.strictEqual(F.gfqDuplicate({category:'credential',name:'물리계 면허',evidence:'a'},{category:'credential',name:'물리계 C급 면허',evidence:'b'}),false);
  assert.strictEqual(F.gfqEventEligible({category:'quest',owner:'player',name:'보수 정산'}),true);
});
t('기존 월드: v0.3.4 필터 유지',()=>{
  assert.strictEqual(F.gfqEventEligible({category:'quest',owner:'player',name:'보수 정산'},L),false);
  assert.strictEqual(F.gfqEventEligible({category:'item',owner:'player',name:'앰플',evidence:'한도윤이 앰플을 추가 장전했다'},L),false);
  assert.strictEqual(F.gfqDuplicate({category:'credential',name:'물리계 면허',evidence:'a'},{category:'credential',name:'물리계 C급 면허',evidence:'b'},L),true);
});
const Q=(id,o)=>({id,category:'quest',name:o.t,questTitle:o.t,status:o.s||'active',source:o.src||'챕터 1',evidence:o.e||('근거 '+id),questRewards:o.r||[],questObjective:''});
t('퀘스트 통합: 같은 임무 후보를 하나로 묶고 원문 근거 보존',()=>{
  const pool=[Q('a',{t:'오염 원인 조사',s:'completed',e:'오염원을 찾았다'}),Q('b',{t:'냉각 밸브 개방',r:[{name:'보수',kind:'money',amount:100,certainty:'pending'}]}),{id:'m',category:'asset',name:'돈',evidence:'x'},Q('c',{t:'별개 의뢰'})];
  const inp=F.gfqConsolidationInput({quests:[]},pool);
  assert.strictEqual(inp.candidates.length,3);
  const r=F.gfqApplyConsolidation(pool,[{memberIds:['c1','c2'],title:'공방 방어 작전',objective:'공방을 지킨다',steps:[{text:'오염 원인 조사',done:true},{text:'냉각 밸브 개방',done:false}],status:'completed'},{memberIds:['c3']}],inp.candMap,inp.questMap);
  assert.deepStrictEqual(r.list.map(p=>p.name),['공방 방어 작전','돈','별개 의뢰']);
  const m=r.list[0];
  assert.strictEqual(m.status,'active'); // 미완료 단계가 있으면 AI가 completed라 해도 진행 중
  assert.strictEqual(m.evidence,'근거 b'); // 보상 있는 후보를 기준으로 근거 유지
  assert.deepStrictEqual(m.sourceEvidence,['오염원을 찾았다','근거 b']);
  assert.deepStrictEqual(m.questStepDone,[true,false]);
  assert.strictEqual(m.mergedCount,2);assert.strictEqual(r.mergedGroups,1);
});
t('퀘스트 통합: 잘못된 ID·중복 배정·단독 후보 처리',()=>{
  const pool=[Q('a',{t:'A'}),Q('b',{t:'B'}),Q('c',{t:'C'})];
  const inp=F.gfqConsolidationInput({quests:[]},pool);
  const r=F.gfqApplyConsolidation(pool,[{memberIds:['c1','c9','x'],title:''},{memberIds:['c1','c2'],title:'AB'},{memberIds:['c3']},null,'bad'],inp.candMap,inp.questMap);
  // c1은 첫 그룹(유효 멤버 1개, 기존 퀘스트 없음)이라 그대로 두고, 두 번째 그룹에서 c1+c2가 묶임
  assert.deepStrictEqual(r.list.map(p=>p.name),['AB','C']);
  const bad=F.gfqApplyConsolidation(pool,'not array',inp.candMap,inp.questMap);
  assert.deepStrictEqual(bad.list,pool);
});
t('퀘스트 통합: 모든 단계 완료가 뒷받침될 때만 완료',()=>{
  const pool=[Q('a',{t:'A',s:'completed'}),Q('b',{t:'B'})];
  const inp=F.gfqConsolidationInput({quests:[]},pool);
  const r=F.gfqApplyConsolidation(pool,[{memberIds:['c1','c2'],title:'AB',steps:[{text:'1',done:true},{text:'2',done:true}],status:'completed'}],inp.candMap,inp.questMap);
  assert.strictEqual(r.list[0].status,'completed');
});
t('기존 퀘스트 갱신: 새 퀘스트 대신 단계·완료·보상 갱신, 명성 제안 대체',()=>{
  const q={id:'q1',title:'공방 방어',detail:'d',target:1,progress:0,claimed:false,steps:['오염 원인 조사'],stepDone:[false],rewardDetails:[{name:'명성 상승',kind:'reputation',certainty:'suggested',amount:1,unit:'점'}]};
  const w={quests:[q],fields:[],history:[]};
  const pool=[Q('a',{t:'공방 방어 완료',s:'completed',r:[{name:'방어 보수',kind:'money',amount:500000,unit:'원',certainty:'confirmed'}]})];
  const inp=F.gfqConsolidationInput(w,pool);
  assert.strictEqual(inp.existing[0].id,'e1');
  const r=F.gfqApplyConsolidation(pool,[{memberIds:['c1'],existingQuestId:'e1',title:'공방 방어',steps:[{text:'오염 원인 조사',done:true},{text:'게이트 파편 파괴',done:true}],status:'completed'}],inp.candMap,inp.questMap);
  const x=r.list[0];assert.strictEqual(x.updateOf,'q1');assert.strictEqual(r.updates,1);
  F.gfqUpdateQuest(w,q,x,F.gfqQuestPresentation(x));
  assert.deepStrictEqual(q.steps,['오염 원인 조사','게이트 파편 파괴']);
  assert.deepStrictEqual(q.stepDone,[true,true]);
  assert.strictEqual(q.claimed,true);
  assert.deepStrictEqual(q.rewardDetails.map(r=>r.name),['방어 보수']);
  assert.ok(!w.fields.some(f=>f.name==='명성'),'금전 보상이 있으면 기본 명성을 주지 않음');
  assert.strictEqual(w.quests.length,1);
});
t('기존 퀘스트 갱신: 갱신 대상 ID가 엉터리면 연결하지 않음',()=>{
  const pool=[Q('a',{t:'A'})];
  const inp=F.gfqConsolidationInput({quests:[{id:'q1',title:'X'}]},pool);
  const r=F.gfqApplyConsolidation(pool,[{memberIds:['c1'],existingQuestId:'q1'}],inp.candMap,inp.questMap);
  assert.deepStrictEqual(r.list,pool);
});
const M=(id,o)=>({id,category:o.c||'asset',name:o.n,amount:o.a??null,unit:o.u??'원',financialStatus:o.f||'pending',status:o.s||'confirmed',evidence:o.e||('근거 '+id),source:o.src||'챕터 3 · 장면 1',transactionId:o.tid||''});
t('구성 금액: 같은 장면의 합계를 찾아내되 별개 지급은 유지 (50만 원 사례)',()=>{
  const list=[M('b',{n:'1차 방어 소집 기본급',a:500000}),M('x',{n:'기본 수당',a:950000}),M('y',{n:'위험 수당',a:450000}),M('t',{n:'긴급 설비 방어 보수 총액',a:1400000})];
  assert.strictEqual(F.gfqMarkComponents(list),2);
  assert.strictEqual(list[0].role,undefined);
  assert.strictEqual(list[1].role,'component');assert.strictEqual(list[2].role,'component');assert.strictEqual(list[3].role,'total');
  assert.strictEqual(list[1].componentOf,'t');
});
t('구성 금액: 합이 맞지 않으면 건드리지 않음',()=>{
  const list=[M('a',{n:'A',a:300}),M('b',{n:'B',a:500}),M('c',{n:'C',a:1000})];
  assert.strictEqual(F.gfqMarkComponents(list),0);
});
t('맥락 목록: 원장·검토 후보·수령 예정 물품에 짧은 ID 부여, 2,000자 제한',()=>{
  const w={gfLedger:[{id:'L1',name:'긴급 설비 방어 보수',amount:1400000,unit:'원',state:'pending',timing:{text:'임무 완료 시',anchor:'챕터 3 · 장면 1'},history:[]}],
    items:[{id:'I1',name:'맞춤 건틀릿',qty:1,state:'pending',timing:{text:'내일 이 시간',anchor:'챕터 3 · 장면 1'}}]};
  const c=F.gfqContextItems(w,[M('p',{n:'1차 기본급',a:500000})]);
  assert.match(c.text,/\[t1\] 거래 · 긴급 설비 방어 보수 · 1,400,000 원 · 지급 예정 · 시점: 임무 완료 시/);
  assert.match(c.text,/\[i2\] 물품 · 맞춤 건틀릿/);assert.match(c.text,/\[t3\] 거래 · 1차 기본급 · 500,000 원/);
  const many=F.gfqContextItems({gfLedger:Array.from({length:200},(_,i)=>({id:'L'+i,name:'긴 이름의 거래 항목 '+i,amount:i,unit:'원',state:'pending',history:[]}))},[]);
  assert.ok(many.text.length<=2000);
});
t('연결 검증: 금액 불일치·상태 역행·유형 불일치 거부, 정상 연결은 체인 공유',()=>{
  const w={gfLedger:[{id:'L1',name:'보수',amount:1400000,unit:'원',state:'pending',history:[]}],items:[{id:'I1',name:'건틀릿',state:'pending'}]};
  const c=F.gfqContextItems(w,[]);
  const ok=M('n',{n:'보수 입금',a:1400000,f:'received'});ok.linkTo='t1';assert.strictEqual(F.gfqResolveLink(ok,c.map),'ok');assert.strictEqual(ok.chainKey,'L1');assert.ok(!('linkTo' in ok));
  const amt=M('n',{n:'기본급',a:500000,f:'received'});amt.linkTo='t1';assert.strictEqual(F.gfqResolveLink(amt,c.map),'amount');assert.strictEqual(amt.chainKey,undefined);
  const w2={gfLedger:[{id:'L2',name:'보수',amount:100,unit:'원',state:'received',history:[]}]};const c2=F.gfqContextItems(w2,[]);
  const back=M('n',{n:'보수 약속',a:100,f:'pending'});back.linkTo='t1';assert.strictEqual(F.gfqResolveLink(back,c2.map),'state');
  const cat=M('n',{n:'돈',a:1,f:'received'});cat.linkTo='i2';assert.strictEqual(F.gfqResolveLink(cat,c.map),'category');
  const ghost=M('n',{n:'돈',a:1});ghost.linkTo='t99';const st={};F.gfqApplyLink(ghost,c.map,st);assert.strictEqual(st.linkRejected,1);assert.match(ghost.auditNote,/없는 맥락 ID/);
  const inherit=M('n',{n:'보수 입금',a:null,f:'received'});inherit.linkTo='t1';F.gfqResolveLink(inherit,c.map);assert.strictEqual(inherit.amount,1400000);assert.match(inherit.auditNote,/이전 기록에서/);
});
t('원장: 약속 → 입금이 한 거래로 이어지고, 늦게 승인한 약속이 상태를 되돌리지 않음',()=>{
  const w={gfLedger:[],history:[]};
  const promise=M('p1',{n:'긴급 설비 방어 보수',a:1400000,f:'pending'});
  const paid=M('p2',{n:'보수 입금',a:1400000,f:'received',e:'계좌에 140만 원이 입금됐다'});paid.chainKey='p1';
  F.gfqLedgerRecord(w,paid,true);          // 입금 장면을 먼저 승인
  F.gfqLedgerRecord(w,promise,true);       // 약속 장면을 나중에 승인
  assert.strictEqual(w.gfLedger.length,1);
  assert.strictEqual(w.gfLedger[0].state,'received');
  assert.strictEqual(w.gfLedger[0].history.length,2);assert.strictEqual(w.gfLedger[0].history[1].note,'이전 단계 근거');
});
t('원장: 별개 지급(다른 금액)은 별도 거래',()=>{
  const w={gfLedger:[],history:[]};
  F.gfqLedgerRecord(w,M('a',{n:'보수 총액',a:1400000}),true);
  F.gfqLedgerRecord(w,M('b',{n:'1차 기본급',a:500000}),true);
  assert.strictEqual(w.gfLedger.length,2);
});
t('퀘스트 보상 ↔ 원장: 금액이 정확히 하나만 맞으면 연결',()=>{
  const q={rewardDetails:[{name:'보수',kind:'money',amount:1400000,unit:'원',certainty:'pending'},{name:'명성',kind:'reputation'}]};
  const w={quests:[q],gfLedger:[{id:'L1',amount:1400000,unit:'원',state:'received'}]};
  assert.strictEqual(F.gfqRelinkQuestRewards(w),1);assert.strictEqual(q.rewardDetails[0].txId,'L1');
  const q2={rewardDetails:[{name:'보수',kind:'money',amount:100,unit:'원'}]};
  const w2={quests:[q2],gfLedger:[{id:'A',amount:100,unit:'원'},{id:'B',amount:100,unit:'원'}]};
  assert.strictEqual(F.gfqRelinkQuestRewards(w2),0);
});
t('원장: 퀘스트 보상에서 만든 거래는 이후 같은 금액의 계약 승인과 합쳐짐',()=>{
  const w={gfLedger:[{id:'Q',name:'보수',amount:1400000,unit:'원',state:'pending',origin:'quest-reward',chainKeys:[],history:[]}],history:[]};
  F.gfqLedgerRecord(w,M('c',{n:'긴급 설비 방어 보수 총액',a:1400000}),true);
  assert.strictEqual(w.gfLedger.length,1);
});
t('수령 예정 물품: 등록 후 연결된 수령 장면으로 보유 전환',()=>{
  const w={items:[],history:[]};
  const promise={id:'g1',category:'item',name:'맞춤 경량 건틀릿',status:'active',financialStatus:'pending',amount:1240000,unit:'원',evidence:'건틀릿을 내일 이 시간에 수령하시게 됩니다',source:'챕터 3 · 장면 1'};
  assert.strictEqual(F.gfqApplyItem(w,promise),true);
  assert.strictEqual(w.items[0].state,'pending');assert.strictEqual(w.items[0].qty,1);assert.strictEqual(w.items[0].value,1240000);
  assert.strictEqual(w.items[0].timing.text,'내일 이 시간');
  const got={id:'g2',category:'item',name:'건틀릿',status:'confirmed',financialStatus:'ownership',amount:1,unit:'개',evidence:'건틀릿을 건네받았다',source:'챕터 4',chainKey:'g1'};
  assert.strictEqual(F.gfqApplyItem(w,got),true);
  assert.strictEqual(w.items.length,1);assert.strictEqual(w.items[0].state,undefined);
  const mention={id:'g3',category:'item',name:'앰플',status:'confirmed',financialStatus:'ownership',amount:null,unit:'',evidence:'앰플이 있었다'};
  assert.strictEqual(F.gfqApplyItem(w,mention),false);
});
t('챕터 단위 분석: 챕터마다 한 회차, 긴 챕터는 나눠서 순서 유지',()=>{
  const recs=[{source:'챕터 1 · 줄거리',text:'p1'},{source:'챕터 1 · 장면 1',text:'a'},{source:'챕터 2 · 장면 1',text:'b'},
    ...Array.from({length:5},(_,i)=>({source:'챕터 3 · 장면 '+(i+1),text:'x'.repeat(3000)})),{source:'챕터 ? · 장면 ?',text:'z'}];
  const b=F.gfqChapterBatches(recs,7000);
  assert.deepStrictEqual(b.map(x=>x.label),['챕터 1','챕터 2','챕터 3 1/3부','챕터 3 2/3부','챕터 3 3/3부','챕터 미상']);
  assert.deepStrictEqual(b.map(x=>x.length),[2,1,2,2,1,1]);
  assert.strictEqual(b[0][0].text,'p1');
});
console.log('\n'+pass+'개 통과');

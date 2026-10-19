const fs=require('fs'),assert=require('assert');
const src=fs.readFileSync(process.argv[2]||require("path").join(__dirname,"..","extension.js"),'utf8');
const grab=name=>{const i=src.indexOf('  function '+name+'(');if(i<0)throw Error('missing '+name);let d=0,j=src.indexOf('{',i);for(;j<src.length;j++){if(src[j]==='{')d++;else if(src[j]==='}'){d--;if(!d)break;}}return src.slice(i,j+1);};
const skip=src.match(/  const GFQ_SKIP=.*\n/)[0];
const names=['gfqEventEligible','gfqSafeProposal','gfqNormMap','gfqLocateEvidence','gfqStoryRecords','gfqParseEvents','gfqBuildProposal','gfqScreenEvent','gfqDuplicate','gfqCollectEvents','gfqKnownKeys','gfqIntegrateQuests','gfqQuestGroup','gfqAnalysisSummary'];
const code="let n=0;const uid=()=>'id'+(n++);"+skip+names.map(grab).join('\n')+'\nreturn {'+names.join(',')+'};';
const F=new Function(code)();
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
  const b=F.gfqSafeProposal({category:'credential',name:'C급 면허',evidence:'물리계 C급 정식 면허를 발급받았다'});
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
  const r=F.gfqIntegrateQuests(ev);assert.strictEqual(r.length,1);assert.strictEqual(r[0].name,'긴급 설비 방어 보수 총액');
});
console.log('\n'+pass+'개 통과');

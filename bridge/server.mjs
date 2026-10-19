// Gacha Forge Quest Bridge — optional Marinara server capability package.
// Processes user-approved story text only. Never reads passwords or model API keys.
const ID = "gacha-quest-bridge";
let releaseRoutes = null;
const instruction = `You analyze Korean RPG story records into grounded events.
Return ONLY a JSON object {"events":[...]} where each event has:
category: "quest"|"asset"|"item"; name: short Korean title;
status: "completed"|"active"|"confirmed"|"uncertain";
evidence: VERBATIM contiguous quotation from source; source: chapter/scene label;
amount: number or null; unit: string.
Do not assert payment when only a settlement or promise is mentioned.
Do not turn mentions of materials into gained items. Never invent player actions, values or ownership.
Do not duplicate identical events. Omit unreliable events.`;
function getText(x){return typeof x==="string"?x:"";}
function checkBody(body){
  if(!body||typeof body!=="object")throw Error("요청 본문이 올바르지 않습니다.");
  const connectionId=getText(body.connectionId).trim();
  if(!connectionId||connectionId.length>200)throw Error("AI 연결을 선택해 주세요.");
  const records=Array.isArray(body.records)?body.records:[];
  if(!records.length||records.length>50)throw Error("분석 기록은 1~50개여야 합니다.");
  const safe=records.map(x=>({source:getText(x?.source).slice(0,120),text:getText(x?.text).slice(0,5000)})).filter(x=>x.text.trim());
  if(!safe.length||JSON.stringify(safe).length>50000)throw Error("기록의 크기가 너무 큽니다.");
  return {connectionId,safe};
}
function parseResult(raw,runtime){
  const fromRuntime=runtime?.json?.parseJsonish;
  let result;
  try {result=typeof fromRuntime==="function"?fromRuntime(raw):JSON.parse(raw);}
  catch {const match=raw.match(/\{[\s\S]*\}/);if(!match)throw Error("모델 응답이 JSON이 아닙니다.");result=JSON.parse(match[0]);}
  const list=Array.isArray(result)?result:result?.events;
  if(!Array.isArray(list))throw Error("모델 응답에 events 배열이 없습니다.");
  return list.slice(0,60).filter(x=>x&&["quest","asset","item"].includes(x.category)&&
    ["completed","active","confirmed","uncertain"].includes(x.status)&&
    typeof x.name==="string"&&typeof x.evidence==="string")
    .map(x=>({category:x.category,name:x.name.slice(0,100),status:x.status,
      evidence:x.evidence.slice(0,600),source:getText(x.source).slice(0,120),
      amount:typeof x.amount==="number"&&Number.isFinite(x.amount)?x.amount:null,
      unit:getText(x.unit).slice(0,30)}));
}
export async function activate(context){
  if(context?.package?.id!==ID)throw Error("Unexpected package identity");
  if(typeof context?.api?.registerPrivilegedRoutes!=="function"||
     typeof context?.api?.runtime?.languageModels?.resolve!=="function")throw Error("Required Marinara package APIs are missing");
  const runtime=context.api.runtime;
  releaseRoutes=await context.api.registerPrivilegedRoutes(async routes=>{
    routes.post("/analyze",async(request,reply)=>{
      try {
        const {connectionId,safe}=checkBody(request.body);
        const model=await runtime.languageModels.resolve(connectionId);
        if(!model||typeof model.chatComplete!=="function")return reply.code(409).send({error:"선택한 연결을 사용할 수 없습니다."});
        const source=safe.map(x=>"["+x.source+"]\n"+x.text).join("\n\n");
        const outputLimit=Math.max(512,Math.min(3000,Number(model.maxOutputTokens)||3000));
        const rawMessages=[{role:"system",content:instruction},{role:"user",content:source}];
        const fitted=typeof model.fitContext==="function"?model.fitContext(rawMessages,{maxTokens:outputLimit}):{messages:rawMessages,maxTokens:outputLimit};
        const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),90000);
        let response;
        try{response=await model.chatComplete(fitted.messages,{temperature:0,maxTokens:fitted.maxTokens||outputLimit,responseFormat:{type:"json_object"},signal:ctl.signal});}
        finally{clearTimeout(timer);}
        const events=parseResult(getText(response?.content),runtime);
        return reply.send({ok:true,events});
      }catch(error){
        runtime.logger?.warn?.("Quest analysis failed: %s",error?.message);
        return reply.code(422).send({error:"AI 분석에 실패했습니다: "+String(error?.message||error).slice(0,160)});
      }
    });
  });
}
export async function deactivate(){if(typeof releaseRoutes==="function"){releaseRoutes();releaseRoutes=null;}}

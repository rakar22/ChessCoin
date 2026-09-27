import crypto from "node:crypto";

function botToken(){return process.env.TELEGRAM_BOT_TOKEN||""}

export function verifyTelegramInitData(initData){
 const token=botToken();
 if(!token)return {ok:false,error:"TELEGRAM_BOT_TOKEN is not configured"};
 const params=new URLSearchParams(initData||"");
 const hash=params.get("hash");
 if(!hash)return {ok:false,error:"Missing Telegram hash"};
 params.delete("hash");
 const dataCheck=[...params.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>`${k}=${v}`).join("\n");
 const secret=crypto.createHmac("sha256","WebAppData").update(token).digest();
 const expected=crypto.createHmac("sha256",secret).update(dataCheck).digest("hex");
 const ok=crypto.timingSafeEqual(Buffer.from(expected),Buffer.from(hash));
 if(!ok)return {ok:false,error:"Invalid Telegram signature"};
 const authDate=Number(params.get("auth_date")||0);
 if(!authDate||Date.now()/1000-authDate>86400)return {ok:false,error:"Telegram init data expired"};
 let user=null;try{user=JSON.parse(params.get("user")||"null")}catch{}
 return user?.id?{ok:true,user}:{ok:false,error:"Telegram user missing"};
}
export function realtimeUrl(){
return import.meta.env.VITE_MULTIPLAYER_URL||"";
}
export function createRealtimeClient({onState,onRoom,onError,onHello}){
const url=realtimeUrl();
if(!url)return null;
const ws=new WebSocket(url);
const send=data=>ws.readyState===WebSocket.OPEN&&ws.send(JSON.stringify(data));
ws.addEventListener("open",()=>onHello?.());
ws.addEventListener("message",e=>{try{const m=JSON.parse(e.data);if(m.type==="state"||m.type==="opponent_left")onState?.(m);else if(m.type==="room")onRoom?.(m);else if(m.type==="error")onError?.(m.message)}catch{}});
ws.addEventListener("error",()=>onError?.("Realtime connection failed"));
return {ws,send,close:()=>ws.close()};
}
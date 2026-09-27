import http from "node:http";
import { WebSocketServer } from "ws";
import { Chess } from "chess.js";
import { getUser, saveUser, snapshot as storeSnapshot } from "./store.js";
import { verifyTelegramInitData } from "./auth.js";
import { enqueue, remove, size as queueSize } from "./matchmaking.js";
import { createTournament, joinTournament, listTournaments } from "./tournaments.js";
import { handleApi } from "./api.js";

const PORT=process.env.PORT||8080;
const rooms=new Map();

function code(){return Math.random().toString(36).slice(2,8).toUpperCase()}
function send(ws,data){if(ws.readyState===1)ws.send(JSON.stringify(data))}
function snapshot(room){
return {type:"state",fen:room.game.fen(),history:room.game.history(),turn:room.game.turn(),status:room.status,players:room.players.map(p=>({id:p.id,name:p.name,rating:p.rating,color:p.color}))}
}
function broadcast(room,data){room.players.forEach(p=>send(p.ws,data))}
function createRoom(player){
let id=code();while(rooms.has(id))id=code();
const room={id,game:new Chess(),status:"waiting",players:[player],createdAt:Date.now(),clocks:{w:300,b:300}};
rooms.set(id,room);return room;
}
const server=http.createServer((req,res)=>{
res.writeHead(200,{"content-type":"application/json","access-control-allow-origin":"*"});
res.end(JSON.stringify({service:"ChessCoin realtime server",rooms:rooms.size,status:"ok",store:storeSnapshot(),queue:queueSize()}));
});
const wss=new WebSocketServer({server});

wss.on("connection",ws=>{
const player={id:Math.random().toString(36).slice(2),ws,name:"Player",rating:1200,color:null,room:null};
send(ws,{type:"hello",message:"ChessCoin realtime server ready",telegramAuthRequired:!!process.env.TELEGRAM_BOT_TOKEN});
ws.on("message",raw=>{
let m;try{m=JSON.parse(raw.toString())}catch{return}
if(m.type==="auth"){const auth=verifyTelegramInitData(m.initData||"");if(!auth.ok){send(ws,{type:"error",message:auth.error});return}const u=getUser(String(auth.user.id));u.name=auth.user.first_name||u.name;saveUser(u);player.id=String(auth.user.id);player.name=u.name;player.rating=u.rating;send(ws,{type:"auth",user:u});return}
if(m.type==="matchmake"){const match=enqueue({...player});if(!match){send(ws,{type:"queue",status:"waiting"});return}player.room=match.id;player.color="w";const opponent=match.players[1];opponent.room=match.id;opponent.color="b";const room={id:match.id,game:new Chess(),status:"playing",players:match.players,createdAt:Date.now(),clocks:{w:300,b:300}};rooms.set(room.id,room);match.players.forEach(p=>{send(p.ws,{type:"room",room:room.id,color:p.color});send(p.ws,snapshot(room))});return;}
if(m.type==="tournaments"){send(ws,{type:"tournaments",items:listTournaments()});return}
if(m.type==="create_tournament"){send(ws,{type:"tournament",item:createTournament({name:String(m.name||"ChessCoin Cup").slice(0,40),maxPlayers:Number(m.maxPlayers)||16})});return}
if(m.type==="join_tournament"){const t=joinTournament(String(m.id),{id:player.id,name:player.name,rating:player.rating});if(t)send(ws,{type:"tournament",item:t});else send(ws,{type:"error",message:"Tournament unavailable"});return;}
if(m.type==="create"){
const room=createRoom({...player,name:String(m.name||"Player").slice(0,18),rating:Number(m.rating)||1200,color:"w"});
player.room=room.id;room.players[0]=player;send(ws,{type:"room",room:room.id,color:"w"});broadcast(room,snapshot(room));return;
}
if(m.type==="join"){
const room=rooms.get(String(m.room||"").toUpperCase());
if(!room){send(ws,{type:"error",message:"Room not found"});return}
if(room.players.length>=2){send(ws,{type:"error",message:"Room is full"});return}
player.room=room.id;player.name=String(m.name||"Player").slice(0,18);player.rating=Number(m.rating)||1200;player.color="b";
room.players.push(player);room.status="playing";broadcast(room,snapshot(room));return;
}
const room=rooms.get(player.room);if(!room)return;
if(m.type==="move"){
if(room.status!=="playing")return;
if(room.game.turn()!==player.color){send(ws,{type:"error",message:"Not your turn"});return}
try{
const before=room.game.turn();
room.game.move({from:m.from,to:m.to,promotion:m.promotion||"q"});
if(before!==player.color)throw new Error("Not your turn");
if(room.game.isGameOver())room.status="finished";
broadcast(room,snapshot(room));
}catch{send(ws,{type:"error",message:"Illegal move"})}
}
if(m.type==="resign"){
room.status="finished";room.winner=player.color==="w"?"b":"w";broadcast(room,{...snapshot(room),winner:room.winner});
}
});
ws.on("close",()=>{remove(player.id);const room=rooms.get(player.room);if(!room)return;
room.players=room.players.filter(p=>p!==player);
if(room.players.length===0)rooms.delete(room.id);else{room.status="finished";broadcast(room,{...snapshot(room),type:"opponent_left"})}
});
});

setInterval(()=>{for(const room of rooms.values()){if(room.status!=="playing")continue;const color=room.game.turn();room.clocks[color]--;if(room.clocks[color]<=0){room.status="finished";room.winner=color==="w"?"b":"w";broadcast(room,{...snapshot(room),type:"timeout",winner:room.winner})}}},1000);
server.listen(PORT,()=>console.log(`ChessCoin server listening on :${PORT}`));
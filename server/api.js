import crypto from "node:crypto";
import { getUser, saveUser, listWaitingRooms } from "./store.js";
import { createTournament, joinTournament, listTournaments, getTournament } from "./tournaments.js";

export function json(res,status,data){
 res.writeHead(status,{"content-type":"application/json; charset=utf-8","access-control-allow-origin":"*","access-control-allow-methods":"GET,POST,OPTIONS","access-control-allow-headers":"content-type"});
 res.end(JSON.stringify(data));
}
export async function handleApi(req,res){
 if(req.method==="OPTIONS"){res.writeHead(204);return res.end()}
 const url=new URL(req.url,"http://localhost");
 if(url.pathname==="/api/health")return json(res,200,{ok:true,service:"chesscoin",version:"0.2"});
 if(url.pathname==="/api/leaderboard"){
  const sample=["KnightZero","QueenBee","RookMaster","ChessFox","PawnStorm"].map((name,i)=>({name,rating:1512-i*54}));
  return json(res,200,{items:sample});
 }
 if(url.pathname==="/api/tournaments"){
  if(req.method==="GET")return json(res,200,{items:listTournaments()});
  if(req.method==="POST"){
   let body={};try{body=JSON.parse(await readBody(req))}catch{}
   return json(res,201,{item:createTournament({name:body.name,maxPlayers:body.maxPlayers,entryCoins:0})});
  }
 }
 if(url.pathname.startsWith("/api/tournaments/")&&url.pathname.endsWith("/join")&&req.method==="POST"){
  const id=url.pathname.split("/")[3];let body={};try{body=JSON.parse(await readBody(req))}catch{}
  const t=joinTournament(id,{id:String(body.userId||crypto.randomUUID()),name:String(body.name||"Player"),rating:Number(body.rating)||1200});
  return t?json(res,200,{item:t}):json(res,404,{error:"Tournament unavailable"});
 }
 if(url.pathname==="/api/me"){
  const id=url.searchParams.get("userId")||"demo";
  return json(res,200,{user:getUser(id)});
 }
 return json(res,404,{error:"Not found"});
}
function readBody(req){return new Promise((resolve,reject)=>{let s="";req.on("data",c=>s+=c);req.on("end",()=>resolve(s));req.on("error",reject)})}
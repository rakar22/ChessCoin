import crypto from "node:crypto";
const queue=[];
export function enqueue(player){
 const existing=queue.findIndex(x=>x.id===player.id);
 if(existing>=0)queue.splice(existing,1);
 queue.push(player);
 return findMatch();
}
export function remove(id){
 const i=queue.findIndex(x=>x.id===id);
 if(i>=0)queue.splice(i,1);
}
export function findMatch(){
 if(queue.length<2)return null;
 const a=queue.shift(),b=queue.shift();
 return {id:crypto.randomBytes(4).toString("hex").toUpperCase(),players:[a,b],createdAt:Date.now()};
}
export function size(){return queue.length}
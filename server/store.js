const users=new Map();
const games=new Map();
const rooms=new Map();

export function getUser(id){
 if(!users.has(id))users.set(id,{id,name:"Player",rating:1200,wins:0,losses:0,draws:0,coins:250,games:0,streak:0});
 return users.get(id);
}
export function saveUser(user){users.set(user.id,user);return user}
export function createGame(data){games.set(data.id,data);return data}
export function getGame(id){return games.get(id)}
export function createRoom(data){rooms.set(data.id,data);return data}
export function getRoom(id){return rooms.get(id)}
export function deleteRoom(id){rooms.delete(id)}
export function listWaitingRooms(){return [...rooms.values()].filter(r=>r.status==="waiting")}
export function snapshot(){return {users:users.size,games:games.size,rooms:rooms.size}}
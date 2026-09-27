const tournaments=new Map();
export function createTournament({name,maxPlayers=16,entryCoins=0}){
 const id=Math.random().toString(36).slice(2,8).toUpperCase();
 const t={id,name,maxPlayers,entryCoins,status:"open",players:[],round:0,createdAt:Date.now()};
 tournaments.set(id,t);return t;
}
export function joinTournament(id,player){
 const t=tournaments.get(id);if(!t||t.status!=="open")return null;
 if(t.players.some(p=>p.id===player.id))return t;
 if(t.players.length>=t.maxPlayers)return null;
 t.players.push(player);
 if(t.players.length>=t.maxPlayers)t.status="ready";
 return t;
}
export function listTournaments(){return [...tournaments.values()].sort((a,b)=>b.createdAt-a.createdAt)}
export function getTournament(id){return tournaments.get(id)}
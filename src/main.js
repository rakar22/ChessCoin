import { Chess } from "chess.js";
import "./style.css";

const PIECES={w:{k:"♔",q:"♕",r:"♖",b:"♗",n:"♘",p:"♙"},b:{k:"♚",q:"♛",r:"♜",b:"♝",n:"♞",p:"♟"}};
const MODES={bullet:{name:"Bullet",time:60,increment:0},blitz:{name:"Blitz",time:180,increment:0},rapid:{name:"Rapid",time:300,increment:0}};
const KEY="chesscoin-profile-v2";
const DEFAULT={name:"Player",rating:1200,wins:0,losses:0,draws:0,coins:250,games:0,streak:0,lastBonus:""};
let profile={...DEFAULT,...JSON.parse(localStorage.getItem(KEY)||"{}")};
let mode="rapid", game=new Chess(), selected=null, targets=[], over=false, clocks={w:300,b:300}, timer=null, screen="play", result=null, sound=true;
const app=document.querySelector("#app");

function save(){localStorage.setItem(KEY,JSON.stringify(profile))}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function fmt(sec){sec=Math.max(0,sec);return String(Math.floor(sec/60)).padStart(2,"0")+":"+String(sec%60).padStart(2,"0")}
function avatar(){return esc((profile.name||"P").slice(0,1).toUpperCase())}
function nav(){
return `<nav class="nav"><button class="nav-item ${screen==="play"?"active":""}" data-screen="play"><b>♟</b><span>Play</span></button><button class="nav-item ${screen==="rank":""}" data-screen="rank"><b>♛</b><span>Ranking</span></button><button class="nav-item ${screen==="profile"?"active":""}" data-screen="profile"><b>◉</b><span>Profile</span></button></nav>`;
}
function header(){
return `<header class="topbar"><button class="brand" data-screen="play"><span>♞</span><strong>ChessCoin</strong></button><div class="top-actions"><span class="coins">◈ ${profile.coins}</span><button class="wallet" id="wallet">Connect wallet</button></div></header>`;
}
function render(){
app.innerHTML=header()+(screen==="play"?playScreen():screen==="rank"?rankScreen():profileScreen())+nav();
bindCommon();
if(screen==="play")bindGame();
}
function playScreen(){
return `<main class="page">
<section class="hero"><div><span class="eyebrow">CHESS ARENA</span><h1>Play chess.<br><em>Climb the board.</em></h1><p>Fast matches, ELO progression and virtual rewards.</p></div><div class="rating"><small>RATING</small><strong>${profile.rating}</strong></div></section>
<section class="modes">
${Object.entries(MODES).map(([id,m])=>`<button class="mode ${mode===id?"selected":""}" data-mode="${id}"><strong>${m.name}</strong><span>${m.time/60}${m.time>=60?" min":""} · 0 inc</span></button>`).join("")}
</section>
${gamePanel()}
<section class="quick-grid"><button class="card-action" id="daily"><span>◈</span><strong>Daily bonus</strong><small>Claim 50 coins</small></button><button class="card-action" id="challenge"><span>↗</span><strong>Challenge</strong><small>Share a game code</small></button></section>
<section class="notice"><b>Virtual economy</b><span>Coins and rewards have no cash value in this version.</span></section>
</main>`;
}
function gamePanel(){
return `<section class="game-card">
<div class="player-line"><div class="user"><div class="avatar">C</div><div><strong>ChessCoin Opponent</strong><small>Black · ${profile.rating}</small></div></div><div class="clock ${game.turn()==="b"?"active":""}" id="blackClock">${fmt(clocks.b)}</div></div>
<div class="board-wrap"><div id="board" class="board" role="grid"></div></div>
<div class="player-line"><div class="user"><div class="avatar me">${avatar()}</div><div><strong>${esc(profile.name)}</strong><small>White · ${profile.rating}</small></div></div><div class="clock ${game.turn()==="w"?"active":""}" id="whiteClock">${fmt(clocks.w)}</div></div>
<div class="status" id="status">${statusText()}</div>
<div class="game-actions"><button class="secondary" id="newGame">New game</button><button class="danger" id="resign">Resign</button></div>
<div class="moves-head"><span>Moves</span><span id="moveCount">${game.history().length}</span></div><div id="moves" class="moves">${movesHTML()}</div>
</section>`;
}
function statusText(){
if(result)return result;
if(game.isCheck())return game.turn()==="w"?"Check — your turn":"Check — opponent's turn";
return game.turn()==="w"?"Your turn":"Opponent's turn";
}
function movesHTML(){
const h=game.history();let out="";
for(let i=0;i<h.length;i+=2)out+=`<div><small>${i/2+1}.</small><span>${esc(h[i])}</span><span>${esc(h[i+1]||"")}</span></div>`;
return out||'<div class="empty">Make the first move</div>';
}
function renderBoard(){
const b=document.querySelector("#board");if(!b)return;b.innerHTML="";
game.board().forEach((row,r)=>row.forEach((piece,f)=>{
const sq=String.fromCharCode(97+f)+(8-r),el=document.createElement("button");
el.className="square "+((r+f)%2?"dark":"light")+(selected===sq?" selected":"")+(targets.includes(sq)?" legal":"");
if(targets.includes(sq)&&piece)el.classList.add("capture");
el.setAttribute("aria-label",sq);
if(piece)el.innerHTML=`<span class="piece ${piece.color}">${PIECES[piece.color][piece.type]}</span>`;
el.onclick=()=>squareClick(sq);b.appendChild(el);
}));
}
function squareClick(sq){
if(over||game.turn()!=="w")return;
if(selected&&targets.includes(sq)){
try{game.move({from:selected,to:sq,promotion:"q"});profile.games++;selected=null;targets=[];afterMove();return}catch{}
}
const p=game.get(sq);
if(p?.color==="w"){selected=sq;targets=game.moves({square:sq,verbose:true}).map(x=>x.to)}else{selected=null;targets=[]}
renderBoard();
}
function afterMove(){
if(game.isGameOver()){finish(game.isCheckmate()?(game.turn()==="w"?"loss":"win"):"draw");return}
clocks.w+=MODES[mode].increment;renderBoard();render();startTimer();
}
function finish(kind){
over=true;stopTimer();
if(kind==="win"){profile.wins++;profile.streak++;profile.coins+=mode==="bullet"?15:mode==="blitz"?20:25;profile.rating+=8;result="Victory — +${mode==="bullet"?15:mode==="blitz"?20:25} coins"}
else if(kind==="loss"){profile.losses++;profile.streak=0;profile.rating=Math.max(100,profile.rating-8);result="Defeat — keep playing"}
else{profile.draws++;profile.coins+=5;result="Draw — +5 coins"}
save();render();
}
function reset(){
stopTimer();game=new Chess();selected=null;targets=[];over=false;result=null;clocks={w:MODES[mode].time,b:MODES[mode].time};render();startTimer();
}
function startTimer(){
stopTimer();timer=setInterval(()=>{if(over)return;const c=game.turn();clocks[c]--;if(clocks[c]<=0){finish(c==="w"?"loss":"win");return}const w=document.querySelector("#whiteClock"),b=document.querySelector("#blackClock");if(w){w.textContent=fmt(clocks.w);w.classList.toggle("active",c==="w")}if(b){b.textContent=fmt(clocks.b);b.classList.toggle("active",c==="b")}},1000)
}
function stopTimer(){if(timer){clearInterval(timer);timer=null}}
function bindCommon(){
document.querySelectorAll("[data-screen]").forEach(x=>x.onclick=()=>{screen=x.dataset.screen;stopTimer();render()});
document.querySelector("#wallet")?.addEventListener("click",()=>alert("TON Connect is prepared as a future integration. No blockchain transaction is enabled in this release."));
}
function bindGame(){
document.querySelectorAll("[data-mode]").forEach(x=>x.onclick=()=>{mode=x.dataset.mode;reset()});
document.querySelector("#newGame")?.addEventListener("click",reset);
document.querySelector("#resign")?.addEventListener("click",()=>{if(!over&&confirm("Resign this game?"))finish("loss")});
document.querySelector("#daily")?.addEventListener("click",()=>{
const today=new Date().toISOString().slice(0,10);
if(profile.lastBonus===today){alert("Daily bonus already claimed.");return}
profile.lastBonus=today;profile.coins+=50;save();render();
});
document.querySelector("#challenge")?.addEventListener("click",()=>{const code=Math.random().toString(36).slice(2,8).toUpperCase();navigator.clipboard?.writeText(code);alert("Challenge code: "+code+"\nCopied when supported.")});
renderBoard();
}
function rankScreen(){
const players=[["KnightZero",1512],["QueenBee",1468],["RookMaster",1395],["ChessFox",1322],["PawnStorm",1288],[profile.name,profile.rating]].sort((a,b)=>b[1]-a[1]);
return `<main class="page"><div class="section-hero"><span class="eyebrow">LEADERBOARD</span><h2>Global ranking</h2><p>Climb by winning rated games.</p></div><div class="leaderboard">${players.map((p,i)=>`<div class="rank-row ${p[0]===profile.name?"me-row":""}"><span class="pos">${i+1}</span><div class="rank-avatar">${esc(p[0][0])}</div><strong>${esc(p[0])}</strong><span>${p[1]}</span></div>`).join("")}</div><div class="notice"><b>ELO</b><span>Rated results are stored locally in this release; online account sync comes in the multiplayer backend.</span></div></main>`;
}
function profileScreen(){
const total=profile.wins+profile.losses+profile.draws, wr=total?Math.round(profile.wins/total*100):0;
return `<main class="page"><section class="profile-card"><div class="big-avatar">${avatar()}</div><div><span class="eyebrow">PLAYER PROFILE</span><h2>${esc(profile.name)}</h2><p>Rating ${profile.rating} · ${profile.coins} coins</p></div></section>
<section class="stats"><div><b>${profile.games}</b><small>Games</small></div><div><b>${profile.wins}</b><small>Wins</small></div><div><b>${wr}%</b><small>Win rate</small></div><div><b>${profile.streak}</b><small>Streak</small></div></section>
<section class="settings"><label>Display name<input id="nameInput" maxlength="18" value="${esc(profile.name)}"></label><button id="saveName">Save profile</button></section>
<section class="notice"><b>Telegram Mini App ready</b><span>The UI is mobile-first and can be launched from a Telegram bot. Authentication, matchmaking and TON Connect require the production backend.</span></section></main>`;
}
document.addEventListener("click",e=>{if(e.target.id==="saveName"){const v=document.querySelector("#nameInput").value.trim();if(v){profile.name=v;save();render()}}});
render();startTimer();
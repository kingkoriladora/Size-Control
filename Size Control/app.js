const player = document.getElementById("player");
const game = document.getElementById("game");
const menu = document.getElementById("menu");
const scoreText = document.getElementById("score");

let mode = "endless";
let size = 1;
let score = 0;
let speed = 5;

player.classList.add("medium");

function startGame(m){
  mode = m;
  menu.classList.add("hidden");
  game.classList.remove("hidden");

  score = 0;
  speed = 5;

  loop();
}

function updateSize(){
  player.classList.remove("small","medium","big");
  if(size===0) player.classList.add("small");
  if(size===1) player.classList.add("medium");
  if(size===2) player.classList.add("big");
}

document.addEventListener("keydown",(e)=>{
  if(e.key==="ArrowUp"){ size=Math.min(2,size+1); }
  if(e.key==="ArrowDown"){ size=Math.max(0,size-1); }
  updateSize();
});

function spawnObstacle(){
  const obs=document.createElement("div");
  obs.classList.add("obstacle");

  let type=Math.floor(Math.random()*3);

  if(type===0){
    obs.style.height="50px";
    obs.dataset.type="small";
    obs.style.background="#3b82f6";
  }

  if(type===1){
    obs.style.height="80px";
    obs.dataset.type="medium";
    obs.style.background="#a855f7";
  }

  if(type===2){
    obs.style.height="120px";
    obs.dataset.type="big";
    obs.style.background="#ef4444";
  }

  obs.style.left="800px";
  obs.style.top="180px";

  game.appendChild(obs);

  move(obs);
}

function move(obs){
  let x=800;

  let interval=setInterval(()=>{
    x-=speed;
    obs.style.left=x+"px";

    if(x<120){
      if(!check(obs)){
        gameOver();
      }
    }

    if(x<-50){
      obs.remove();
      clearInterval(interval);
    }
  },20);
}

function check(obs){
  if(obs.dataset.type==="small" && size===0) return true;
  if(obs.dataset.type==="medium" && size===1) return true;
  if(obs.dataset.type==="big" && size===2) return true;
  return false;
}

function loop(){
  setInterval(()=>{
    spawnObstacle();
  },1000);

  setInterval(()=>{
    score++;
    speed+=0.1;
    scoreText.textContent=score;
  },500);
}

function gameOver(){
  alert("GAME OVER\nScore:"+score);
  location.reload();
}
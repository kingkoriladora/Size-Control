// =========================
// Supabase settings
// =========================
const SUPABASE_URL = "https://hzdmcjigfnhihcxextby.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_28cBEjPz8adEcrzh_7Tjag_77SJqXQ8";

let supabaseClient = null;

if (
  SUPABASE_URL !== "YOUR_SUPABASE_URL" &&
  SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY" &&
  window.supabase
) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// =========================
// Elements
// =========================
const menuScreen = document.getElementById("menuScreen");
const gameScreen = document.getElementById("gameScreen");
const resultScreen = document.getElementById("resultScreen");
const rankingScreen = document.getElementById("rankingScreen");

const endlessBtn = document.getElementById("endlessBtn");
const courseBtn = document.getElementById("courseBtn");
const rankingBtn = document.getElementById("rankingBtn");

const modeText = document.getElementById("modeText");
const stageText = document.getElementById("stageText");
const distanceText = document.getElementById("distanceText");
const sizeText = document.getElementById("sizeText");

const gameArea = document.getElementById("gameArea");
const player = document.getElementById("player");
const stageBanner = document.getElementById("stageBanner");

const resultTitle = document.getElementById("resultTitle");
const resultMode = document.getElementById("resultMode");
const resultStage = document.getElementById("resultStage");
const resultDistance = document.getElementById("resultDistance");
const retryBtn = document.getElementById("retryBtn");
const menuBtnFromResult = document.getElementById("menuBtnFromResult");

const saveScoreArea = document.getElementById("saveScoreArea");
const playerNameInput = document.getElementById("playerNameInput");
const saveScoreBtn = document.getElementById("saveScoreBtn");
const saveStatus = document.getElementById("saveStatus");

const refreshRankingBtn = document.getElementById("refreshRankingBtn");
const menuBtnFromRanking = document.getElementById("menuBtnFromRanking");
const rankingStatus = document.getElementById("rankingStatus");
const rankingBody = document.getElementById("rankingBody");

// =========================
// Game state
// =========================
let currentMode = "endless";
let currentStage = 1;

let gameRunning = false;
let animationId = null;
let obstacleSpawnCounter = 0;
let distance = 0;
let speed = 6;

let playerSize = 1; // 0 small, 1 medium, 2 big
let obstacles = [];

const stageGoals = {
  1: 700,
  2: 1000,
  3: 1300
};

const stageSpeeds = {
  1: 5.5,
  2: 6.4,
  3: 7.2
};

// =========================
// Utils
// =========================
function showScreen(screen) {
  [menuScreen, gameScreen, resultScreen, rankingScreen].forEach((s) => {
    s.classList.remove("active");
  });
  screen.classList.add("active");
}

function getPlayerPixelSize() {
  if (playerSize === 0) return 28;
  if (playerSize === 1) return 44;
  return 64;
}

function getTopY() {
  return 90 - getPlayerPixelSize() / 2 + 4;
}

function getBottomY() {
  return gameArea.clientHeight - 90 - getPlayerPixelSize() / 2 - 4;
}

function setPlayerClass() {
  player.classList.remove("small", "medium", "big");
  if (playerSize === 0) {
    player.classList.add("small");
    sizeText.textContent = "SMALL";
  } else if (playerSize === 1) {
    player.classList.add("medium");
    sizeText.textContent = "MEDIUM";
  } else {
    player.classList.add("big");
    sizeText.textContent = "BIG";
  }

  player.style.top = getBottomY() + "px";
}

function updateHUD() {
  modeText.textContent = currentMode.toUpperCase();
  stageText.textContent = currentMode === "course" ? currentStage : "-";
  distanceText.textContent = Math.floor(distance);
}

function clearObstacles() {
  obstacles.forEach((obs) => obs.remove());
  obstacles = [];
}

function stopGame() {
  gameRunning = false;
  if (animationId) cancelAnimationFrame(animationId);
  animationId = null;
}

function showBanner(text) {
  stageBanner.textContent = text;
  stageBanner.classList.remove("hidden");

  setTimeout(() => {
    stageBanner.classList.add("hidden");
  }, 900);
}

// =========================
// Menu actions
// =========================
endlessBtn.addEventListener("click", () => {
  currentMode = "endless";
  startGame();
});

courseBtn.addEventListener("click", () => {
  currentMode = "course";
  currentStage = 1;
  startGame();
});

rankingBtn.addEventListener("click", async () => {
  showScreen(rankingScreen);
  await loadRanking();
});

menuBtnFromResult.addEventListener("click", () => {
  showScreen(menuScreen);
});

menuBtnFromRanking.addEventListener("click", () => {
  showScreen(menuScreen);
});

retryBtn.addEventListener("click", () => {
  startGame();
});

refreshRankingBtn.addEventListener("click", async () => {
  await loadRanking();
});

// =========================
// Start game
// =========================
function startGame() {
  stopGame();
  clearObstacles();

  distance = 0;
  obstacleSpawnCounter = 0;
  playerSize = 1;
  setPlayerClass();

  if (currentMode === "endless") {
    speed = 6;
    showScreen(gameScreen);
    showBanner("ENDLESS");
    updateHUD();
    setTimeout(beginLoop, 700);
  } else {
    speed = stageSpeeds[currentStage];
    showScreen(gameScreen);
    showBanner(`STAGE ${currentStage}`);
    updateHUD();
    setTimeout(beginLoop, 700);
  }
}

function beginLoop() {
  gameRunning = true;
  loop();
}

// =========================
// Controls
// =========================
document.addEventListener("keydown", (e) => {
  if (!gameRunning) return;

  const key = e.key.toLowerCase();

  if (key === "arrowup" || key === "w") {
    playerSize = Math.min(2, playerSize + 1);
    setPlayerClass();
  }

  if (key === "arrowdown" || key === "s") {
    playerSize = Math.max(0, playerSize - 1);
    setPlayerClass();
  }
});

// =========================
// Obstacles
// =========================
function spawnObstacle() {
  const obstacle = document.createElement("div");
  obstacle.classList.add("obstacle");

  const type = Math.floor(Math.random() * 3); // 0 small 1 medium 2 big
  obstacle.dataset.required = String(type);

  if (type === 0) {
    obstacle.classList.add("small-gate");
    obstacle.style.height = "58px";
  } else if (type === 1) {
    obstacle.classList.add("medium-gate");
    obstacle.style.height = "86px";
  } else {
    obstacle.classList.add("big-gate");
    obstacle.style.height = "122px";
  }

  obstacle.style.left = gameArea.clientWidth + "px";
  obstacle.style.top = gameArea.clientHeight - 90 - parseFloat(obstacle.style.height) / 2 + "px";

  gameArea.appendChild(obstacle);
  obstacles.push(obstacle);
}

function moveObstacles() {
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    const left = parseFloat(obs.style.left) - speed;
    obs.style.left = left + "px";

    if (left < -80) {
      obs.remove();
      obstacles.splice(i, 1);
    }
  }
}

function checkCollision() {
  const playerRect = player.getBoundingClientRect();

  for (const obs of obstacles) {
    const obsRect = obs.getBoundingClientRect();
    const hit =
      playerRect.left < obsRect.right &&
      playerRect.right > obsRect.left &&
      playerRect.top < obsRect.bottom &&
      playerRect.bottom > obsRect.top;

    if (hit) {
      const required = Number(obs.dataset.required);
      if (required !== playerSize) {
        gameOver();
        return;
      }
    }
  }
}

// =========================
// Main loop
// =========================
function loop() {
  if (!gameRunning) return;

  distance += speed * 0.55;
  obstacleSpawnCounter++;

  if (currentMode === "endless") {
    speed += 0.0025;
  }

  const spawnRate = currentMode === "endless" ? 78 : Math.max(58, 84 - currentStage * 8);

  if (obstacleSpawnCounter >= spawnRate) {
    spawnObstacle();
    obstacleSpawnCounter = 0;
  }

  moveObstacles();
  checkCollision();
  updateHUD();

  if (currentMode === "course") {
    const goal = stageGoals[currentStage];
    if (distance >= goal) {
      stageClear();
      return;
    }
  }

  animationId = requestAnimationFrame(loop);
}

// =========================
// Stage clear / Game over
// =========================
function stageClear() {
  stopGame();
  clearObstacles();

  if (currentStage >= 3) {
    resultTitle.textContent = "ALL CLEAR";
    resultMode.textContent = "MODE: COURSE";
    resultStage.textContent = `STAGE: ${currentStage}`;
    resultDistance.textContent = `DISTANCE: ${Math.floor(distance)}`;
    saveScoreArea.classList.add("hidden");
    showScreen(resultScreen);
    return;
  }

  currentStage++;
  showScreen(gameScreen);
  showBanner(`STAGE ${currentStage}`);
  distance = 0;
  speed = stageSpeeds[currentStage];
  obstacleSpawnCounter = 0;
  setTimeout(beginLoop, 700);
}

function gameOver() {
  stopGame();

  resultTitle.textContent = "GAME OVER";
  resultMode.textContent = `MODE: ${currentMode.toUpperCase()}`;
  resultStage.textContent = currentMode === "course" ? `STAGE: ${currentStage}` : "STAGE: -";
  resultDistance.textContent = `DISTANCE: ${Math.floor(distance)}`;
  saveStatus.textContent = "";
  playerNameInput.value = "";

  if (currentMode === "endless") {
    saveScoreArea.classList.remove("hidden");
  } else {
    saveScoreArea.classList.add("hidden");
  }

  showScreen(resultScreen);
}

// =========================
// Ranking save / load
// =========================
saveScoreBtn.addEventListener("click", async () => {
  if (!supabaseClient) {
    saveStatus.textContent = "Supabase URL / key を入れてな。";
    return;
  }

  const name = playerNameInput.value.trim();
  if (!name) {
    saveStatus.textContent = "名前を入れてな。";
    return;
  }

  saveStatus.textContent = "Saving...";

  const score = Math.floor(distance);

  const { error } = await supabaseClient
    .from("size_control_scores")
    .insert([
      {
        player_name: name,
        mode: "endless",
        score: score
      }
    ]);

  if (error) {
    saveStatus.textContent = "保存失敗: " + error.message;
    return;
  }

  saveStatus.textContent = "保存できた。";
});

async function loadRanking() {
  rankingBody.innerHTML = "";

  if (!supabaseClient) {
    rankingStatus.textContent = "Supabase URL / key を app.js に入れてな。";
    return;
  }

  rankingStatus.textContent = "Loading...";

  const { data, error } = await supabaseClient
    .from("size_control_scores")
    .select("player_name, score")
    .eq("mode", "endless")
    .order("score", { ascending: false })
    .limit(20);

  if (error) {
    rankingStatus.textContent = "読み込み失敗: " + error.message;
    return;
  }

  rankingStatus.textContent = data.length ? "Top scores" : "No scores yet";

  data.forEach((row, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${escapeHtml(row.player_name)}</td>
      <td>${row.score}</td>
    `;
    rankingBody.appendChild(tr);
  });
}

function escapeHtml(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// =========================
// Initial
// =========================
setPlayerClass();
updateHUD();

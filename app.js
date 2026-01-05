const TOTAL_QUESTIONS = 10;

let cards = [];
let deck = [];
let idx = 0;
let score = 0;
let locked = false;

const cardImg = document.getElementById('cardImg');
const dropTarget = document.getElementById('dropTarget');
const feedback = document.getElementById('feedback');
const qIndexEl = document.getElementById('qIndex');
const qTotalEl = document.getElementById('qTotal');
const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restartBtn');

const endDialog = document.getElementById('endDialog');
const finalScoreEl = document.getElementById('finalScore');
const finalMsgEl = document.getElementById('finalMsg');
const playAgainBtn = document.getElementById('playAgainBtn');

qTotalEl.textContent = String(TOTAL_QUESTIONS);

function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function loadCards(){
  const res = await fetch('data/cards.json', { cache: 'no-store' });
  cards = await res.json();
}

function newGame(){
  locked = false;
  idx = 0;
  score = 0;
  scoreEl.textContent = '0';
  feedback.className = 'feedback';
  feedback.textContent = '';
  deck = shuffle([...cards]).slice(0, TOTAL_QUESTIONS);
  showCard();
}

function showCard(){
  const current = deck[idx];
  if(!current){
    endGame();
    return;
  }
  qIndexEl.textContent = String(idx + 1);
  feedback.className = 'feedback';
  feedback.textContent = '';
  cardImg.src = current.file;
  cardImg.dataset.op = current.op;
}

function markAnswer(isGood, expectedOp){
  if(isGood){
    score++;
    scoreEl.textContent = String(score);
    feedback.textContent = '✅ Correct !';
    feedback.className = 'feedback good';
  } else {
    const pretty = expectedOp === 'x' ? '×' : expectedOp;
    feedback.textContent = `❌ Pas tout à fait. C'était : ${pretty}`;
    feedback.className = 'feedback bad';
  }
}

function next(){
  idx++;
  if(idx >= TOTAL_QUESTIONS){
    endGame();
  } else {
    showCard();
  }
}

function endGame(){
  finalScoreEl.textContent = String(score);
  let msg = '';
  if(score === 10) msg = 'Bravo !';
  else if(score >= 8) msg = 'Très bien !';
  else if(score >= 6) msg = 'Bien, encore un petit effort 🙂';
  else msg = 'On s’entraîne et ça va venir 💪';
  finalMsgEl.textContent = msg;
  endDialog.showModal();
}

function answer(op){
  if(locked) return;
  locked = true;
  const expected = cardImg.dataset.op;
  const ok = (op === expected);
  markAnswer(ok, expected);
  setTimeout(() => {
    locked = false;
    next();
  }, 900);
}

// DRAG: operation tile -> card (beaucoup plus fiable que carte -> case)
document.querySelectorAll('.opTile').forEach(tile => {
  tile.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', tile.dataset.op);
    e.dataTransfer.effectAllowed = 'move';
  });
  tile.addEventListener('click', () => {
    answer(tile.dataset.op);
  });
});

// Drop target
['dragenter','dragover'].forEach(ev => {
  dropTarget.addEventListener(ev, (e) => {
    e.preventDefault(); // indispensable pour autoriser le drop
    dropTarget.classList.add('over');
  });
});
dropTarget.addEventListener('dragleave', () => dropTarget.classList.remove('over'));
dropTarget.addEventListener('drop', (e) => {
  e.preventDefault();
  dropTarget.classList.remove('over');
  const op = e.dataTransfer.getData('text/plain');
  if(op) answer(op);
});

// Buttons
restartBtn.addEventListener('click', () => {
  if(endDialog.open) endDialog.close();
  newGame();
});
playAgainBtn.addEventListener('click', () => {
  endDialog.close();
  newGame();
});

(async function init(){
  await loadCards();
  newGame();
})();
const TOTAL_QUESTIONS = 10;

let cards = [];
let deck = [];
let idx = 0;
let score = 0;
let locked = false;

const cardImg = document.getElementById('cardImg');
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
  cardImg.style.transform = 'translate(0px, 0px)';
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

function handleDrop(op){
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

// Desktop drag & drop
cardImg.addEventListener('dragstart', (e) => {
  e.dataTransfer.setData('text/plain', cardImg.dataset.op);
  e.dataTransfer.effectAllowed = 'move';
});

document.querySelectorAll('.bin').forEach(bin => {
  bin.addEventListener('dragover', (e) => {
    e.preventDefault();
    bin.classList.add('over');
  });
  bin.addEventListener('dragleave', () => bin.classList.remove('over'));
  bin.addEventListener('drop', (e) => {
    e.preventDefault();
    bin.classList.remove('over');
    handleDrop(bin.dataset.op);
  });
});

// Touch / tablet pointer-drag
let dragging = false;
let startX = 0, startY = 0;
let curX = 0, curY = 0;

function setTranslate(x, y){
  cardImg.style.transform = `translate(${x}px, ${y}px)`;
}

cardImg.addEventListener('pointerdown', (e) => {
  dragging = true;
  cardImg.setPointerCapture(e.pointerId);
  startX = e.clientX;
  startY = e.clientY;
  curX = 0; curY = 0;
});

cardImg.addEventListener('pointermove', (e) => {
  if(!dragging) return;
  curX = e.clientX - startX;
  curY = e.clientY - startY;
  setTranslate(curX, curY);

  document.querySelectorAll('.bin').forEach(b => b.classList.remove('over'));
  const el = document.elementFromPoint(e.clientX, e.clientY);
  const bin = el && el.closest && el.closest('.bin');
  if(bin) bin.classList.add('over');
});

function endPointerDrag(e){
  if(!dragging) return;
  dragging = false;
  document.querySelectorAll('.bin').forEach(b => b.classList.remove('over'));

  const el = document.elementFromPoint(e.clientX, e.clientY);
  const bin = el && el.closest && el.closest('.bin');
  if(bin){
    handleDrop(bin.dataset.op);
  } else {
    cardImg.style.transform = 'translate(0px, 0px)';
  }
}

cardImg.addEventListener('pointerup', endPointerDrag);
cardImg.addEventListener('pointercancel', endPointerDrag);

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
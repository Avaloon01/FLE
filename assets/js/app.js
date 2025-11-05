
// Simple store using localStorage
const Store = {
  key: 'flevocab.users',
  _read() {
    try { return JSON.parse(localStorage.getItem(this.key) || '{}'); } catch { return {}; }
  },
  _write(obj){ localStorage.setItem(this.key, JSON.stringify(obj)); },
  getCurrentUser(){
    const all = this._read();
    const u = localStorage.getItem('flevocab.currentUser') || '';
    return u && all[u] ? {id:u, data:all[u]} : null;
  },
  setCurrentUser(name){
    localStorage.setItem('flevocab.currentUser', name);
    const all = this._read();
    if(!all[name]) all[name] = { progress:{}, createdAt: Date.now() };
    this._write(all);
  },
  record(theme, correct){
    const user = this.getCurrentUser(); if(!user) return;
    const all = this._read();
    const u = user.id;
    all[u].progress[theme] = all[u].progress[theme] || { attempts:0, correct:0 };
    all[u].progress[theme].attempts += 1;
    if(correct) all[u].progress[theme].correct += 1;
    this._write(all);
  }
};

// Speech synthesis helper
const say = (text, {lang='fr-FR'}={}) => {
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  speechSynthesis.speak(utter);
};

// Fetch vocabulary
async function loadVocab(){
  const res = await fetch('data/vocab.json');
  if(!res.ok) throw new Error('Impossible de charger vocab.json');
  return await res.json();
}

// Build theme cards
function themeCards(vocab){
  return Object.keys(vocab).map(theme => {
    const tslug = theme.toLowerCase().replace(/[^a-z0-9]+/g,'-');
    return `
      <div class="card">
        <h3>${theme}</h3>
        <div class="kpis small">
          <div><span class="badge">${vocab[theme].length} mots</span></div>
        </div>
        <div class="options">
          <a class="btn" href="vocab.html?theme=${encodeURIComponent(theme)}">Vocabulaire</a>
          <a class="btn" href="game.html?theme=${encodeURIComponent(theme)}">Jouer</a>
        </div>
      </div>`;
  }).join('');
}

// Parse query
function getParam(name){
  const u = new URL(location.href);
  return u.searchParams.get(name);
}

// Shuffle
function shuffle(arr){ return arr.sort(() => Math.random()-0.5); }

// Pick n distinct random items (shallow)
function pickN(arr, n){
  const a = [...arr]; shuffle(a); return a.slice(0, n);
}

// Render progress bars
function progressFor(theme){
  const user = Store.getCurrentUser();
  if(!user || !user.data.progress[theme]) return null;
  return user.data.progress[theme];
}

window.FLEVocab = { Store, say, loadVocab, themeCards, getParam, shuffle, pickN, progressFor };

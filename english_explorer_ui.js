/*
---------------------------------------------------------
 English Explorer v3.2 – UI / Engine (Math Tinik Theme)
 + Read Aloud Toggle Update
---------------------------------------------------------
*/

const EE = {
  version: "3.2",
  player: {
    name: "",
    level: "easy",
    bestScore: 0,
    totalAttempts: 0,
    lastTopic: "grammar_easy"
  },
  theme: {
    bgGradient: "linear-gradient(180deg,#a8d8ea 0%,#c7f9cc 60%,#fef9d9 100%)",
    cardBg: "rgba(255,255,255,0.9)",
    mainBtn: "#3d5af1",
    hoverBtn: "#ffd460",
    accent2: "#fbc4ab",
    text: "#222"
  }
};

// ---------- localStorage ----------
EE.saveProfile = () =>
  localStorage.setItem("EE_profile", JSON.stringify(EE.player));
EE.loadProfile = () => {
  const d = localStorage.getItem("EE_profile");
  if (d) try { EE.player = JSON.parse(d); } catch (e) { console.warn(e); }
};

// ---------- helpers ----------
EE.makeEl = (t, c, h) => {
  const e = document.createElement(t);
  if (c) e.className = c;
  if (h !== undefined) e.innerHTML = h;
  return e;
};
EE.clearScreen = function () {
  document.body.innerHTML = "";
  document.body.style.margin = "0";
  document.body.style.height = "100vh";
  document.body.style.background = EE.theme.bgGradient;
  document.body.style.fontFamily = "'Poppins',sans-serif";
  document.body.style.color = EE.theme.text;
  document.body.style.backgroundAttachment = "fixed";
  document.body.style.backgroundSize = "cover";
};

// ---------- Speech Toggle ----------
EE.toggleSpeech = function (btn, text) {
  const synth = window.speechSynthesis;
  if (btn.dataset.playing === "true") {
    synth.cancel();
    btn.dataset.playing = "false";
    btn.style.background = EE.theme.mainBtn;
    btn.textContent = "🔊 Read Aloud";
    return;
  }
  const u = new SpeechSynthesisUtterance(text);
  u.onend = () => {
    btn.dataset.playing = "false";
    btn.style.background = EE.theme.mainBtn;
    btn.textContent = "🔊 Read Aloud";
  };
  btn.dataset.playing = "true";
  btn.style.background = EE.theme.hoverBtn;
  btn.textContent = "⏸ Stop Reading";
  synth.cancel();
  synth.speak(u);
};

// ---------- Welcome ----------
EE.showWelcome = function () {
  EE.clearScreen();
  const wrap = EE.makeEl("div", "ee-wrap");
  Object.assign(wrap.style, {
    maxWidth: "600px",
    margin: "60px auto",
    textAlign: "center",
    padding: "30px",
    background: EE.theme.cardBg,
    borderRadius: "20px",
    boxShadow: "0 0 20px rgba(0,0,0,0.05)"
  });
  wrap.innerHTML = `<h2 style="color:${EE.theme.mainBtn};font-size:28px;">🌈 English Explorer</h2>`;
  const input = EE.makeEl("input", "ee-name");
  Object.assign(input.style, {
    padding: "10px", fontSize: "18px",
    border: `2px solid ${EE.theme.mainBtn}`,
    borderRadius: "8px", width: "80%", marginTop: "20px"
  });
  input.placeholder = "Enter your name";
  if (EE.player.name) input.value = EE.player.name;
  const btn = EE.makeEl("button", "ee-btn", "Start Learning ➜");
  btn.onclick = () => {
    EE.player.name = input.value.trim() || "Explorer";
    EE.saveProfile();
    EE.showMainMenu();
  };
  wrap.append(input, btn);
  document.body.appendChild(wrap);
};

// ---------- Main Menu ----------
EE.showMainMenu = function () {
  EE.clearScreen();
  const w = EE.makeEl("div", "ee-menu");
  Object.assign(w.style, {
    maxWidth: "700px", margin: "40px auto", textAlign: "center",
    background: EE.theme.cardBg, padding: "25px", borderRadius: "16px",
    boxShadow: "0 0 20px rgba(0,0,0,0.08)"
  });
  w.innerHTML = `
    <h2 style="color:${EE.theme.mainBtn}">Hi ${EE.player.name}! 👋</h2>
    <p>Best Score: ${EE.player.bestScore}%<br>
    Level: <b>${EE.player.level}</b><br>
    Attempts: ${EE.player.totalAttempts}</p>`;
  const modes = [
    ["🧠 Practice", "EE.chooseTopic()"],
    ["📖 Reading", "EE.startReading()"],
    ["🧩 Exam Mode", "EE.startExam()"],
    ["⚙️ Reset Progress", "EE.resetProgress()"]
  ];
  modes.forEach(m => {
    const b = EE.makeEl("button", "ee-btn", m[0]);
    b.onclick = () => eval(m[1]);
    w.appendChild(b);
  });
  document.body.appendChild(w);
};

// ---------- Difficulty logic ----------
EE.adjustLevel = score => {
  const lvl = EE.player.level;
  if (score >= 80 && lvl === "easy") EE.player.level = "average";
  else if (score >= 80 && lvl === "average") EE.player.level = "difficult";
  else if (score < 50 && lvl === "difficult") EE.player.level = "average";
  else if (score < 50 && lvl === "average") EE.player.level = "easy";
  EE.saveProfile();
};
EE.motivate = s =>
  s >= 90 ? "🌟 Excellent work!" :
  s >= 80 ? "👏 Very good!" :
  s >= 60 ? "👍 Nice try!" : "💪 Don’t give up! You’ll get better!";
EE.resetProgress = function () {
  if (confirm("Reset all progress?")) {
    localStorage.removeItem("EE_profile");
    EE.player = { name: "", level: "easy", bestScore: 0, totalAttempts: 0, lastTopic: "grammar_easy" };
    EE.showWelcome();
  }
};

// ---------- Topic chooser (with dropdown) ----------
EE.chooseTopic = function () {
  EE.clearScreen();
  const wrap = EE.makeEl("div", "ee-topicwrap");
  Object.assign(wrap.style, {
    maxWidth: "700px", margin: "40px auto", textAlign: "center",
    background: EE.theme.cardBg, padding: "25px", borderRadius: "16px",
    boxShadow: "0 0 20px rgba(0,0,0,0.08)"
  });
  wrap.innerHTML = `<h2 style="color:${EE.theme.mainBtn}">Choose a Topic</h2>`;
  const levelSel = EE.makeEl("select", "ee-level");
  ["easy", "average", "difficult"].forEach(l => {
    const opt = EE.makeEl("option", "", l);
    if (l === EE.player.level) opt.selected = true;
    levelSel.appendChild(opt);
  });
  levelSel.onchange = () => {
    EE.player.level = levelSel.value;
    EE.saveProfile();
    EE.chooseTopic();
  };
  wrap.appendChild(levelSel);
  wrap.appendChild(document.createElement("hr"));

  const topics = [
    ["Grammar", "grammar_" + EE.player.level],
    ["Vocabulary", "vocabulary_" + EE.player.level],
    ["Spelling", "spelling"],
    ["Punctuation", "punctuation"],
    ["Cloze", "cloze"],
    ["Sentence", "sentence"],
    ["Mixed", "mixed"]
  ];
  topics.forEach(t => {
    const b = EE.makeEl("button", "ee-btn", t[0]);
    b.onclick = () => EE.startQuiz(t[1], t[0]);
    wrap.appendChild(b);
  });
  const back = EE.makeEl("button", "ee-btn", "⬅ Back");
  back.onclick = EE.showMainMenu;
  wrap.appendChild(back);
  document.body.appendChild(wrap);
};

// ---------- Quiz ----------
EE.startQuiz = function (poolName, label) {
  const pool = (questionBankPart1[poolName] || questionBankPart2[poolName] || []);
  const qset = pool.sort(() => 0.5 - Math.random()).slice(0, 10);
  let i = 0, score = 0, wrong = [];

  EE.clearScreen();
  const box = EE.makeEl("div", "ee-quiz");
  Object.assign(box.style, {
    maxWidth: "700px", margin: "30px auto", padding: "20px",
    background: EE.theme.cardBg, borderRadius: "16px",
    boxShadow: "0 0 15px rgba(0,0,0,0.05)"
  });
  document.body.appendChild(box);
  const qEl = EE.makeEl("h3");
  const opts = EE.makeEl("div");
  const progress = EE.makeEl("p");
  const speak = EE.makeEl("button", "ee-btnsmall", "🔊 Read Aloud");
  speak.onclick = () => EE.toggleSpeech(speak, qEl.textContent);
  box.append(qEl, speak, opts, progress);

  function showQ() {
    const q = qset[i];
    qEl.textContent = `Q${i + 1}. ${q.q}`;
    opts.innerHTML = "";
    q.opts.forEach(o => {
      const b = EE.makeEl("button", "ee-optbtn", o);
      b.onclick = () => check(o);
      opts.appendChild(b);
    });
    progress.textContent = `${i + 1} / ${qset.length}`;
  }
  function check(choice) {
    const q = qset[i];
    if (choice === q.ans) score++; else wrong.push({ ...q, your: choice });
    i++;
    i < qset.length ? showQ() : finish();
  }
  function finish() {
    EE.player.totalAttempts++;
    const pct = Math.round(score / qset.length * 100);
    if (pct > EE.player.bestScore) EE.player.bestScore = pct;
    EE.adjustLevel(pct); EE.saveProfile();
    box.innerHTML = `<h2 style="color:${EE.theme.mainBtn}">${EE.motivate(pct)}</h2>
      <p>You scored <b>${score}</b> / ${qset.length} → ${pct}%</p>
      <p>Level now: <b>${EE.player.level}</b></p>`;
    const review = EE.makeEl("button", "ee-btn", "📋 Show Answers");
    review.onclick = () => EE.showReview(qset, wrong);
    const back = EE.makeEl("button", "ee-btn", "⬅ Back to Menu");
    back.onclick = EE.showMainMenu;
    box.append(review, back);
  }
  showQ();
};

// ---------- Review table ----------
EE.showReview = function (qset, wrong) {
  EE.clearScreen();
  const div = EE.makeEl("div");
  Object.assign(div.style, {
    maxWidth: "800px", margin: "20px auto", padding: "20px",
    background: EE.theme.cardBg, borderRadius: "16px",
    boxShadow: "0 0 15px rgba(0,0,0,0.05)"
  });
  const table = EE.makeEl("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";
  table.innerHTML = `<tr style="background:${EE.theme.mainBtn};color:#fff">
    <th>Question</th><th>Your Answer</th><th>Correct Answer</th><th>Result</th></tr>`;
  qset.forEach(q => {
    const wrongQ = wrong.find(w => w.q === q.q);
    const tr = document.createElement("tr");
    const correct = !wrongQ;
    tr.innerHTML = `
      <td style="padding:6px;border-bottom:1px solid #ccc">${q.q}</td>
      <td>${wrongQ ? wrongQ.your : q.ans}</td>
      <td>${q.ans}</td>
      <td style="color:${correct ? 'green' : 'red'}">${correct ? '✅' : '❌'}</td>`;
    table.appendChild(tr);
  });
  const back = EE.makeEl("button", "ee-btn", "⬅ Back to Menu");
  back.onclick = EE.showMainMenu;
  div.append(table, back);
  document.body.appendChild(div);
};

// ---------- Reading ----------
EE.startReading = function () {
  EE.clearScreen();
  const wrap = EE.makeEl("div", "ee-read");
  Object.assign(wrap.style, {
    maxWidth: "800px", margin: "20px auto", padding: "20px",
    background: EE.theme.cardBg, borderRadius: "16px",
    boxShadow: "0 0 15px rgba(0,0,0,0.05)"
  });
  const stories = questionBankPart2.comprehension;
  const story = stories[Math.floor(Math.random() * stories.length)];
  wrap.innerHTML = `<h2 style="color:${EE.theme.mainBtn}">${story.title}</h2>
    <p style="white-space:pre-line;text-align:justify">${story.passage}</p>`;
  const speak = EE.makeEl("button", "ee-btnsmall", "🔊 Read Aloud");
  speak.onclick = () => EE.toggleSpeech(speak, story.passage);
  const startQ = EE.makeEl("button", "ee-btn", "Start Questions ➜");
  startQ.onclick = () => EE.runStoryQuestions(story);
  wrap.append(speak, startQ);
  document.body.appendChild(wrap);
};

// ---------- CSS ----------
const style = document.createElement("style");
style.textContent = `
body {
  overflow-y: auto;
}
.ee-btn, .ee-optbtn, .ee-btnsmall {
  background: ${EE.theme.mainBtn};
  color: #fff;
  border: none;
  border-radius: 14px;
  padding: 14px 28px;
  margin: 10px;
  font-size: 18px;
  cursor: pointer;
  transition: all .15s;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}
.ee-btn:hover, .ee-optbtn:hover, .ee-btnsmall:hover {
  background: ${EE.theme.hoverBtn};
  transform: scale(1.05);
}
.ee-optbtn {
  display: block;
  width: 95%;
  margin: 12px auto;
  background: ${EE.theme.cardBg};
  color: #000;
  border: 2px solid ${EE.theme.mainBtn};
  font-size: 20px;
  padding: 16px 10px;
}
.ee-btnsmall {
  background: ${EE.theme.mainBtn};
  font-size: 16px;
  color: #fff;
}
select.ee-level {
  font-size: 18px;
  padding: 10px 14px;
  margin: 10px;
  border: 2px solid ${EE.theme.mainBtn};
  border-radius: 10px;
}
h3.ee-q, h3 {
  font-size: 22px;
  line-height: 1.4em;
}
.ee-quiz, .ee-readquiz, .ee-exam {
  min-height: 50vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
table {
  border-collapse: collapse;
  width: 100%;
  font-size: 17px;
}
th, td {
  padding: 8px 10px;
  border-bottom: 1px solid #ddd;
  text-align: left;
}
`;
document.head.appendChild(style);

// ---------- Auto-run ----------
EE.loadProfile();
window.addEventListener("load",()=>{
  if(EE.player.name) EE.showMainMenu();
  else EE.showWelcome();
});
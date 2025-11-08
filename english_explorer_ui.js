/*
---------------------------------------------------------
 English Explorer v3 – UI / Engine
 Block 1 of 2
 Features:
  • Player profile + localStorage progress
  • Level / difficulty management
  • Motivational feedback
  • Session setup + theme colours (pastel)
---------------------------------------------------------
*/

const EE = {
  version: "3.0",
  player: {
    name: "",
    level: "easy",
    bestScore: 0,
    totalAttempts: 0,
    lastTopic: "grammar_easy"
  },
  theme: {
    bg: "#f9fcff",
    accent: "#a8d8ea",
    accent2: "#fbc4ab",
    accent3: "#c7f9cc",
    text: "#222"
  }
};

// ---------- localStorage Helpers ----------
EE.saveProfile = function () {
  localStorage.setItem("EE_profile", JSON.stringify(EE.player));
};
EE.loadProfile = function () {
  const data = localStorage.getItem("EE_profile");
  if (data) {
    try { EE.player = JSON.parse(data); }
    catch(e){ console.warn("Profile load error", e); }
  }
};

// ---------- UI Helpers ----------
EE.makeEl = function(tag, cls, html){
  const e=document.createElement(tag);
  if(cls) e.className=cls;
  if(html!==undefined) e.innerHTML=html;
  return e;
};
EE.clearScreen = function(){
  document.body.innerHTML="";
  document.body.style.background=EE.theme.bg;
  document.body.style.fontFamily="'Poppins',sans-serif";
  document.body.style.color=EE.theme.text;
};

// ---------- Welcome / Profile Screen ----------
EE.showWelcome = function(){
  EE.clearScreen();
  const wrap=EE.makeEl("div","ee-wrap");
  wrap.style.maxWidth="600px";
  wrap.style.margin="60px auto";
  wrap.style.textAlign="center";
  wrap.style.padding="30px";
  wrap.style.background="white";
  wrap.style.borderRadius="20px";
  wrap.style.boxShadow="0 0 20px rgba(0,0,0,0.05)";
  wrap.innerHTML=`<h2 style="color:${EE.theme.accent};font-size:28px;">🌈 English Explorer</h2>`;
  const input=EE.makeEl("input","ee-name");
  input.placeholder="Enter your name";
  input.style.padding="10px";
  input.style.fontSize="18px";
  input.style.border=`2px solid ${EE.theme.accent}`;
  input.style.borderRadius="8px";
  input.style.width="80%";
  input.style.marginTop="20px";
  if(EE.player.name) input.value=EE.player.name;
  const btn=EE.makeEl("button","ee-btn","Start Learning ➜");
  btn.style.marginTop="25px";
  btn.style.padding="12px 30px";
  btn.style.border="none";
  btn.style.fontSize="18px";
  btn.style.background=EE.theme.accent;
  btn.style.color="#fff";
  btn.style.borderRadius="10px";
  btn.style.cursor="pointer";
  btn.onclick=function(){
    EE.player.name=input.value.trim()||"Explorer";
    EE.saveProfile();
    EE.showMainMenu();
  };
  wrap.appendChild(input);
  wrap.appendChild(btn);
  document.body.appendChild(wrap);
};

// ---------- Main Menu ----------
EE.showMainMenu = function(){
  EE.clearScreen();
  const w=EE.makeEl("div","ee-menu");
  w.style.maxWidth="700px";
  w.style.margin="40px auto";
  w.style.textAlign="center";
  const greet=`<h2 style="color:${EE.theme.accent}">Hi ${EE.player.name}! 👋</h2>`;
  const stats=`<p style="font-size:16px">Best Score: ${EE.player.bestScore}%<br>
  Level: <b>${EE.player.level}</b><br>
  Total Attempts: ${EE.player.totalAttempts}</p>`;
  w.innerHTML=greet+stats;

  const modes=[
    ["🧠 Practice","EE.chooseTopic()"],
    ["📖 Reading","EE.startReading()"],
    ["🧩 Exam Mode","EE.startExam()"],
    ["⚙️ Reset Progress","EE.resetProgress()"]
  ];

  modes.forEach(m=>{
    const b=EE.makeEl("button","ee-btn",m[0]);
    b.style.display="block";
    b.style.margin="10px auto";
    b.style.width="80%";
    b.style.padding="12px";
    b.style.fontSize="18px";
    b.style.border="none";
    b.style.borderRadius="10px";
    b.style.cursor="pointer";
    b.style.background=EE.theme.accent2;
    b.style.color="#fff";
    b.onclick=function(){ eval(m[1]); };
    w.appendChild(b);
  });

  document.body.appendChild(w);
};

// ---------- Difficulty Adjustment ----------
EE.adjustLevel = function(score){
  if(score>=80 && EE.player.level==="easy") EE.player.level="average";
  else if(score>=80 && EE.player.level==="average") EE.player.level="difficult";
  else if(score<50 && EE.player.level==="difficult") EE.player.level="average";
  else if(score<50 && EE.player.level==="average") EE.player.level="easy";
  EE.saveProfile();
};

// ---------- Motivational Messages ----------
EE.motivate = function(score){
  let msg="Great effort!";
  if(score>=90) msg="🌟 Excellent work!";
  else if(score>=80) msg="👏 Very good! Keep it up.";
  else if(score>=60) msg="👍 Nice try! Practice a bit more.";
  else msg="💪 Don’t give up! You’ll get better!";
  return msg;
};

// ---------- Reset ----------
EE.resetProgress = function(){
  if(confirm("Reset all progress?")){
    localStorage.removeItem("EE_profile");
    EE.player={name:"",level:"easy",bestScore:0,totalAttempts:0,lastTopic:"grammar_easy"};
    EE.showWelcome();
  }
};

// Placeholder stubs (to be defined in Block 2)
EE.chooseTopic=function(){alert("chooseTopic() in next block");};
EE.startReading=function(){alert("startReading() in next block");};
EE.startExam=function(){alert("startExam() in next block");};

// auto-run
EE.loadProfile();
window.addEventListener("load",()=>{
  if(EE.player.name) EE.showMainMenu();
  else EE.showWelcome();
});
/*
---------------------------------------------------------
 English Explorer v3 – UI / Engine
 Block 2 of 2
 Adds:
   • Topic chooser
   • Quiz / Exam runner
   • Reading story view + 🔊 Read-Aloud
   • Score panel + adaptive level update
   • Pastel visual theme
---------------------------------------------------------
*/

// ---------- Topic Chooser ----------
EE.chooseTopic = function(){
  EE.clearScreen();
  const wrap = EE.makeEl("div","ee-topicwrap");
  wrap.style.maxWidth="700px";
  wrap.style.margin="40px auto";
  wrap.style.textAlign="center";
  wrap.innerHTML=`<h2 style="color:${EE.theme.accent3}">Choose a Topic</h2>
  <p>Your current level: <b>${EE.player.level}</b></p>`;

  const topics=[
    ["Grammar","grammar_"+EE.player.level],
    ["Vocabulary","vocabulary_"+EE.player.level],
    ["Spelling","spelling"],
    ["Punctuation","punctuation"],
    ["Cloze","cloze"],
    ["Sentence","sentence"],
    ["Mixed","mixed"]
  ];

  topics.forEach(t=>{
    const b=EE.makeEl("button","ee-btn",t[0]);
    b.style.margin="8px";
    b.style.background=EE.theme.accent3;
    b.style.color="#333";
    b.onclick=()=>EE.startQuiz(t[1],t[0]);
    wrap.appendChild(b);
  });

  const back=EE.makeEl("button","ee-btn","⬅ Back");
  back.style.background=EE.theme.accent;
  back.onclick=EE.showMainMenu;
  wrap.appendChild(back);
  document.body.appendChild(wrap);
};

// ---------- Quiz Engine ----------
EE.startQuiz = function(poolName,label){
  const pool=(questionBankPart1[poolName]||questionBankPart2[poolName]||[]);
  const qset=pool.sort(()=>0.5-Math.random()).slice(0,10);
  let index=0,score=0;

  EE.clearScreen();
  const container=EE.makeEl("div","ee-quiz");
  container.style.maxWidth="700px";
  container.style.margin="30px auto";
  container.style.padding="20px";
  container.style.background="white";
  container.style.borderRadius="16px";
  container.style.boxShadow="0 0 15px rgba(0,0,0,0.05)";
  document.body.appendChild(container);

  const qEl=EE.makeEl("h3","ee-q");
  const opts=EE.makeEl("div","ee-opts");
  const progress=EE.makeEl("p","ee-progress");
  const speak=EE.makeEl("button","ee-btnsmall","🔊 Read Aloud");
  speak.style.float="right";
  speak.onclick=()=>window.speechSynthesis.speak(new SpeechSynthesisUtterance(qEl.textContent));
  container.appendChild(qEl);container.appendChild(speak);
  container.appendChild(opts);container.appendChild(progress);

  function showQ(){
    const q=qset[index];
    qEl.textContent=`Q${index+1}. ${q.q}`;
    opts.innerHTML="";
    q.opts.forEach(o=>{
      const b=EE.makeEl("button","ee-optbtn",o);
      b.onclick=()=>check(o);
      opts.appendChild(b);
    });
    progress.textContent=`${index+1} of ${qset.length}`;
  }

  function check(choice){
    const q=qset[index];
    if(choice===q.ans) score++;
    index++;
    if(index<qset.length) showQ();
    else finish();
  }

  function finish(){
    EE.player.totalAttempts++;
    const pct=Math.round(score/qset.length*100);
    if(pct>EE.player.bestScore) EE.player.bestScore=pct;
    EE.adjustLevel(pct);
    EE.saveProfile();

    container.innerHTML=`<h2 style="color:${EE.theme.accent2}">${EE.motivate(pct)}</h2>
    <p>You scored <b>${score}</b> / ${qset.length} → ${pct}%</p>
    <p>Level now: <b>${EE.player.level}</b></p>`;
    const back=EE.makeEl("button","ee-btn","⬅ Back to Menu");
    back.onclick=EE.showMainMenu;
    container.appendChild(back);
  }
  showQ();
};

// ---------- Reading Mode ----------
EE.startReading = function(){
  EE.clearScreen();
  const wrap=EE.makeEl("div","ee-read");
  wrap.style.maxWidth="800px";
  wrap.style.margin="20px auto";
  wrap.style.padding="20px";
  wrap.style.background="white";
  wrap.style.borderRadius="16px";
  wrap.style.boxShadow="0 0 15px rgba(0,0,0,0.05)";
  document.body.appendChild(wrap);

  const stories=questionBankPart2.comprehension;
  const story=stories[Math.floor(Math.random()*stories.length)];
  wrap.innerHTML=`<h2 style="color:${EE.theme.accent2}">${story.title}</h2>
  <p style="white-space:pre-line;text-align:justify">${story.passage}</p>`;

  const speak=EE.makeEl("button","ee-btnsmall","🔊 Read Aloud");
  speak.onclick=()=>{
    const u=new SpeechSynthesisUtterance(story.passage);
    u.rate=1;u.pitch=1;
    window.speechSynthesis.speak(u);
  };
  wrap.appendChild(speak);

  const startQ=EE.makeEl("button","ee-btn","Start Questions ➜");
  startQ.style.marginTop="20px";
  startQ.onclick=()=>{
    EE.runStoryQuestions(story);
  };
  wrap.appendChild(startQ);
};

EE.runStoryQuestions=function(story){
  EE.clearScreen();
  const qset=story.questions;
  let i=0,score=0;
  const cont=EE.makeEl("div","ee-readquiz");
  cont.style.maxWidth="700px";cont.style.margin="20px auto";
  cont.style.padding="20px";cont.style.background="white";
  cont.style.borderRadius="16px";cont.style.boxShadow="0 0 15px rgba(0,0,0,0.05)";
  document.body.appendChild(cont);
  const qEl=EE.makeEl("h3");
  const opts=EE.makeEl("div");
  cont.appendChild(qEl);cont.appendChild(opts);

  function showQ(){
    const q=qset[i];
    qEl.textContent=`Q${i+1}. ${q.q}`;
    opts.innerHTML="";
    q.opts.forEach(o=>{
      const b=EE.makeEl("button","ee-optbtn",o);
      b.onclick=()=>check(o);
      opts.appendChild(b);
    });
  }
  function check(choice){
    if(choice===qset[i].ans) score++;
    i++;
    if(i<qset.length) showQ();
    else done();
  }
  function done(){
    const pct=Math.round(score/qset.length*100);
    cont.innerHTML=`<h2 style="color:${EE.theme.accent3}">${EE.motivate(pct)}</h2>
    <p>You scored ${score} / ${qset.length} → ${pct}%</p>`;
    const back=EE.makeEl("button","ee-btn","⬅ Back to Menu");
    back.onclick=EE.showMainMenu;
    cont.appendChild(back);
    EE.adjustLevel(pct);EE.saveProfile();
  }
  showQ();
};

// ---------- Exam Mode ----------
EE.startExam=function(){
  const labels=Object.keys(questionBankPart2.exams);
  const label=labels[Math.floor(Math.random()*labels.length)];
  const pool=questionBankPart2.exams[label];
  EE.startQuizExam(pool,label);
};

EE.startQuizExam=function(pool,label){
  let i=0,score=0;
  EE.clearScreen();
  const cont=EE.makeEl("div","ee-exam");
  cont.style.maxWidth="700px";cont.style.margin="20px auto";
  cont.style.padding="20px";cont.style.background="white";
  cont.style.borderRadius="16px";cont.style.boxShadow="0 0 15px rgba(0,0,0,0.05)";
  document.body.appendChild(cont);
  const title=EE.makeEl("h2","",`Exam: ${label}`);
  const qEl=EE.makeEl("h3");const opts=EE.makeEl("div");
  const prog=EE.makeEl("p");cont.appendChild(title);cont.appendChild(qEl);
  cont.appendChild(opts);cont.appendChild(prog);

  function showQ(){
    const q=pool[i];
    qEl.textContent=`Q${i+1}. ${q.q}`;
    opts.innerHTML="";
    q.opts.forEach(o=>{
      const b=EE.makeEl("button","ee-optbtn",o);
      b.onclick=()=>check(o);
      opts.appendChild(b);
    });
    prog.textContent=`${i+1} of ${pool.length}`;
  }
  function check(choice){
    if(choice===pool[i].ans) score++;
    i++;
    if(i<pool.length) showQ(); else finish();
  }
  function finish(){
    const pct=Math.round(score/pool.length*100);
    cont.innerHTML=`<h2 style="color:${EE.theme.accent2}">${EE.motivate(pct)}</h2>
    <p>Score: ${score} / ${pool.length} → ${pct}%</p>`;
    const back=EE.makeEl("button","ee-btn","⬅ Back to Menu");
    back.onclick=EE.showMainMenu;
    cont.appendChild(back);
    EE.adjustLevel(pct);EE.saveProfile();
  }
  showQ();
};

// ---------- Shared Button Styles ----------
const style=document.createElement("style");
style.textContent=`
.ee-btn,.ee-optbtn,.ee-btnsmall{
  background:${EE.theme.accent};color:#fff;border:none;border-radius:8px;
  padding:10px 20px;margin:6px;font-size:16px;cursor:pointer;
  transition:transform .1s;
}
.ee-btn:hover,.ee-optbtn:hover,.ee-btnsmall:hover{transform:scale(1.05);}
.ee-optbtn{display:block;width:90%;margin:6px auto;background:${EE.theme.accent3};color:#333;}
.ee-btnsmall{background:${EE.theme.accent2};font-size:14px;}
`;
document.head.appendChild(style);

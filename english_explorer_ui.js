/*
---------------------------------------------------------
 English Explorer v3.4 – Final Unified UI / Engine
 (Math Tinik Theme + Voice Toggle + Manual Nav All Modes)
---------------------------------------------------------
*/
const EE = {
  version:"3.4",
  player:{name:"",level:"easy",bestScore:0,totalAttempts:0,lastTopic:"grammar_easy"},
  theme:{
    bgGradient:"linear-gradient(180deg,#a8d8ea 0%,#c7f9cc 60%,#fef9d9 100%)",
    cardBg:"rgba(255,255,255,0.9)",
    mainBtn:"#3d5af1",
    hoverBtn:"#ffd460",
    accent2:"#fbc4ab",
    text:"#222"
  }
};

// ---------- Storage ----------
EE.saveProfile=()=>localStorage.setItem("EE_profile",JSON.stringify(EE.player));
EE.loadProfile=()=>{const d=localStorage.getItem("EE_profile");if(d)try{EE.player=JSON.parse(d);}catch(e){}};

// ---------- Helpers ----------
EE.makeEl=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!==undefined)e.innerHTML=h;return e;};
EE.clearScreen=()=>{document.body.innerHTML="";Object.assign(document.body.style,{
  margin:"0",height:"100vh",background:EE.theme.bgGradient,fontFamily:"'Poppins',sans-serif",
  color:EE.theme.text,backgroundAttachment:"fixed",backgroundSize:"cover"
});};

// ---------- Speech Toggle ----------
EE.toggleSpeech=function(btn,text){
  const synth=window.speechSynthesis;
  if(btn.dataset.playing==="true"){
    synth.cancel();
    btn.dataset.playing="false";
    btn.style.background=EE.theme.mainBtn;
    btn.textContent="🔊 Read Aloud";
    return;
  }
  const u=new SpeechSynthesisUtterance(text);
  u.onend=()=>{btn.dataset.playing="false";btn.style.background=EE.theme.mainBtn;btn.textContent="🔊 Read Aloud";};
  btn.dataset.playing="true";
  btn.style.background=EE.theme.hoverBtn;
  btn.textContent="⏸ Stop Reading";
  synth.cancel();synth.speak(u);
};

// ---------- Welcome ----------
EE.showWelcome=function(){
  EE.clearScreen();
  const w=EE.makeEl("div");
  Object.assign(w.style,{maxWidth:"600px",margin:"60px auto",textAlign:"center",padding:"30px",
    background:EE.theme.cardBg,borderRadius:"20px",boxShadow:"0 0 20px rgba(0,0,0,0.05)"});
  w.innerHTML=`<h2 style="color:${EE.theme.mainBtn};font-size:28px;">🌈 English Explorer</h2>`;
  const input=EE.makeEl("input","ee-name");
  Object.assign(input.style,{padding:"10px",fontSize:"18px",border:`2px solid ${EE.theme.mainBtn}`,
    borderRadius:"8px",width:"80%",marginTop:"20px"});
  input.placeholder="Enter your name";
  if(EE.player.name)input.value=EE.player.name;
  const btn=EE.makeEl("button","ee-btn","Start Learning ➜");
  btn.onclick=()=>{EE.player.name=input.value.trim()||"Explorer";EE.saveProfile();EE.showMainMenu();};
  w.append(input,btn);document.body.appendChild(w);
};

// ---------- Main Menu ----------
EE.showMainMenu=function(){
  EE.clearScreen();
  const w=EE.makeEl("div");
  Object.assign(w.style,{maxWidth:"700px",margin:"40px auto",textAlign:"center",
    background:EE.theme.cardBg,padding:"25px",borderRadius:"16px",boxShadow:"0 0 20px rgba(0,0,0,0.08)"});
  w.innerHTML=`<h2 style="color:${EE.theme.mainBtn}">Hi ${EE.player.name}! 👋</h2>
    <p>Best Score: ${EE.player.bestScore}%<br>Level: <b>${EE.player.level}</b><br>Attempts: ${EE.player.totalAttempts}</p>`;
  [["🧠 Practice","EE.chooseTopic()"],["📖 Reading","EE.startReading()"],["🧩 Exam Mode","EE.startExam()"],["⚙️ Reset Progress","EE.resetProgress()"]]
  .forEach(m=>{const b=EE.makeEl("button","ee-btn",m[0]);b.onclick=()=>eval(m[1]);w.appendChild(b);});
  document.body.appendChild(w);
};

// ---------- Difficulty / Motivation ----------
EE.adjustLevel=s=>{const l=EE.player.level;
  if(s>=80&&l==="easy")EE.player.level="average";
  else if(s>=80&&l==="average")EE.player.level="difficult";
  else if(s<50&&l==="difficult")EE.player.level="average";
  else if(s<50&&l==="average")EE.player.level="easy";
  EE.saveProfile();
};
EE.motivate=s=>s>=90?"🌟 Excellent work!":s>=80?"👏 Very good!":s>=60?"👍 Nice try!":"💪 Don’t give up!";
EE.resetProgress=()=>{if(confirm("Reset all progress?")){localStorage.removeItem("EE_profile");
  EE.player={name:"",level:"easy",bestScore:0,totalAttempts:0,lastTopic:"grammar_easy"};EE.showWelcome();};};

// ---------- Topic Chooser ----------
EE.chooseTopic=function(){
  EE.clearScreen();
  const w=EE.makeEl("div");
  Object.assign(w.style,{maxWidth:"700px",margin:"40px auto",textAlign:"center",
    background:EE.theme.cardBg,padding:"25px",borderRadius:"16px",boxShadow:"0 0 20px rgba(0,0,0,0.08)"});
  w.innerHTML=`<h2 style="color:${EE.theme.mainBtn}">Choose a Topic</h2>`;
  const levelSel=EE.makeEl("select","ee-level");
  ["easy","average","difficult"].forEach(l=>{const o=EE.makeEl("option","",l);if(l===EE.player.level)o.selected=true;levelSel.appendChild(o);});
  levelSel.onchange=()=>{EE.player.level=levelSel.value;EE.saveProfile();EE.chooseTopic();};
  w.append(levelSel,document.createElement("hr"));
  [["Grammar","grammar_"+EE.player.level],["Vocabulary","vocabulary_"+EE.player.level],
   ["Spelling","spelling"],["Punctuation","punctuation"],["Preposition","preposition"],["Sentence","sentence"],["Mixed","mixed"]]
  .forEach(t=>{const b=EE.makeEl("button","ee-btn",t[0]);b.onclick=()=>EE.startQuiz(t[1],t[0]);w.appendChild(b);});
  const back=EE.makeEl("button","ee-btn","⬅ Back");back.onclick=EE.showMainMenu;w.appendChild(back);
  document.body.appendChild(w);
};

// ---------- Core quiz renderer shared ----------
EE.renderQuiz=function(container,qset,callback){
  let i=0,answers=new Array(qset.length).fill(null);
  const qEl=EE.makeEl("h3","ee-q"),opts=EE.makeEl("div"),nav=EE.makeEl("div"),prog=EE.makeEl("p");
  const speak=EE.makeEl("button","ee-btnsmall","🔊 Read Aloud");
  speak.onclick=()=>EE.toggleSpeech(speak,qEl.textContent);
  container.append(qEl,speak,opts,nav,prog);
  const btnPrev=EE.makeEl("button","ee-btn","⬅ Prev"),btnNext=EE.makeEl("button","ee-btn","Next ➜");
  nav.append(btnPrev,btnNext);
  Object.assign(nav.style,{display:"flex",justifyContent:"space-between"});
  function render(){
    const q=qset[i];
    qEl.textContent=`Q${i+1}. ${q.q}`;
    opts.innerHTML="";
    q.opts.forEach(o=>{
      const b=EE.makeEl("button","ee-optbtn",o);
      b.style.background=(answers[i]===o)?EE.theme.hoverBtn:EE.theme.cardBg;
      b.onclick=()=>select(o,b);
      opts.appendChild(b);
    });
    prog.textContent=`${i+1}/${qset.length}`;
    btnPrev.disabled=(i===0);
    btnNext.textContent=(i===qset.length-1)?"Finish":"Next ➜";
  }
  function select(ans,btn){
    answers[i]=ans;
    Array.from(opts.children).forEach(b=>b.style.background=EE.theme.cardBg);
    btn.style.background=EE.theme.hoverBtn;
  }
  btnPrev.onclick=()=>{if(i>0)i--;render();};
  btnNext.onclick=()=>{if(i<qset.length-1)i++;else finish();render();};
  function finish(){
    let score=0,wrong=[];
    qset.forEach((q,idx)=>{if(answers[idx]===q.ans)score++;else wrong.push({...q,your:answers[idx]||"(no answer)"});});
    callback(score,qset,wrong);
  }
  render();
};

// ---------- Practice ----------
EE.startQuiz=function(poolName,label){
  const pool=(questionBankPart1[poolName]||questionBankPart2[poolName]||[]);
  const qset=pool.sort(()=>0.5-Math.random()).slice(0,10);
  EE.clearScreen();
  const box=EE.makeEl("div","ee-quiz");
  Object.assign(box.style,{maxWidth:"700px",margin:"30px auto",padding:"20px",background:EE.theme.cardBg,
    borderRadius:"16px",boxShadow:"0 0 15px rgba(0,0,0,0.05)",minHeight:"50vh"});
  document.body.appendChild(box);
  EE.renderQuiz(box,qset,(score,qset,wrong)=>{
    const pct=Math.round(score/qset.length*100);
    EE.player.totalAttempts++;if(pct>EE.player.bestScore)EE.player.bestScore=pct;
    EE.adjustLevel(pct);EE.saveProfile();
    box.innerHTML=`<h2 style="color:${EE.theme.mainBtn}">${EE.motivate(pct)}</h2>
      <p>You scored <b>${score}</b> / ${qset.length} → ${pct}%</p><p>Level now: <b>${EE.player.level}</b></p>`;
    const rev=EE.makeEl("button","ee-btn","📋 Show Answers");rev.onclick=()=>EE.showReview(qset,wrong);
    const back=EE.makeEl("button","ee-btn","⬅ Back to Menu");back.onclick=EE.showMainMenu;
    box.append(rev,back);
  });
};

// ---------- Review ----------
EE.showReview=function(qset,wrong){
  EE.clearScreen();
  const d=EE.makeEl("div");
  Object.assign(d.style,{maxWidth:"800px",margin:"20px auto",padding:"20px",
    background:EE.theme.cardBg,borderRadius:"16px",boxShadow:"0 0 15px rgba(0,0,0,0.05)"});
  const t=EE.makeEl("table");
  t.style.width="100%";
  t.innerHTML=`<tr style="background:${EE.theme.mainBtn};color:#fff"><th>Question</th><th>Your Answer</th><th>Correct</th><th>Result</th></tr>`;
  qset.forEach(q=>{
    const w=wrong.find(x=>x.q===q.q);const ok=!w;
    const tr=document.createElement("tr");
    tr.innerHTML=`<td>${q.q}</td><td>${w?w.your:q.ans}</td><td>${q.ans}</td>
    <td style="color:${ok?'green':'red'}">${ok?'✅':'❌'}</td>`;t.appendChild(tr);
  });
  const b=EE.makeEl("button","ee-btn","⬅ Back");b.onclick=EE.showMainMenu;d.append(t,b);document.body.appendChild(d);
};

// ---------- Reading ----------
EE.startReading=function(){
  EE.clearScreen();
  const w=EE.makeEl("div","ee-read");
  Object.assign(w.style,{maxWidth:"800px",margin:"20px auto",padding:"20px",
    background:EE.theme.cardBg,borderRadius:"16px",boxShadow:"0 0 15px rgba(0,0,0,0.05)"});
  const stories=questionBankPart2.comprehension;
  const s=stories[Math.floor(Math.random()*stories.length)];
  w.innerHTML=`<h2 style="color:${EE.theme.mainBtn}">${s.title}</h2>
  <p style="white-space:pre-line;text-align:justify">${s.passage}</p>`;
  const speak=EE.makeEl("button","ee-btnsmall","🔊 Read Aloud");speak.onclick=()=>EE.toggleSpeech(speak,s.passage);
  const go=EE.makeEl("button","ee-btn","Start Questions ➜");go.onclick=()=>EE.runStoryQuestions(s);
  w.append(speak,go);document.body.appendChild(w);
};

// ---------- Story Questions (manual navigation) ----------
EE.runStoryQuestions=function(s){
  EE.clearScreen();
  const c=EE.makeEl("div","ee-readquiz");
  Object.assign(c.style,{maxWidth:"700px",margin:"20px auto",padding:"20px",
    background:EE.theme.cardBg,borderRadius:"16px",boxShadow:"0 0 15px rgba(0,0,0,0.05)",minHeight:"50vh"});
  document.body.appendChild(c);
  EE.renderQuiz(c,s.questions,(score,qset,wrong)=>{
    const pct=Math.round(score/qset.length*100);
    c.innerHTML=`<h2 style="color:${EE.theme.mainBtn}">${EE.motivate(pct)}</h2>
      <p>You scored ${score}/${qset.length} → ${pct}%</p>`;
    const b=EE.makeEl("button","ee-btn","⬅ Back");b.onclick=EE.showMainMenu;c.appendChild(b);
    EE.adjustLevel(pct);EE.saveProfile();
  });
};

// ---------- Exam Mode (manual navigation) ----------
EE.startExam=function(){
  const labels=Object.keys(questionBankPart2.exams);
  const label=labels[Math.floor(Math.random()*labels.length)];
  EE.startQuizExam(questionBankPart2.exams[label],label);
};
EE.startQuizExam=function(pool,label){
  EE.clearScreen();
  const c=EE.makeEl("div","ee-exam");
  Object.assign(c.style,{maxWidth:"700px",margin:"20px auto",padding:"20px",
    background:EE.theme.cardBg,borderRadius:"16px",boxShadow:"0 0 15px rgba(0,0,0,0.05)",minHeight:"50vh"});
  const t=EE.makeEl("h2","",`Exam: ${label}`);c.appendChild(t);
  document.body.appendChild(c);
  EE.renderQuiz(c,pool,(score,qset,wrong)=>{
    const pct=Math.round(score/qset.length*100);
    c.innerHTML=`<h2 style="color:${EE.theme.mainBtn}">${EE.motivate(pct)}</h2>
      <p>Score: ${score}/${qset.length} → ${pct}%</p>`;
    const b=EE.makeEl("button","ee-btn","⬅ Back to Menu");b.onclick=EE.showMainMenu;c.appendChild(b);
    EE.adjustLevel(pct);EE.saveProfile();
  });
};

// ---------- CSS ----------
const style=document.createElement("style");
style.textContent=`
body{overflow-y:auto;}
.ee-btn,.ee-optbtn,.ee-btnsmall{
  background:${EE.theme.mainBtn};color:#fff;border:none;border-radius:14px;
  padding:14px 28px;margin:10px;font-size:18px;cursor:pointer;
  transition:all .15s;box-shadow:0 2px 5px rgba(0,0,0,0.2);
}
.ee-btn:hover,.ee-optbtn:hover,.ee-btnsmall:hover{background:${EE.theme.hoverBtn};transform:scale(1.05);}
.ee-optbtn{display:block;width:95%;margin:12px auto;background:${EE.theme.cardBg};
  color:#000;border:2px solid ${EE.theme.mainBtn};font-size:20px;padding:16px 10px;}
.ee-btnsmall{background:${EE.theme.mainBtn};font-size:16px;color:#fff;}
select.ee-level{font-size:18px;padding:10px 14px;margin:10px;border:2px solid ${EE.theme.mainBtn};border-radius:10px;}
h3.ee-q,h3{font-size:22px;line-height:1.4em;}
.ee-quiz,.ee-readquiz,.ee-exam{min-height:50vh;display:flex;flex-direction:column;justify-content:center;}
table{border-collapse:collapse;width:100%;font-size:17px;}
th,td{padding:8px 10px;border-bottom:1px solid #ddd;text-align:left;}
`;
document.head.appendChild(style);

// ---------- Autorun ----------
EE.loadProfile();
window.addEventListener("load",()=>{EE.player.name?EE.showMainMenu():EE.showWelcome();});
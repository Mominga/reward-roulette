/* ========= 定数 ========= */
const MAX_HOLD = 2;
const rareList = [
  "温泉に行く","国内旅行 1泊2日","外食に行く","映画を鑑賞する","漫画喫茶に行く",
  "サイクリングに行く","ルーレット旅に行く","ゲーム1DAY","掃除1DAY","読書1DAY",
  "●●系カフェに行く","追加で5回抽選する","登山/トレッキングに行く","泳ぎに行く",
  "○○教室ワークショップに参加","海外旅行に行く"
];
const ruleRows = [
  ["90% 合10+","夕食50%､鼻うがい"],["80% 5/6含","お風呂､家事4種"],
  ["60% ペアのみ","アイマスク等"],["40% 合11-14","お菓子､ギュ"],
  ["2% 合4-6","散歩"],["2% 合7","メルカリ出品"],
  ["1% 666x","温泉"],["1% 111x","国内旅行"],
  ["0.67% 2222","外食"],["0.67% 3333","外食"],
  ["0.4% 4444","映画"],["0.4% 5555","漫画喫茶"],["0.4% 6666","サイクリング"],
  ["0.4% 1234","ルーレット旅"],["0.4% 1111","ゲーム1DAY"],
  ["0.4% 1212系","掃除1DAY"],["0.4% 2341系","読書1DAY"],
  ["0.4% 2224","●●系カフェ"],["0.4% 2255","追加で5回抽選"],
  ["0.4% 3334","登山/トレッキング"],["0.4% 3335","泳ぎに行く"],
  ["0.25% 2345","ワークショップ"],["0.20% 3456","海外旅行"]
];

/* ========= DOM ========== */
const rulesTable = document.getElementById("rulesTable");
const diceBox    = document.getElementById("diceBox");
const rollBtn    = document.getElementById("rollBtn");
const resetBtn   = document.getElementById("resetBtn");
const invList    = document.getElementById("invList");
const resultBox  = document.getElementById("result");
const animText   = document.getElementById("animText");
const flash      = document.getElementById("flash");
const flashTxt   = document.getElementById("flashTxt");

/* ========= 初期描画 ========= */
rulesTable.innerHTML =
  "<tr><th>条件</th><th>報酬</th></tr>" +
  ruleRows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join("");

/* ========= ストレージ ========= */
const load = ()=>JSON.parse(localStorage.getItem("inv")||"[]");
const save = a =>localStorage.setItem("inv",JSON.stringify(a));
function renderInv(){
  const arr = load(), cnt={};
  arr.forEach(n=>cnt[n]=(cnt[n]||0)+1);
  invList.innerHTML = arr.length
    ? Object.entries(cnt).map(([n,c])=>`<div class="card">${n}${c>1?`<span class="badge">×${c}</span>`:''}</div>`).join("")
    : '<div class="small">まだ報酬はありません。</div>';
}
renderInv();
resetBtn.onclick = ()=>{localStorage.removeItem("inv"); renderInv();};

/* ========= Dice helpers ========= */
const createDie = ()=>{
  const d=document.createElement("div");d.className="die rolling";
  ["front","back","right","left","top","bottom"].forEach(cls=>{
    const f=document.createElement("div");f.className="face "+cls;d.appendChild(f);
  });return d;
};
const setFace = (c,v)=>{c.className="die show-"+v;c.querySelectorAll(".face").forEach(el=>el.textContent=v)};
const rollVals = ()=>Array.from({length:4},()=>Math.floor(Math.random()*6)+1);

/* ========= Sound ========= */
let ctx;
const beep = (f,d)=>{
  ctx = ctx||new AudioContext();
  const o=ctx.createOscillator(),g=ctx.createGain();
  o.frequency.value=f;o.type="triangle";o.connect(g);g.connect(ctx.destination);
  o.start();g.gain.setValueAtTime(.35,ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+d/1000);
  o.stop(ctx.currentTime+d/1000);
};
const rareFan = ()=>[880,660,1040].forEach((f,i)=>setTimeout(()=>beep(f,200),200*i));

/* ========= 評価関数 ========= */
function evaluate(d){
  const s=d.reduce((a,b)=>a+b,0),c={};d.forEach(v=>c[v]=(c[v]||0)+1);
  const pair=Object.values(c).some(v=>v==2)&&Object.values(c).every(v=>v<=2);
  let r=[];
  if(s>=10)r.push("夕食を50%追加","翌朝に鼻うがい");
  if(d.some(v=>v>=5))r.push("お風呂に入る (有効48h)","顔を洗う","食器を洗う","洗濯機を回す");
  if(pair)r.push("アイマスクを使う","耳栓を使う","電動自転車を利用","乾燥機能を使う");
  if(s>=11&&s<=14)r.push("お菓子を食べる","ギュ (ハグ) をする");
  if(s>=4&&s<=6)r.push("散歩に行く"); if(s==7)r.push("メルカリで不用品を1つ出品");
  if(c[6]==3)r.push("温泉に行く"); if(c[1]==3)r.push("国内旅行 1泊2日");
  if(c[2]==4||c[3]==4)r.push("外食に行く");
  if(c[4]==4)r.push("映画を鑑賞する"); if(c[5]==4)r.push("漫画喫茶に行く"); if(c[6]==4)r.push("サイクリングに行く"); if(c[1]==4)r.push("ゲーム1DAY");
  const join=d.join(""),sort=d.slice().sort((a,b)=>a-b).join("");
  if(sort==="1234")r.push("ルーレット旅に行く"); if(sort==="2345")r.push("○○教室ワークショップに参加"); if(sort==="3456")r.push("海外旅行に行く");
  if(["1212","2121","1221","2112","2211"].includes(join))r.push("掃除1DAY");
  if(["2341","2413","3142","3412","4123","4312"].includes(join))r.push("読書1DAY");
  if(join==="2224")r.push("●●系カフェに行く"); if(join==="2255")r.push("追加で5回抽選する"); if(join==="3334")r.push("登山/トレッキングに行く"); if(join==="3335")r.push("泳ぎに行く");
  return r;
}

/* ========= Roll Sequence ========= */
rollBtn.onclick = ()=>{
  rollBtn.disabled=true; animText.textContent="Rolling..."; diceBox.innerHTML="";
  const cubes=[...Array(4)].map(()=>{const c=createDie();diceBox.appendChild(c);return c});
  const tick=setInterval(()=>beep(520+Math.random()*280,60),90);
  setTimeout(()=>{
    clearInterval(tick);
    const vals=rollVals(); cubes.forEach((c,i)=>setFace(c,vals[i]));
    [523,659,784].forEach((f,i)=>setTimeout(()=>beep(f,160),180*i));
    confetti({particleCount:120,spread:90,origin:{y:.75}});
    const rewards=evaluate(vals),inv=load(),map={};inv.forEach(n=>map[n]=(map[n]||0)+1);
    let html="<h2>抽選結果</h2>";
    rewards.forEach(n=>{
      if((map[n]||0)>=MAX_HOLD){
        html+=`<div class="card strike">${n}<div class="small">所持上限で獲得無し</div></div>`;
      }else{
        inv.push(n); map[n]=(map[n]||0)+1;
        html+=`<div class="card">${n}</div>`;
        if(rareList.includes(n) && map[n]===1){
          flashTxt.textContent=`New‼ ${n} を獲得しました！`;
          flash.classList.add("show"); rareFan();
        }
      }
    });
    resultBox.innerHTML=html; save(inv); renderInv();
    animText.textContent="結果！";
    setTimeout(()=>flash.classList.remove("show"),2000);
    rollBtn.disabled=false;
  },1100);
};\n});</script>\n</body>\n</html>"}]}

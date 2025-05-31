/* ========= 定数 & 表 ========= */
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

/* ========= DOM & 初期描画 ========= */
document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);
  const rulesTable = $("rulesTable"), diceBox = $("diceBox");
  const rollBtn = $("rollBtn"),  resetBtn  = $("resetBtn");
  const invList = $("invList"),  resultBox = $("result");
  const animText = $("animText"),flashTxt  = $("flashTxt"),flash=$("flash");

  /* ========== 表描画 ========== */
  rulesTable.innerHTML =
    "<tr><th>条件</th><th>報酬</th></tr>" +
    ruleRows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join("");

  /* ========== ストレージ ========== */
  const load = () => JSON.parse(localStorage.getItem("inv")||"[]");
  const save = a  => localStorage.setItem("inv",JSON.stringify(a));
  const renderInv = () => {
    const a = load(), cnt={}; a.forEach(n=>cnt[n]=(cnt[n]||0)+1);
    invList.innerHTML = a.length
      ? Object.entries(cnt).map(([n,c])=>`<div class="card">${n}${c>1?`<span class="badge">×${c}</span>`:""}</div>`).join("")
      : '<div class="small">まだ報酬はありません。</div>';
  };
  renderInv();
  resetBtn.onclick = () => {localStorage.removeItem("inv");renderInv();};

  /* ========= 抽選判定関数（必須） ========= */
function evaluate(d) {
  const sum = d.reduce((a,b)=>a+b,0), freq = {};
  d.forEach(v => freq[v] = (freq[v]||0)+1);

  const pairOnly = Object.values(freq).some(v=>v==2) &&
                   Object.values(freq).every(v=>v<=2);

  let res = [];
  if (sum >= 10) res.push("夕食を50%追加","翌朝に鼻うがい");
  if (d.some(v=>v>=5))
        res.push("お風呂に入る (有効48h)","顔を洗う","食器を洗う","洗濯機を回す");
  if (pairOnly)
        res.push("アイマスクを使う","耳栓を使う","電動自転車を利用","乾燥機能を使う");
  if (sum>=11 && sum<=14)
        res.push("お菓子を食べる","ギュ (ハグ) をする");
  if (sum>=4 && sum<=6) res.push("散歩に行く");
  if (sum==7)           res.push("メルカリで不用品を1つ出品");

  /* ―― 以下ゾロ目／ストレートなど ―― */
  if (freq[6]==3) res.push("温泉に行く");
  if (freq[1]==3) res.push("国内旅行 1泊2日");
  if (freq[2]==4||freq[3]==4) res.push("外食に行く");
  if (freq[4]==4) res.push("映画を鑑賞する");
  if (freq[5]==4) res.push("漫画喫茶に行く");
  if (freq[6]==4) res.push("サイクリングに行く");
  if (freq[1]==4) res.push("ゲーム1DAY");

  const key   = d.join(""),
        sortK = [...d].sort((a,b)=>a-b).join("");

  if (sortK==="1234") res.push("ルーレット旅に行く");
  if (sortK==="2345") res.push("○○教室ワークショップに参加");
  if (sortK==="3456") res.push("海外旅行に行く");
  if (["1212","2121","1221","2112","2211"].includes(key)) res.push("掃除1DAY");
  if (["2341","2413","3142","3412","4123","4312"].includes(key)) res.push("読書1DAY");
  if (key==="2224") res.push("●●系カフェに行く");
  if (key==="2255") res.push("追加で5回抽選する");
  if (key==="3334") res.push("登山/トレッキングに行く");
  if (key==="3335") res.push("泳ぎに行く");

  return res;
}

  /* ========= 効果音 ========= */
  let ctx;
  const beepSafe = (f,d)=>{
    try{
      ctx = ctx||new (window.AudioContext||window.webkitAudioContext)();
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.frequency.value=f; o.type="triangle"; o.connect(g); g.connect(ctx.destination);
      o.start(); g.gain.setValueAtTime(.35,ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+d/1000);
      o.stop(ctx.currentTime+d/1000);
    }catch{}
  };
  const rareFan = () => [880,660,1040].forEach((f,i)=>setTimeout(()=>beepSafe(f,200),200*i));

  /* ========= confetti 安全呼び出し ========= */
  const confettiSafe = window.confetti || (()=>{});

  /* ========= サイコロ生成 ========= */
  const createDie=()=>{const d=document.createElement("div");d.className="die rolling";
    ["front","back","right","left","top","bottom"].forEach(c=>{
      const f=document.createElement("div");f.className="face "+c;d.appendChild(f);
    });return d;};
  const setFace=(cube,v)=>{cube.className="die show-"+v;
    cube.querySelectorAll(".face").forEach(el=>el.textContent=v);};
  const rollVals=()=>Array.from({length:4},()=>1+Math.random()*6|0);

  /* ========= 抽選ロジック ========= */
  rollBtn.onclick = () => {
    rollBtn.disabled=true;
    animText.textContent="Rolling…";
    diceBox.innerHTML="";
    const cubes=[...Array(4)].map(()=>{const c=createDie();diceBox.appendChild(c);return c});
    const tick=setInterval(()=>beepSafe(500+Math.random()*300,60),90);

    setTimeout(()=>{
      clearInterval(tick);
      try{
        const vals=rollVals();
        cubes.forEach((c,i)=>setFace(c,vals[i]));
        [523,659,784].forEach((f,i)=>setTimeout(()=>beepSafe(f,160),180*i));
        confettiSafe({particleCount:120,spread:90,origin:{y:.75}});

        const got=evaluate(vals),inv=load(),map={}; inv.forEach(n=>map[n]=(map[n]||0)+1);
        let html="<h2>抽選結果</h2>";
        got.forEach(n=>{
          if((map[n]||0)>=MAX_HOLD){
            html+=`<div class="card strike">${n}<div class="small">所持上限で獲得無し</div></div>`;
          }else{
            inv.push(n); map[n]=(map[n]||0)+1;
            html+=`<div class="card">${n}</div>`;
            if(rareList.includes(n)&&map[n]===1){
              flashTxt.textContent=`New‼ ${n} を獲得しました！`;
              flash.classList.add("show"); rareFan();
            }
          }
        });
        resultBox.innerHTML = html;
        save(inv); renderInv();
      }catch(e){
        console.error("抽選処理でエラー:",e);
        alert("エラーが発生しました。再読み込みしてください。");
      }finally{
        animText.textContent="";
        flash.classList.remove("show");
        rollBtn.disabled=false;
      }
    },1100);
  };
});


/* ========= ルーレット発動 ========= */
rollBtn.onclick = () => {
  rollBtn.disabled = true;
  animText.textContent = "Rolling...";   // ← ASCII の ... に変更
  diceBox.innerHTML = "";

  const cubes = [...Array(4)].map(() => {
    const c = createDie();
    diceBox.appendChild(c);
    return c;
  });

  const tick = setInterval(() => beepSafe(500 + Math.random() * 300, 60), 90);

  setTimeout(() => {
    try {
      clearInterval(tick);
      const vals = rollVals();
      cubes.forEach((c, i) => setFace(c, vals[i]));
      [523, 659, 784].forEach((f, i) => setTimeout(() => beepSafe(f, 160), 180 * i));
      confettiSafe({ particleCount: 120, spread: 90, origin: { y: 0.75 } });

      const got = evaluate(vals), inv = load(), map = {};
      inv.forEach(n => (map[n] = (map[n] || 0) + 1));

      let html = "<h2>抽選結果</h2>";
      got.forEach(n => {
        if ((map[n] || 0) >= MAX_HOLD) {
          html += `<div class="card strike">${n}<div class="small">所持上限で獲得無し</div></div>`;
        } else {
          inv.push(n); map[n] = (map[n] || 0) + 1;
          html += `<div class="card">${n}</div>`;
          if (rareList.includes(n) && map[n] === 1) {
            flashTxt.textContent = "New!! " + n + " を獲得しました！";  // ← New!! に変更
            flash.classList.add("show");
            rareFan();
          }
        }
      });

      resultBox.innerHTML = html;
      save(inv);
      renderInv();
    } catch (e) {
      console.error("抽選処理でエラー:", e);
      alert("エラーが発生しました。再読み込みしてください。");
    } finally {
      animText.textContent = "";      // Rolling 表示を消す
      flash.classList.remove("show"); // フラッシュも確実に消す
      rollBtn.disabled = false;       // ボタンを必ず再度有効化
    }
  }, 1100);
};


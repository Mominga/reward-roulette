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
  animText.textContent = "Rolling...";
  diceBox.innerHTML = "";

  const cubes = [...Array(4)].map(() => {
    const c = createDie();
    diceBox.appendChild(c);
    return c;
  });

  const tick = setInterval(() => beep(520 + Math.random() * 280, 60), 90);

  setTimeout(() => {
    try {
      clearInterval(tick);
      const vals = rollVals();
      cubes.forEach((c, i) => setFace(c, vals[i]));
      [523, 659, 784].forEach((f, i) => setTimeout(() => beep(f, 160), 180 * i));
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.75 } });

      const got = evaluate(vals),
        inv = load(),
        map = {};
      inv.forEach(n => (map[n] = (map[n] || 0) + 1));

      let html = "<h2>抽選結果</h2>";
      got.forEach(n => {
        if ((map[n] || 0) >= MAX_HOLD) {
          html += `<div class="card strike">${n}<div class="small">所持上限で獲得無し</div></div>`;
        } else {
          inv.push(n);
          map[n] = (map[n] || 0) + 1;
          html += `<div class="card">${n}</div>`;
          if (rareList.includes(n) && map[n] === 1) {
            flashTxt.textContent = `New‼ ${n} を獲得しました！`;
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
      alert("エラーが発生しました。コンソールをご確認ください。");
    } finally {
      animText.textContent = ""; // Rolling 表示を消す
      flash.classList.remove("show"); // フラッシュが残る場合に備える
      rollBtn.disabled = false;       // ★ 必ずボタンを再有効化
    }
  }, 1100);
};

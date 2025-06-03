/* ========= Reward Roulette – 完全版 v13 ========= */


/* --- 定数 & テーブル -------------------------------- */
const MAX_HOLD = 2;
const rareList = [
  "温泉に行く","国内旅行 1泊2日","グルメロシアンルーレット","映画を鑑賞する","漫画喫茶に行く",
  "サイクリングに行く","ルーレット旅に行く","ゲーム1DAY","全力掃除 30 分タイマー","全力読書30分タイマー",
  "●●系カフェに行く","追加で5回抽選する","登山/トレッキングに行く","泳ぎに行く",
  "○○教室ワークショップに参加","海外旅行に行く","逆利き Day","冷水シャワー Day",
  "日本語10回だけ Day","ボランティアDay","24時間列車旅"
];
const ruleRows = [
  ["90% 合10+","夕食を50%追加/鼻うがい"],["80% 5/6含","お風呂/家事4種"],
  ["60% ペアのみ","アイマスク等"],["40% 合11-14","お菓子/ギュ"],
  ["2% 合4-6","散歩"],["2% 合7","フリマアプリに不用品を出品"],
  ["1% 666x","温泉"],["1% 111x","国内旅行 1泊2日"],
　["0.67% 3333","グルメロシアンルーレット"],
  ["0.4% 4444","映画を鑑賞する"],["0.4% 5555","漫画喫茶に行く"],["0.4% 6666","サイクリングに行く"],
  ["0.4% 1234","ルーレット旅に行く"],["0.4% 1111","ゲーム1DAY"],
  ["0.4% 1212系","全力掃除 30 分タイマー"],["0.4% 2341系","全力読書30分タイマー"],
  ["0.4% 2224","●●系カフェに行く"],["0.4% 2255","追加で5回抽選"],
  ["0.4% 3334","登山/トレッキングに行く"],["0.4% 3335","泳ぎに行く"],
  ["0.4% 1432","逆利き Day"],["0.4% 1551","冷水シャワー Day"],["0.4% 2332","日本語10回だけ Day"],
  ["0.4% 2442", "編み物グッズを買う"],
  ["0.25% 2345","○○教室ワークショップに参加"],["0.20% 3456","海外旅行に行く"],["0.2% 6464", "新しいChocozapに行く"]
  ["0.4% 3546","ボランティアDay"],["0.20% 6543","24時間列車旅"]
];

document.addEventListener("DOMContentLoaded",()=>{
  const $=id=>document.getElementById(id);
  const tbl=$("rulesTable"),diceBox=$("diceBox"),rollBtn=$("rollBtn"),resetBtn=$("resetBtn"),
        resultBox=$("result"),invList=$("invList"),flash=$("flash"),flashTxt=$("flashTxt"),animText=$("animText");

  tbl.innerHTML='<tr><th>条件</th><th>報酬</th></tr>'+ruleRows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join("");

  /* rarity rank */
  const rarityRank={};ruleRows.slice().reverse().forEach((r,i)=>{rarityRank[r[1].split('/')[0].trim()]=i;});

/* storage */
const load = () => JSON.parse(localStorage.getItem('inv') || '[]');
const save = a => localStorage.setItem('inv', JSON.stringify(a));

const escapeHtml = (str) =>
  str.replace(/&/g, "&amp;")
     .replace(/</g, "&lt;")
     .replace(/>/g, "&gt;");

const renderInv = () => {
  const inv = load();
  const countMap = {};
  inv.forEach(name => {
    if (typeof name === "string" && name.trim() !== "") {
      countMap[name] = (countMap[name] || 0) + 1;
    }
  });

  const entries = Object.entries(countMap);

  if (entries.length === 0) {
    invList.innerHTML = '<div class="small">まだ報酬はありません。</div>';
    return;
  }

  invList.innerHTML = entries.map(([name, count]) => {
    const safeText = escapeHtml(name);
    const safeData = encodeURIComponent(name);
    const badge = count > 1 ? `<span class="badge">×${count}</span>` : "";
    return `
      <div class="card reward-item" data-name="${safeData}">
        ${safeText} ${badge}
        <div class="small">クリックで1つ使用</div>
      </div>
    `;
  }).join("");

  document.querySelectorAll(".reward-item").forEach(el => {
    el.onclick = () => {
      const name = decodeURIComponent(el.dataset.name);
      consume(name);
    };
  });
};

resetBtn.onclick = () => {
  localStorage.removeItem('inv');
  renderInv();
};

function consume(name) {
  const inv = load();
  const index = inv.indexOf(name);
  if (index !== -1) {
    inv.splice(index, 1);
    save(inv);
    renderInv();

    // ✅ 使用音を鳴らす（使用時効果音）
    beep(660, 120); // ← 明るめの音（周波数660Hz、120ms）
  }
}



// 初期描画呼び出し
renderInv();

  /* dice */
  const createDie=()=>{const d=document.createElement('div');d.className='die rolling';["front","back","right","left","top","bottom"].forEach(f=>{const e=document.createElement('div');e.className='face '+f;d.appendChild(e);});return d;};
  const setFace=(c,v)=>{c.className='die show-'+v;c.querySelectorAll('.face').forEach(el=>el.textContent=v);};
  const rollVals=()=>Array.from({length:4},()=>1+Math.random()*6|0);

  /* sound/confetti */
  let ctx;const beep=(f,d)=>{try{ctx=ctx||new(window.AudioContext||window.webkitAudioContext)();const o=ctx.createOscillator(),g=ctx.createGain();o.type='triangle';o.frequency.value=f;o.connect(g);g.connect(ctx.destination);o.start();g.gain.setValueAtTime(.35,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+d/1000);o.stop(ctx.currentTime+d/1000);}catch{}};
  const rareFan=()=>[880,660,1040].forEach((f,i)=>setTimeout(()=>beep(f,200),200*i));
  const confettiSafe=window.confetti||(()=>{});
    /* evaluate */
  function evaluate(d){
    const sum = d.reduce((a,b)=>a+b,0),
          freq = {};
    d.forEach(v => freq[v] = (freq[v]||0)+1);

    const pairOnly = Object.values(freq).some(v=>v===2) &&
                     Object.values(freq).every(v=>v<=2);
    const key = d.join("");
    let r = [];

    if(sum >= 10) r.push("夕食を50%追加","翌朝に鼻うがい");
    if(d.some(v=>v>=5))
      r.push("お風呂に入る (有効48h)","顔を洗う","食器を洗う","洗濯機を回す");
    if(pairOnly)
      r.push("アイマスクを使う","耳栓を使う","電動自転車を利用","乾燥機能を使う");

    if(sum >= 11 && sum <= 14) r.push("お菓子を食べる","ギュ (ハグ) をする");
    if(sum >= 4  && sum <= 6)  r.push("散歩に行く");
    if(sum === 7)              r.push("フリマアプリに不用品を出品");

    /* ゾロ目・ストレート系 */
    if(freq[6]===3) r.push("温泉に行く");
    if(freq[1]===3) r.push("国内旅行 1泊2日");
    if(freq[3]===4) r.push("グルメロシアンルーレット");
    if(freq[4]===4) r.push("映画を鑑賞する");
    if(freq[5]===4) r.push("漫画喫茶に行く");
    if(freq[6]===4) r.push("サイクリングに行く");
    if(freq[1]===4) r.push("ゲーム1DAY");
    
if (key === "6661" || key === "6662" || key === "6663" ||
    key === "6664" || key === "6665" || key === "6666") {
  r.push("温泉に行く");
}
if (key === "1111" || key === "1112" || key === "1113" ||
    key === "1114" || key === "1115" || key === "1116") {
  r.push("国内旅行 1泊2日");
}
    
    if(key === "1234") r.push("ルーレット旅に行く");
    if(key === "2345") r.push("○○教室ワークショップに参加");
    if(key === "3456") r.push("海外旅行に行く");
    if (key === "2442") r.push("編み物グッズを買う");
    if (key === "6464") r.push("新しいChocozapに行く");


    if(["1212","2121","1221","2112","2211"].includes(key))
        r.push("全力掃除 30 分タイマー");
    if(["2341","2413","3142","3412","4123","4312"].includes(key))
        r.push("全力読書30分タイマー");

    if(key === "2224") r.push("●●系カフェに行く");
    if(key === "2255") r.push("追加で5回抽選する");
    if(key === "3334") r.push("登山/トレッキングに行く");
    if(key === "3335") r.push("泳ぎに行く");

    /* 新パターン */
    if(key === "1432") r.push("逆利き Day");
    if(key === "1551") r.push("冷水シャワー Day");
    if(key === "2332") r.push("日本語10回だけ Day");
    if(key === "3546") r.push("ボランティアDay");
    if(key === "6543") r.push("24時間列車旅");

    return r;
  }
  /* ===== Roll ===== */
  rollBtn.onclick = () => {
    rollBtn.disabled = true;
    animText.textContent = "Rolling...";
    diceBox.innerHTML = "";

    const cubes = [...Array(4)].map(()=>{
      const c = createDie();
      diceBox.appendChild(c);
      return c;
    });

    const tick = setInterval(()=>beep(520+Math.random()*300,60),90);

    setTimeout(()=>{
      clearInterval(tick);
      try{
        const vals = rollVals();
        cubes.forEach((c,i)=>setFace(c,vals[i]));
        [523,659,784].forEach((f,i)=>setTimeout(()=>beep(f,160),180*i));
        confettiSafe({particleCount:120,spread:90,origin:{y:.75}});

        /* evaluate & sort */
        const got = evaluate(vals)
                      .sort((a,b)=>rarityRank[a]-rarityRank[b]);

        const inv = load(), map = {};
        inv.forEach(n=>map[n]=(map[n]||0)+1);

        const gained=[], blocked=[];
        got.forEach(n=>{
          if((map[n]||0) >= MAX_HOLD) blocked.push(n);
          else {
            gained.push(n);
            inv.push(n);
            map[n] = (map[n]||0) + 1;
          }
        });

        /* 結果描画 */
        const card = n => "<div class='card'>"+n+"</div>";
        let html = "<h2>抽選結果</h2>"
                 + gained.map(card).join("")
                 + (blocked.length
                     ? "<div class='card strike'>"
                       + blocked.join("・")
                       + "<div class='small'>所持上限で獲得無し</div></div>"
                     : "");
        resultBox.innerHTML = html;

        save(inv);
        renderInv();

        /* 効果音：10%以下だけ */
        if(gained.some(n=>rarityRank[n] <= rarityRank["○○教室ワークショップに参加"]))
          rareFan();

      }finally{
        flash.classList.remove("show");
        animText.textContent = "";
        rollBtn.disabled = false;
      }
    },1100);
  };
});

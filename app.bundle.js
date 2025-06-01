/* ========= 定数 & 表 ========= */
const MAX_HOLD = 2;
const rareList = [
  "温泉に行く","国内旅行 1泊2日","グルメロシアンルーレット","映画を鑑賞する","漫画喫茶に行く",
  "サイクリングに行く","ルーレット旅に行く","ゲーム1DAY","全力掃除 30 分タイマー","全力読書30分タイマー",
  "●●系カフェに行く","追加で5回抽選する","登山/トレッキングに行く","泳ぎに行く",
  "○○教室ワークショップに参加","海外旅行に行く","逆利き Day","冷水シャワー Day",
  "日本語10回だけ Day","ボランティアDay","24時間列車旅"
];
const ruleRows=[ /* … 前回送った表をそのまま貼り付け … */ ];

/* ========= DOM など ========= */
document.addEventListener("DOMContentLoaded",()=>{
  const $=id=>document.getElementById(id);
  const rulesTable=$("rulesTable"),diceBox=$("diceBox"),rollBtn=$("rollBtn"),resetBtn=$("resetBtn"),
        invList=$("invList"),resultBox=$("result"),animText=$("animText"),
        flash=$("flash"),flashTxt=$("flashTxt");

  rulesTable.innerHTML="<tr><th>条件</th><th>報酬</th></tr>"+
    ruleRows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join("");

  /* rarity rank 生成 */
  const rarityRank={};
  ruleRows.slice().reverse().forEach((r,i)=>{rarityRank[r[1].replace(/\\/.*/,"").trim()]=i;});

  /* storage helpers */
  const load=()=>JSON.parse(localStorage.getItem("inv")||"[]");
  const save=a=>localStorage.setItem("inv",JSON.stringify(a));
  const renderInv=()=>{const l=load(),m={};l.forEach(x=>m[x]=(m[x]||0)+1);
    invList.innerHTML=l.length?Object.entries(m).map(([n,c])=>`<div class='card'>${n}${c>1?`<span class='badge'>×${c}</span>`:""}</div>`).join("")
      :'<div class=\"small\">まだ報酬はありません。</div>';};
  renderInv(); resetBtn.onclick=()=>{localStorage.removeItem("inv");renderInv();};

  /* dice helpers */
  const createDie=()=>{const d=document.createElement("div");d.className="die rolling";
    ["front","back","right","left","top","bottom"].forEach(f=>{const e=document.createElement("div");e.className="face "+f;d.appendChild(e);});
    return d;};
  const setFace=(c,v)=>{c.className="die show-"+v;c.querySelectorAll(".face").forEach(el=>el.textContent=v);};
  const rollVals=()=>Array.from({length:4},()=>1+Math.random()*6|0);

  /* sound/confetti */
  let ctx; const beep=(f,d)=>{try{ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();
    const o=ctx.createOscillator(),g=ctx.createGain();o.type="triangle";o.frequency.value=f;o.connect(g);g.connect(ctx.destination);
    o.start();g.gain.setValueAtTime(.35,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+d/1000);o.stop(ctx.currentTime+d/1000);}catch{}};
  const confettiSafe=window.confetti||(()=>{});
  const rareFan = () => [880,660,1040].forEach((f,i)=>setTimeout(()=>beep(f,200),200*i));

  /* ========= evaluate（今回更新） ========= */
  function evaluate(d){ /* … 前回送った evaluate 関数 … */ }

  /* ========= Roll ハンドラ（フル） ========= */
  rollBtn.onclick=()=>{
    rollBtn.disabled=true;
    animText.textContent="Rolling...";
    diceBox.innerHTML="";
    const cubes=[...Array(4)].map(()=>{const c=createDie();diceBox.appendChild(c);return c});
    const tick=setInterval(()=>beep(500+Math.random()*300,60),90);

    setTimeout(()=>{
      clearInterval(tick);
      try{
        const vals=rollVals(); cubes.forEach((c,i)=>setFace(c,vals[i]));
        [523,659,784].forEach((f,i)=>setTimeout(()=>beep(f,160),180*i));
        confettiSafe({particleCount:120,spread:90,origin:{y:.75}});

        /* 判定 → レア順ソート */
        const got=evaluate(vals).sort((a,b)=>rarityRank[a]-rarityRank[b]);
        const inv=load(),map={}; inv.forEach(n=>map[n]=(map[n]||0)+1);

        const gained=[],blocked=[];
        got.forEach(n=>{
          if((map[n]||0)>=MAX_HOLD){blocked.push(n);}
          else{gained.push(n);inv.push(n);map[n]=(map[n]||0)+1;}
        });

        let html="<h2>抽選結果</h2>"+
          gained.map(n=>\"<div class='card'>\"+n+\"</div>\").join(\"\")+
          (blocked.length?\"<div class='card strike'>\"+blocked.join(\"・\")+
           \"<div class='small'>所持上限で獲得無し</div></div>\":\"\");
        resultBox.innerHTML=html;
        save(inv); renderInv();
        if(gained.some(n=>rarityRank[n]<=rarityRank[\"○○教室ワークショップに参加\"])) rareFan(); // ≒10%以下
      }finally{
        flash.classList.remove(\"show\");
        animText.textContent=\"\";
        rollBtn.disabled=false;
      }
    },1100);
  };
});

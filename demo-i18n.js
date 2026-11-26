// 단계별 시연(demo.html)의 언어: 한국어·영어·대만 중국어(번체).
// 화면 문구는 demo.html 의 L(한국어, English, 中文) 로, 서버가 주는 데이터(상태 이름·과목·메시지·이름)는
// 아래 trData 로 바꾼다. 데이터는 모두 seed.py 가 지어낸 시연용이다.
const LANGS = {ko:"한국어", en:"English", "zh-TW":"繁體中文"}, VOICE_LANG = {ko:"ko-KR", en:"en-US", "zh-TW":"zh-TW"};
let LANG = (() => { const q = new URLSearchParams(location.search).get("lang"); if(LANGS[q]) return q;
  try{ const v = localStorage.getItem("harubook-lang"); if(LANGS[v]) return v; }catch(e){} return "ko"; })();
const L = (ko, en, zh) => LANG === "en" ? en : LANG === "zh-TW" ? zh : ko;

// ── 한글 이름 → 로마자(개정 로마자 표기, 성씨는 흔히 쓰는 표기) ──
const ROM_I = ["g","kk","n","d","tt","r","m","b","pp","s","ss","","j","jj","ch","k","t","p","h"];
const ROM_V = ["a","ae","ya","yae","eo","e","yeo","ye","o","wa","wae","oe","yo","u","wo","we","wi","yu","eu","ui","i"];
const ROM_F = ["","k","k","k","n","n","n","t","l","k","m","l","l","l","p","l","m","p","p","t","t","ng","t","t","k","t","p","t"];
const SURNAME = {"김":"Kim","이":"Lee","박":"Park","최":"Choi","정":"Jung","강":"Kang","조":"Cho","윤":"Yoon","장":"Jang","임":"Lim",
  "한":"Han","오":"Oh","서":"Seo","신":"Shin","권":"Kwon","황":"Hwang","안":"Ahn","송":"Song","류":"Ryu","유":"Yoo","홍":"Hong",
  "전":"Jeon","고":"Ko","문":"Moon","양":"Yang","손":"Son","배":"Bae","백":"Baek","허":"Heo","남":"Nam","노":"Noh","하":"Ha"};
function romSyl(s){ return [...s].map(ch => { const c = ch.charCodeAt(0) - 0xAC00; if(c < 0 || c > 11171) return ch;
  return ROM_I[Math.floor(c / 588)] + ROM_V[Math.floor(c % 588 / 28)] + ROM_F[c % 28]; }).join(""); }
const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;
const romWord = w => cap(romSyl(w));
const romName = n => /^[가-힣]{2,4}$/.test(n) ? `${SURNAME[n[0]] || romWord(n[0])} ${romWord(n.slice(1))}` : n;

// ── 서버 데이터의 한국어 → 영어·중국어 ──
const DATA = {   // 한국어: [English, 中文]
  "국어":["Korean","國語"], "수학":["Math","數學"], "영어":["English","英語"], "한자":["Hanja","漢字"], "과학":["Science","自然"], "사고력":["Thinking","思考力"],
  "인쇄 대기":["Waiting to print","待印刷"], "인쇄 완료":["Printed","印刷完成"], "제본 검수":["Binding check","裝訂檢驗"],
  "묶음 포장":["Bundled","已包成套組"], "교사 묶음 포장":["Teacher bundling","老師套組包裝"], "지국 박스 포장":["Branch boxing","分處裝箱"],
  "박스 적재":["Boxed","已裝箱"], "출고":["Shipped","已出貨"], "출고 상차":["Truck loading","出貨裝車"], "지국 입고":["Received at branch","分處入庫"],
  "교사 수령":["Teacher pickup","老師領取"], "학생 전달":["Delivered to student","交給學生"], "진행 중":["In progress","進行中"], "마감":["Closed","已結束"],
  "불량 등록":["Defect logged","登記不良"], "불량 폐기":["Defect discarded","不良報廢"], "완료":["Done","完成"],
  "일부만 함(지연)":["Partly done (delayed)","只做一部分（延遲）"], "결석·미실시":["Absent / not held","缺席・未上課"],
  "교재 풀이":["Workbook","講義練習"], "시험·평가":["Test","測驗"], "신규 등록":["New enrollment","新入會"], "호 지정":["Set issue","指定期數"],
  "주당 분량":["Weekly pace","每週份量"], "휴회":["Pause","暫停"], "휴회 해제":["Resume","恢復"], "복습(되돌리기)":["Review (go back)","複習（退回）"],
  "건너뛰기":["Skip","跳過"], "수강 재개":["Restart","恢復上課"], "수강 중단":["Stop","停止上課"], "본문":["Body","內頁"],
  "사진에서 QR 코드를 읽음":["QR code read from the photo","從照片讀取 QR 碼"], "시연":["Demo","示範"], "시연 교사":["Demo teacher","示範老師"],
  "운영자":["Operator","管理員"], "절반만 풀었음":["Only half done","只寫了一半"], "로그인 없음":["No login","未登入"],
  "글꼴 1종이 포함돼 있습니다(윤곽선 원고가 아님).":["Contains 1 embedded font (not outlined).","含 1 種內嵌字型（未轉外框）。"],
  "원고에 도련이 있습니다. 재단선 크기로 얹으므로 도련은 쓰지 않습니다.":["The file has bleed. It is placed at trim size, so the bleed is not used.","原稿含出血。依裁切尺寸置入，不使用出血。"],
  "월":["Mon","一"], "화":["Tue","二"], "수":["Wed","三"], "목":["Thu","四"], "금":["Fri","五"], "토":["Sat","六"], "일":["Sun","日"],
};
const PART = {"북부":["North","北部"], "남부":["South","南部"], "동부":["East","東部"], "서부":["West","西部"], "중부":["Central","中部"]};
const pick = pair => LANG === "en" ? pair[0] : pair[1];
const teacherName = n => L(n + " 선생님", romName(n), romName(n) + " 老師");
const subjectLike = s => DATA[s] ? pick(DATA[s]) : s;
const RULES = [   // [정규식, (일치, ...묶음) => 번역]
  [/^(.+) A단계 (\d+)호$/, (m, s, n) => L(m, `${subjectLike(s)} Level A · No. ${n}`, `${subjectLike(s)} A 級 第 ${n} 期`)],
  [/^(\S+) 선생님$/, (m, n) => teacherName(n)],
  [/^(\S+)지국$/, (m, n) => L(m, `${romWord(n)} Branch`, `${romWord(n)} 分處`)],
  [/^(\S+)본부\(가상\)$/, (m, n) => L(m, `${romWord(n)} HQ (fictional)`, `${romWord(n)} 總部（虛構）`)],
  [/^(북부|남부|동부|서부|중부) (\d+)노선$/, (m, p, n) => L(m, `${PART[p][0]} Route ${n}`, `${PART[p][1]} ${n} 號路線`)],
  [/^초(\d)$/, (m, n) => L(m, `Grade ${n}`, `小${"一二三四五六"[n - 1]}`)],
  [/^(\d+)세$/, (m, n) => L(m, `Age ${n}`, `${n} 歲`)],
  [/^인쇄(\d+)호기$/, (m, n) => L(m, `Press ${n}`, `${n} 號印刷機`)],
  [/^(\d+)번 (\S+) · (\S+) 선생님$/, (m, k, s, t) => L(m, `#${k} ${romName(s)} · ${teacherName(t)}`, `第 ${k} 本 ${romName(s)} · ${teacherName(t)}`)],
  [/^다른 묶음의 책입니다 → (\S+) 선생님 묶음으로 보내세요\.$/, (m, t) => L(m, `This book belongs to another bundle. Send it to ${teacherName(t)}'s bundle.`, `這是別的套組的書，請放進 ${teacherName(t)}的套組。`)],
  [/^상차 (\d+)\/(\d+) · 운송장 (\S+)$/, (m, a, b, w) => L(m, `Loaded ${a}/${b} · waybill ${w}`, `裝車 ${a}/${b} · 運單 ${w}`)],
  [/^지국 입고 · 묶음 (\d+)개$/, (m, n) => L(m, `Received at branch · ${n} bundles`, `分處入庫 · ${n} 個套組`)],
  [/^(\S+) · (\d+)\/(\d+)$/, (m, s, a, b) => L(m, `${romName(s)} · ${a}/${b}`, `${romName(s)} · ${a}/${b}`)],
  [/^(\S+) 전달 완료$/, (m, s) => L(m, `Delivered to ${romName(s)}`, `已交給 ${romName(s)}`)],
  [/^(\S+) · (\S+): (.+) → 이번 주 생산 보류$/, (m, s, sub, why) => L(m, `${romName(s)} · ${subjectLike(sub)}: ${trStr(why)} → not printed this week`, `${romName(s)} · ${subjectLike(sub)}：${trStr(why)} → 本週暫停生產`)],
  [/^(.+) — (.+)$/, (m, a, b) => `${trStr(a)} — ${trStr(b)}`],
  [/^(\S+) · (\S+)$/, (m, a, b) => DATA[a] && DATA[b] ? `${subjectLike(a)} · ${subjectLike(b)}` : m],
];
function trStr(s){
  if(LANG === "ko" || typeof s !== "string" || !/[가-힣]/.test(s)) return s;
  if(DATA[s]) return pick(DATA[s]);
  for(const [re, f] of RULES){ const m = s.match(re); if(m){ const out = f(...m); if(out !== s) return out; } }
  return romName(s);                      // 남은 것은 대개 사람 이름(지어낸 이름)
}
// 응답 전체를 훑어 글자열을 바꾼다(코드·숫자·영문은 그대로). 원본은 건드리지 않는다.
function trData(v){
  if(LANG === "ko") return v;
  if(Array.isArray(v)) return v.map(trData);
  if(v && typeof v === "object"){ const o = {}; for(const k in v) o[k] = trData(v[k]); return o; }
  return trStr(v);
}

// ── 화면 공통 문구 ──
const U = {
  ko:{ai:"AI 생성 장면 · 실제 인물 아님", prep:n => `나레이션 음성을 준비하고 있습니다… (${n}개)`, run:"실행 중입니다…",
      end:"시연을 마쳤습니다. ← 로 원하는 단계를 다시 볼 수 있습니다.", data:"시연 데이터를 준비하고 있습니다…",
      pause:"⏸ 일시정지", cont:"▶ 계속", hintPaused:"<b>일시정지</b> · 스페이스로 계속", hintPlay:"스페이스 멈춤 · → 건너뛰기 · ← 앞 단계",
      press:"→ 누르면", next:"→ 다음:", last:"마지막 단계입니다", play:"🔊 시연 시작",
      rec:"공개용 녹화판 — 버튼은 실제 시스템으로 미리 돌려 둔 결과를 보여 줍니다. 이름·지점은 모두 지어낸 것입니다."},
  en:{ai:"AI-generated scene · not real people", prep:n => `Loading narration audio… (${n})`, run:"Running…",
      end:"The demo is over. Use ← to revisit any step.", data:"Preparing demo data…",
      pause:"⏸ Pause", cont:"▶ Resume", hintPaused:"<b>Paused</b> · Space to resume", hintPlay:"Space pause · → skip · ← previous step",
      press:"→ runs", next:"→ Next:", last:"This is the last step", play:"🔊 Start demo",
      rec:"Public recorded version: buttons show results recorded from the real system. All names and branches are made up.",
      h1:"HaruBook demo: from sign-up to the student's hands", fake:"All names and branches are made up",
      show:"▶ Full screen (step by hand)", ops:"Open the operations screen",
      start:'<h3 id="start-title">🔊 Narrated demo</h3><p>Switches to full screen and runs to the end with narration. Space pauses, Esc stops.</p>',
      fresh:"Start from the beginning<small>Reset the demo data and begin at step 1</small>",
      resume:"Continue from here<small>Keep the data and start at the current step</small>", cancel:"Cancel"},
  "zh-TW":{ai:"AI 生成畫面 · 非真實人物", prep:n => `正在準備旁白語音…（${n} 段）`, run:"執行中…",
      end:"示範結束。可按 ← 回到任何步驟。", data:"正在準備示範資料…",
      pause:"⏸ 暫停", cont:"▶ 繼續", hintPaused:"<b>已暫停</b> · 按空白鍵繼續", hintPlay:"空白鍵暫停 · → 略過 · ← 上一步",
      press:"→ 執行", next:"→ 下一步：", last:"這是最後一步", play:"🔊 開始示範",
      rec:"公開錄製版：按鈕顯示的是用實際系統預先跑出的結果。所有姓名與分處皆為虛構。",
      h1:"HaruBook 示範：從入會到交到學生手上", fake:"所有姓名與分處皆為虛構",
      show:"▶ 全螢幕（手動翻頁）", ops:"開啟營運畫面",
      start:'<h3 id="start-title">🔊 旁白示範</h3><p>切換為全螢幕，並搭配旁白自動進行到最後。空白鍵暫停，Esc 結束。</p>',
      fresh:"從頭開始<small>重設示範資料，從第 1 步開始</small>",
      resume:"從目前位置繼續<small>保留資料，從目前的步驟開始</small>", cancel:"取消"}};
const ui = k => U[LANG][k] ?? U.ko[k];

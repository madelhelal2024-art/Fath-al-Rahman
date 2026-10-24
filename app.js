"use strict";

// Page-to-audio pairing follows the original upload order, as confirmed by
// the content owner on 2026-10-25. Individual segments are provisional.
const lessons = [
  {
    id: "letters", number: "١", title: "الحروف الهجائية", subtitle: "تعرّف على أشكال الحروف وأسمائها.", chapter: "التعرّف على الحروف", page: "٥", width: 576, height: 803, image: "assets/pages/01-letters.webp", audio: "assets/audio/01-letters.m4a",
    questions: [
      { text: "اختر حرف الألف", options: ["ب", "أ", "ء", "ت"], answer: "أ", explanation: "أحسنت! هذا حرف الألف." },
      { text: "أين حرف الهمزة؟", options: ["ت", "ب", "ء", "أ"], answer: "ء", explanation: "صحيح! هذه همزة مفردة." },
      { text: "اختر حرف الباء", options: ["ب", "ن", "ت", "ث"], answer: "ب", explanation: "رائع! حرف الباء له نقطة أسفل الحرف." }
    ]
  },
  {
    id: "fatha", number: "٢", title: "الحروف بالفتحة", subtitle: "لاحظ موضع الفتحة أعلى كل حرف، ثم اقرأه.", chapter: "الحركات القصيرة", page: "التدريب", width: 576, height: 755, image: "assets/pages/02-fatha.webp", audio: "assets/audio/02-fatha.m4a",
    questions: [
      { text: "اختر الباء بالفتحة", options: ["بُ", "بَ", "بِ", "بْ"], answer: "بَ", explanation: "أحسنت! الفتحة فوق الحرف: بَ." },
      { text: "اختر التاء بالفتحة", options: ["تِ", "تْ", "تَ", "تُ"], answer: "تَ", explanation: "صحيح! نقرأها: تَ." },
      { text: "أين حرف الجيم بالفتحة؟", options: ["جَ", "جِ", "جُ", "جْ"], answer: "جَ", explanation: "رائع! الفتحة أعلى الجيم." }
    ]
  },
  {
    id: "words1", number: "٣", title: "كلمات بالفتحة · تدريب ١", subtitle: "اقرأ الكلمات القصيرة المكوّنة من حروف مفتوحة.", chapter: "قراءة الكلمات", page: "١٣", width: 576, height: 826, image: "assets/pages/03-words-1.webp", audio: "assets/audio/03-words-1.m4a",
    questions: [
      { text: "أكمل الكلمة: وَجَـ", options: ["ـبَ", "ـدَ", "ـلَ", "ـتَ"], answer: "ـدَ", explanation: "صحيح! الكلمة: وَجَدَ." },
      { text: "اختر كلمة وَعَدَ", options: ["وَلَدَ", "وَجَدَ", "وَعَدَ", "عَدَدَ"], answer: "وَعَدَ", explanation: "أحسنت! وَعَدَ." },
      { text: "أكمل الكلمة: كَتَـ", options: ["ـبَ", "ـدَ", "ـلَ", "ـمَ"], answer: "ـبَ", explanation: "رائع! الكلمة: كَتَبَ." }
    ]
  },
  {
    id: "words2", number: "٤", title: "كلمات بالفتحة · تدريب ٢", subtitle: "تدرّب على كلمات جديدة ثم اختبر فهمك.", chapter: "قراءة الكلمات", page: "١٤", width: 576, height: 822, image: "assets/pages/04-words-2.webp", audio: "assets/audio/04-words-2.m4a",
    questions: [
      { text: "أي كلمة تبدأ بحرف التاء؟", options: ["وَقَعَ", "فَصَلَ", "تَرَكَ", "صَرَفَ"], answer: "تَرَكَ", explanation: "صحيح! تَرَكَ تبدأ بالتاء." },
      { text: "أكمل الكلمة: سَرَـ", options: ["ـكَ", "ـقَ", "ـحَ", "ـبَ"], answer: "ـقَ", explanation: "رائع! الكلمة: سَرَقَ." },
      { text: "اختر الكلمة: فَصَلَ", options: ["فَصَلَ", "فَصَحَ", "فَضَلَ", "فَصَرَ"], answer: "فَصَلَ", explanation: "أحسنت! أحسنت قراءة الكلمة." }
    ]
  }
];

const $ = (id) => document.getElementById(id);
const arabicDigits = (n) => String(n).replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[digit]);
const completedKey = "fath-al-rahman-completed-v1";
let completed = new Set();
try { completed = new Set(JSON.parse(localStorage.getItem(completedKey) || "[]")); } catch { /* Local storage may be unavailable. */ }

let currentIndex = 0;
let mode = "book";
let questionIndex = 0;
let selected = null;
let score = 0;
const matchingPairs = [{ letter: "أ", name: "ألف" }, { letter: "ء", name: "همزة" }, { letter: "ب", name: "باء" }];
let matchingDone = new Set();
let matchingSelection = null;
const audio = $("page-audio");
let activeClipIndex = null;
let activeClipEnd = 0;

const letterNames = ["ا","ء","ب","ت","ث","ج","ح","خ","د","ذ","ر","ز","س","ش","ص","ض","ط","ظ","ع","غ","ف","ق","ك","ل","م","ن","ه","و","ي","ى"];
const fathaLetters = ["أَ","بَ","تَ","ثَ","جَ","حَ","خَ","دَ","ذَ","رَ","زَ","سَ","شَ","صَ","ضَ","طَ","ظَ","عَ","غَ","فَ","قَ","كَ","لَ","مَ","نَ","هَ","وَ","يَ"];

function gridHotspots(columnsX, rowsY, labels, width, height) {
  return rowsY.flatMap((y, row) => columnsX.map((x, col) => {
    const index = row * columnsX.length + col;
    return { index, x, y, width, height, label: labels?.[index] || `الكلمة ${arabicDigits(index + 1)}` };
  }));
}

function getPageHotspots(pageId) {
  if (pageId === "letters") return gridHotspots([82.2,67.2,50,33.1,18.1], [22.5,33.8,44.7,55,65.3,76], letterNames, 12.4, 9.2);
  if (pageId === "fatha") return gridHotspots([80,60.4,39.8,20.2], [23.7,32.8,41.6,50.3,59.2,68.2,76.9], fathaLetters, 14, 8.5);
  if (pageId === "words1") return gridHotspots([81.4,60.9,40.5,21.1], [23.2,32.8,43.2,53.5,63.6,74,83.5], null, 18, 8.4);
  const regular = gridHotspots([81.4,60.9,40.5,21.1], [23.1,33,43.1,53.3,64], null, 18, 8.4);
  const wide = [76.2,86.2].flatMap((y, row) => [72.1,30.2].map((x, col) => ({ index:20 + row * 2 + col, x, y, width:41, height:8.8, label:`الكلمة ${arabicDigits(21 + row * 2 + col)}` })));
  return [...regular, ...wide];
}

function resizePageImages() {
  const { width, height } = lessons[currentIndex];
  const ratio = width / height;
  $("page-interactive").style.width = `${Math.round(Math.min(590, innerHeight * .55) * ratio)}px`;
  document.querySelector("#zoom-dialog .zoom-page").style.width = `${Math.round(Math.min(750, innerHeight * .94 - 62) * ratio)}px`;
}

function renderHotspots() {
  const lesson = lessons[currentIndex];
  const segments = window.PAGE_SEGMENTS[lesson.id];
  const hotspots = getPageHotspots(lesson.id);
  for (const root of [$("page-hotspots"), $("zoom-hotspots")]) {
    root.replaceChildren();
    for (const spot of hotspots) {
      const available = !!segments[spot.index];
      const button = document.createElement("button");
      button.type = "button";
      button.className = "audio-hotspot" + (available ? "" : " unavailable");
      button.dataset.clipIndex = String(spot.index);
      button.style.left = `${spot.x}%`;
      button.style.top = `${spot.y}%`;
      button.style.width = `${spot.width}%`;
      button.style.height = `${spot.height}%`;
      button.disabled = !available;
      button.setAttribute("aria-label", available ? `استمع إلى ${spot.label}` : `لا يتوفر مقطع صوتي مستقل لـ ${spot.label} حاليًا`);
      button.title = available ? `استمع إلى ${spot.label}` : "هذا العنصر يحتاج مراجعة التسجيل";
      if (available) button.addEventListener("click", () => playClip(spot.index));
      root.append(button);
    }
  }
  $("segment-disclaimer").textContent = lesson.id === "letters"
    ? "ملاحظة: رُصد ٢٩ مقطعًا صوتيًا مقابل ٣٠ عنصرًا. آخر عنصر معلّم للمراجعة. جميع المقاطع بحاجة إلى تدقيق سمعي قبل اعتمادها."
    : "المقاطع الفردية محددة مبدئيًا وفق فواصل الصمت وترتيب الصفحة، وتحتاج تدقيقًا سمعيًا قبل اعتمادها.";
}

function clearClip() {
  activeClipIndex = null;
  activeClipEnd = 0;
  for (const button of document.querySelectorAll(".audio-hotspot.active")) button.classList.remove("active");
}

function playClip(index) {
  const segment = window.PAGE_SEGMENTS[lessons[currentIndex].id]?.[index];
  if (!segment) return;
  if (activeClipIndex === index && !audio.paused) { audio.pause(); return; }
  audio.pause();
  clearClip();
  activeClipIndex = index;
  activeClipEnd = segment[1];
  audio.currentTime = segment[0];
  for (const button of document.querySelectorAll(`[data-clip-index="${index}"]`)) button.classList.add("active");
  const playing = audio.play();
  if (playing?.catch) playing.catch(() => clearClip());
}

function persistProgress() {
  try { localStorage.setItem(completedKey, JSON.stringify([...completed])); } catch { /* Keep progress in memory. */ }
}

function renderNavigation() {
  $("lesson-nav").replaceChildren();
  lessons.forEach((lesson, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "lesson-link";
    if (index === currentIndex) button.setAttribute("aria-current", "page");
    button.innerHTML = `<span class="lesson-index">${lesson.number}</span><span class="lesson-copy"><strong>${lesson.title}</strong><small>${lesson.chapter}</small></span><span class="check-icon" aria-label="${completed.has(lesson.id) ? "مكتمل" : ""}">${completed.has(lesson.id) ? "✓" : ""}</span>`;
    button.addEventListener("click", () => { goToLesson(index); closeMobileMenu(); });
    $("lesson-nav").append(button);
  });
  $("progress-count").textContent = `${arabicDigits(completed.size)} / ${arabicDigits(lessons.length)}`;
  $("progress-bar").style.width = `${100 * completed.size / lessons.length}%`;
}

function goToLesson(index) {
  if (index < 0 || index >= lessons.length) return;
  audio.pause();
  clearClip();
  currentIndex = index;
  const lesson = lessons[index];
  $("lesson-chapter").textContent = lesson.chapter;
  $("lesson-title").textContent = lesson.title;
  $("lesson-subtitle").textContent = lesson.subtitle;
  $("lesson-counter").textContent = `الدرس ${lesson.number} من ${arabicDigits(lessons.length)}`;
  $("page-image").src = lesson.image;
  $("page-image").alt = `صفحة كتاب فتح الرحمن: ${lesson.title}`;
  $("zoom-image").src = lesson.image;
  $("zoom-image").alt = $("page-image").alt;
  $("zoom-title").textContent = lesson.title;
  $("page-label").textContent = lesson.page === "التدريب" ? "صفحة الحروف بالفتحة" : `صفحة ${lesson.page}`;
  audio.src = lesson.audio;
  audio.load();
  audio.playbackRate = Number($("audio-speed").value);
  resizePageImages();
  renderHotspots();
  $("prev-button").disabled = index === 0;
  $("next-button").disabled = index === lessons.length - 1;
  questionIndex = 0; score = 0; selected = null;
  renderNavigation();
  renderQuestion();
  renderMatching();
  renderCompleteButton();
  if (location.hash !== `#${lesson.id}`) history.replaceState(null, "", `#${lesson.id}`);
}

function renderCompleteButton() {
  const done = completed.has(lessons[currentIndex].id);
  $("mark-complete").classList.toggle("done", done);
  $("mark-complete").querySelector("span").textContent = done ? "اكتملت مراجعة هذه الصفحة ✓" : "أنهيت الاستماع والمراجعة";
  $("mark-complete").setAttribute("aria-pressed", String(done));
}

function markComplete() {
  completed.add(lessons[currentIndex].id);
  persistProgress(); renderNavigation(); renderCompleteButton();
}

function setMode(nextMode) {
  mode = nextMode;
  for (const next of ["book", "practice"]) {
    const active = next === mode;
    $("tab-" + next).classList.toggle("active", active);
    $("tab-" + next).setAttribute("aria-selected", String(active));
    $("panel-" + next).hidden = !active;
  }
  if (mode === "practice") audio.pause();
}

function renderQuestion() {
  const questions = lessons[currentIndex].questions;
  const finished = questionIndex >= questions.length;
  $("question-progress").textContent = finished ? "اكتمل التدريب" : `السؤال ${arabicDigits(questionIndex + 1)} من ${arabicDigits(questions.length)}`;
  $("score-pill").textContent = `النقاط: ${arabicDigits(score)}`;
  $("question-progress-bar").style.width = `${finished ? 100 : 100 * (questionIndex + 1) / questions.length}%`;
  $("quiz-options").replaceChildren();
  $("feedback").hidden = true;
  $("feedback").className = "feedback";
  $("next-question").hidden = true;
  if (finished) {
    $("question-title").textContent = `أتممت التدريب! نتيجتك ${arabicDigits(score)} من ${arabicDigits(questions.length)}`;
    $("question-hint").textContent = "يمكنك إعادة التدريب أو الانتقال إلى الصفحة التالية.";
    $("next-question").textContent = currentIndex < lessons.length - 1 ? "الدرس التالي ←" : "العودة إلى الكتاب";
    $("next-question").hidden = false;
    if (score === questions.length) markComplete();
    return;
  }
  const question = questions[questionIndex];
  $("question-title").textContent = question.text;
  $("question-hint").textContent = "اختر الإجابة الصحيحة. يمكنك المحاولة مرة أخرى إذا أخطأت.";
  selected = null;
  question.options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quiz-option";
    button.textContent = option;
    button.addEventListener("click", () => chooseAnswer(option, button));
    $("quiz-options").append(button);
  });
}

function chooseAnswer(answer, clickedButton) {
  if (selected !== null) return;
  const question = lessons[currentIndex].questions[questionIndex];
  const correct = answer === question.answer;
  const feedback = $("feedback");
  feedback.hidden = false;
  feedback.className = "feedback " + (correct ? "success" : "error");
  if (correct) {
    selected = answer;
    score++;
    feedback.textContent = `✓ ${question.explanation}`;
    $("quiz-options").querySelectorAll("button").forEach(button => {
      button.disabled = true;
      if (button.textContent === answer) button.classList.add("correct");
    });
    $("score-pill").textContent = `النقاط: ${arabicDigits(score)}`;
    $("next-question").textContent = questionIndex === lessons[currentIndex].questions.length - 1 ? "إنهاء التدريب ←" : "السؤال التالي ←";
    $("next-question").hidden = false;
  } else {
    clickedButton.classList.add("wrong");
    clickedButton.disabled = true;
    feedback.textContent = "حاول مرة أخرى. لاحظ شكل الحرف أو الكلمة جيدًا.";
  }
}

function nextQuestion() {
  if (questionIndex >= lessons[currentIndex].questions.length) {
    if (currentIndex < lessons.length - 1) goToLesson(currentIndex + 1);
    else setMode("book");
    return;
  }
  questionIndex++;
  renderQuestion();
}

function resetQuiz() { questionIndex = 0; score = 0; selected = null; renderQuestion(); }
function renderMatching() {
  const card = $("matching-card");
  card.hidden = currentIndex !== 0;
  matchingDone = new Set();
  matchingSelection = null;
  if (card.hidden) return;
  $("matching-feedback").textContent = "ابدأ باختيار حرف.";
  const letters = $("matching-letters");
  const names = $("matching-names");
  letters.replaceChildren(); names.replaceChildren();
  const createTile = (value, type) => {
    const tile = document.createElement("button");
    tile.className = "matching-tile";
    tile.type = "button";
    tile.textContent = value;
    tile.addEventListener("click", () => matchChoice(type, value, tile));
    return tile;
  };
  for (const pair of matchingPairs) letters.append(createTile(pair.letter, "letter"));
  for (const pair of [matchingPairs[2], matchingPairs[0], matchingPairs[1]]) names.append(createTile(pair.name, "name"));
}

function matchChoice(type, value, tile) {
  if (tile.disabled) return;
  if (!matchingSelection) {
    if (type !== "letter") { $("matching-feedback").textContent = "اختر حرفًا أولًا من العمود الأيمن."; return; }
    matchingSelection = { value, tile };
    tile.classList.add("selected");
    $("matching-feedback").textContent = "اختر الآن اسم هذا الحرف.";
    return;
  }
  if (type === "letter") {
    matchingSelection.tile.classList.remove("selected");
    matchingSelection = { value, tile };
    tile.classList.add("selected");
    return;
  }
  const expectedName = matchingPairs.find(pair => pair.letter === matchingSelection.value)?.name;
  if (expectedName === value) {
    matchingDone.add(matchingSelection.value);
    for (const matchedTile of [matchingSelection.tile, tile]) { matchedTile.classList.remove("selected"); matchedTile.classList.add("matched"); matchedTile.disabled = true; }
    $("matching-feedback").textContent = matchingDone.size === matchingPairs.length ? "🌟 ممتاز! وصلت كل حرف باسمه الصحيح." : "✓ إجابة صحيحة! أكمل التوصيل.";
  } else {
    matchingSelection.tile.classList.remove("selected");
    $("matching-feedback").textContent = "حاول مرة أخرى. هذا الاسم لا يطابق الحرف.";
  }
  matchingSelection = null;
}
function closeMobileMenu() { $("sidebar").classList.remove("open"); $("mobile-backdrop").hidden = true; $("menu-button").setAttribute("aria-expanded", "false"); }

function initialize() {
  renderNavigation();
  const routeIndex = lessons.findIndex(lesson => `#${lesson.id}` === location.hash);
  goToLesson(routeIndex >= 0 ? routeIndex : 0);
  $("prev-button").addEventListener("click", () => goToLesson(currentIndex - 1));
  $("next-button").addEventListener("click", () => goToLesson(currentIndex + 1));
  $("mark-complete").addEventListener("click", markComplete);
  audio.addEventListener("ended", markComplete);
  audio.addEventListener("pause", () => { if (audio.paused) clearClip(); });
  audio.addEventListener("timeupdate", () => { if (activeClipIndex !== null && audio.currentTime >= activeClipEnd) audio.pause(); });
  $("audio-speed").addEventListener("change", (event) => { audio.playbackRate = Number(event.target.value); });
  for (const button of document.querySelectorAll(".mode")) button.addEventListener("click", () => setMode(button.dataset.mode));
  $("start-practice").addEventListener("click", () => setMode("practice"));
  $("back-to-book").addEventListener("click", () => setMode("book"));
  $("next-question").addEventListener("click", nextQuestion);
  $("retry-button").addEventListener("click", resetQuiz);
  $("reset-matching").addEventListener("click", renderMatching);
  $("zoom-button").addEventListener("click", () => $("zoom-dialog").showModal());
  $("page-image").addEventListener("click", () => $("zoom-dialog").showModal());
  $("close-zoom").addEventListener("click", () => $("zoom-dialog").close());
  $("zoom-dialog").addEventListener("click", (event) => { if (event.target === $("zoom-dialog")) $("zoom-dialog").close(); });
  $("menu-button").addEventListener("click", () => { const open = $("sidebar").classList.toggle("open"); $("mobile-backdrop").hidden = !open; $("menu-button").setAttribute("aria-expanded", String(open)); });
  $("mobile-backdrop").addEventListener("click", closeMobileMenu);
  window.addEventListener("resize", resizePageImages);
  window.addEventListener("hashchange", () => { const index = lessons.findIndex(lesson => `#${lesson.id}` === location.hash); if (index !== -1 && index !== currentIndex) goToLesson(index); });
}

initialize();

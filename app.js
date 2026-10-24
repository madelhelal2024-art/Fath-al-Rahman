"use strict";

// Page-to-audio pairing follows the order in which the assets were uploaded.
// The recordings have not yet been content-transcribed and manually verified.
const lessons = [
  {
    id: "letters", number: "١", title: "الحروف الهجائية", subtitle: "تعرّف على أشكال الحروف وأسمائها.", chapter: "التعرّف على الحروف", page: "٥", image: "assets/pages/01-letters.webp", audio: "assets/audio/01-letters.m4a",
    questions: [
      { text: "اختر حرف الألف", options: ["ب", "أ", "ء", "ت"], answer: "أ", explanation: "أحسنت! هذا حرف الألف." },
      { text: "أين حرف الهمزة؟", options: ["ت", "ب", "ء", "أ"], answer: "ء", explanation: "صحيح! هذه همزة مفردة." },
      { text: "اختر حرف الباء", options: ["ب", "ن", "ت", "ث"], answer: "ب", explanation: "رائع! حرف الباء له نقطة أسفل الحرف." }
    ]
  },
  {
    id: "fatha", number: "٢", title: "الحروف بالفتحة", subtitle: "لاحظ موضع الفتحة أعلى كل حرف، ثم اقرأه.", chapter: "الحركات القصيرة", page: "التدريب", image: "assets/pages/02-fatha.webp", audio: "assets/audio/02-fatha.m4a",
    questions: [
      { text: "اختر الباء بالفتحة", options: ["بُ", "بَ", "بِ", "بْ"], answer: "بَ", explanation: "أحسنت! الفتحة فوق الحرف: بَ." },
      { text: "اختر التاء بالفتحة", options: ["تِ", "تْ", "تَ", "تُ"], answer: "تَ", explanation: "صحيح! نقرأها: تَ." },
      { text: "أين حرف الجيم بالفتحة؟", options: ["جَ", "جِ", "جُ", "جْ"], answer: "جَ", explanation: "رائع! الفتحة أعلى الجيم." }
    ]
  },
  {
    id: "words1", number: "٣", title: "كلمات بالفتحة · تدريب ١", subtitle: "اقرأ الكلمات القصيرة المكوّنة من حروف مفتوحة.", chapter: "قراءة الكلمات", page: "١٣", image: "assets/pages/03-words-1.webp", audio: "assets/audio/03-words-1.m4a",
    questions: [
      { text: "أكمل الكلمة: وَجَـ", options: ["ـبَ", "ـدَ", "ـلَ", "ـتَ"], answer: "ـدَ", explanation: "صحيح! الكلمة: وَجَدَ." },
      { text: "اختر كلمة وَعَدَ", options: ["وَلَدَ", "وَجَدَ", "وَعَدَ", "عَدَدَ"], answer: "وَعَدَ", explanation: "أحسنت! وَعَدَ." },
      { text: "أكمل الكلمة: كَتَـ", options: ["ـبَ", "ـدَ", "ـلَ", "ـمَ"], answer: "ـبَ", explanation: "رائع! الكلمة: كَتَبَ." }
    ]
  },
  {
    id: "words2", number: "٤", title: "كلمات بالفتحة · تدريب ٢", subtitle: "تدرّب على كلمات جديدة ثم اختبر فهمك.", chapter: "قراءة الكلمات", page: "١٤", image: "assets/pages/04-words-2.webp", audio: "assets/audio/04-words-2.m4a",
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
const audio = $("page-audio");

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
  $("prev-button").disabled = index === 0;
  $("next-button").disabled = index === lessons.length - 1;
  questionIndex = 0; score = 0; selected = null;
  renderNavigation();
  renderQuestion();
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
function closeMobileMenu() { $("sidebar").classList.remove("open"); $("mobile-backdrop").hidden = true; $("menu-button").setAttribute("aria-expanded", "false"); }

function initialize() {
  renderNavigation();
  const routeIndex = lessons.findIndex(lesson => `#${lesson.id}` === location.hash);
  goToLesson(routeIndex >= 0 ? routeIndex : 0);
  $("prev-button").addEventListener("click", () => goToLesson(currentIndex - 1));
  $("next-button").addEventListener("click", () => goToLesson(currentIndex + 1));
  $("mark-complete").addEventListener("click", markComplete);
  audio.addEventListener("ended", markComplete);
  $("audio-speed").addEventListener("change", (event) => { audio.playbackRate = Number(event.target.value); });
  for (const button of document.querySelectorAll(".mode")) button.addEventListener("click", () => setMode(button.dataset.mode));
  $("start-practice").addEventListener("click", () => setMode("practice"));
  $("back-to-book").addEventListener("click", () => setMode("book"));
  $("next-question").addEventListener("click", nextQuestion);
  $("retry-button").addEventListener("click", resetQuiz);
  $("zoom-button").addEventListener("click", () => $("zoom-dialog").showModal());
  $("page-image").addEventListener("click", () => $("zoom-dialog").showModal());
  $("close-zoom").addEventListener("click", () => $("zoom-dialog").close());
  $("zoom-dialog").addEventListener("click", (event) => { if (event.target === $("zoom-dialog")) $("zoom-dialog").close(); });
  $("menu-button").addEventListener("click", () => { const open = $("sidebar").classList.toggle("open"); $("mobile-backdrop").hidden = !open; $("menu-button").setAttribute("aria-expanded", String(open)); });
  $("mobile-backdrop").addEventListener("click", closeMobileMenu);
  window.addEventListener("hashchange", () => { const index = lessons.findIndex(lesson => `#${lesson.id}` === location.hash); if (index !== -1 && index !== currentIndex) goToLesson(index); });
}

initialize();

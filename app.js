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
let slideIndex = 0;
let focusedItemIndex = 0;
let questionIndex = 0;
let selected = null;
let score = 0;
const matchingPairs = [{ letter: "أ", name: "ألف" }, { letter: "ء", name: "همزة" }, { letter: "ب", name: "باء" }];
let matchingDone = new Set();
let matchingSelection = null;
const audio = $("page-audio");
let activeClipIndex = null;
let clipAudioContext = null;
let activeClipSource = null;
let clipRequest = 0;
const decodedAudio = new Map();
const decodingAudio = new Map();

const letterNames = ["ا","ء","ب","ت","ث","ج","ح","خ","د","ذ","ر","ز","س","ش","ص","ض","ط","ظ","ع","غ","ف","ق","ك","ل","م","ن","ه","و","ي","ى"];
const fathaLetters = ["أَ","بَ","تَ","ثَ","جَ","حَ","خَ","دَ","ذَ","رَ","زَ","سَ","شَ","صَ","ضَ","طَ","ظَ","عَ","غَ","فَ","قَ","كَ","لَ","مَ","نَ","هَ","وَ","يَ"];
// The last four book cards contain two words each. Unlike the book reader,
// presentation mode gives every printed word its own slide.
const lastPagePhrases = [
  ["أَحَدَ", "عَشَرَ"],
  ["عَبَسَ", "وَبَسَرَ"],
  ["صَبَرَ", "وَغَفَرَ"],
  ["جَعَلَ", "لَكَ"]
];

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

function getSlideItems(pageId) {
  return getPageHotspots(pageId).flatMap((spot) => {
    const phrase = pageId === "words2" ? lastPagePhrases[spot.index - 20] : null;
    if (!phrase) return [{ ...spot, segmentIndex: spot.index }];
    return phrase.map((word, part) => ({
      ...spot,
      word,
      segmentIndex: spot.index,
      audioPart: part,
      audioParts: phrase.length
    }));
  });
}

function resizePageImages() {
  const { width, height } = lessons[currentIndex];
  const frameWidth = document.querySelector(".page-frame").clientWidth;
  $("page-interactive").style.width = `${Math.min(width, Math.max(0, frameWidth - 30))}px`;
  document.querySelector("#zoom-dialog .zoom-page").style.width = `${Math.round(Math.min(750, innerHeight * .94 - 62) * width / height)}px`;
}

function renderHotspots() {
  const lesson = lessons[currentIndex];
  const segments = window.PAGE_SEGMENTS[lesson.id];
  const hotspots = getSlideItems(lesson.id);
  for (const root of [$("page-hotspots"), $("zoom-hotspots")]) {
    root.replaceChildren();
    for (const [itemIndex, spot] of hotspots.entries()) {
      const available = !!segments[spot.segmentIndex];
      const isPhraseWord = Boolean(spot.audioParts);
      const itemWidth = isPhraseWord ? spot.width / spot.audioParts : spot.width;
      const itemX = isPhraseWord ? spot.x + spot.width / 2 - itemWidth * (spot.audioPart + .5) : spot.x;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "audio-hotspot";
      button.dataset.clipIndex = String(spot.segmentIndex);
      button.style.left = `${itemX}%`;
      button.style.top = `${spot.y}%`;
      button.style.width = `${itemWidth}%`;
      button.style.height = `${spot.height}%`;
      const itemLabel = spot.word || spot.label;
      const possessive = lesson.id === "letters" || lesson.id === "fatha" ? "نطقه" : "نطقها";
      button.setAttribute("aria-label", `تكبير ${itemLabel}${available ? ` وسماع ${possessive} المنفرد` : ""}`);
      button.title = `تكبير ${itemLabel}`;
      button.addEventListener("click", () => openFocusedItem(itemIndex));
      root.append(button);
    }
  }
  $("segment-disclaimer").textContent = lesson.id === "letters"
    ? "تظهر صفحة الكتاب دون علامات، ويمكن تكبير كل حرف بالضغط عليه. تسجيل الحرف الأخير غير متوفر بصورة مستقلة؛ ويستخدم صوت الجهاز الآلي عند توفره."
    : "المقاطع الفردية محددة مبدئيًا وفق فواصل الصمت وترتيب الصفحة، وتحتاج تدقيقًا سمعيًا قبل اعتمادها.";
}

function clearClip() {
  clipRequest++;
  if (activeClipSource) {
    activeClipSource.onended = null;
    try { activeClipSource.stop(); } catch { /* The segment may already have ended. */ }
    activeClipSource.disconnect();
    activeClipSource = null;
  }
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  activeClipIndex = null;
  for (const button of document.querySelectorAll(".audio-hotspot.active")) button.classList.remove("active");
  $("slide-play").classList.remove("active");
  $("item-dialog-play").classList.remove("active", "loading");
}

async function getDecodedAudio(lesson) {
  if (decodedAudio.has(lesson.id)) return decodedAudio.get(lesson.id);
  if (!decodingAudio.has(lesson.id)) {
    const promise = fetch(lesson.audio)
      .then((response) => {
        if (!response.ok) throw new Error("تعذر جلب التسجيل");
        return response.arrayBuffer();
      })
      .then((bytes) => clipAudioContext.decodeAudioData(bytes))
      .then((buffer) => {
        // Only keep two decoded pages to avoid holding the entire book in memory.
        if (decodedAudio.size >= 2) decodedAudio.delete(decodedAudio.keys().next().value);
        decodedAudio.set(lesson.id, buffer);
        return buffer;
      })
      .finally(() => decodingAudio.delete(lesson.id));
    decodingAudio.set(lesson.id, promise);
  }
  return decodingAudio.get(lesson.id);
}

function setClipStatus(message) {
  if ($("item-dialog").open) $("item-dialog-status").textContent = message;
}

function pronounceMissingLetter() {
  if (!("speechSynthesis" in window)) {
    setClipStatus("هذا الحرف يحتاج إلى تسجيل صوتي مستقل.");
    return;
  }
  clearClip();
  const utterance = new SpeechSynthesisUtterance("أَلِفٌ مَقْصُورَةٌ");
  utterance.lang = "ar-SA";
  utterance.rate = .85;
  utterance.onerror = () => setClipStatus("تعذر تشغيل الصوت الآلي. نحتاج إلى تسجيل أصلي لهذا الحرف.");
  setClipStatus("يُنطق اسم الحرف بصوت الجهاز مؤقتًا إلى أن يُضاف التسجيل الأصلي.");
  window.speechSynthesis.speak(utterance);
}

async function playClip(index, portion = null) {
  const lesson = lessons[currentIndex];
  const segment = window.PAGE_SEGMENTS[lesson.id]?.[index];
  if (!segment) {
    if (lesson.id === "letters" && index === letterNames.length - 1) pronounceMissingLetter();
    else setClipStatus("هذا العنصر يحتاج إلى تسجيل صوتي مستقل.");
    return;
  }
  audio.pause();
  clearClip();
  const request = clipRequest;
  activeClipIndex = index;
  for (const button of document.querySelectorAll(`[data-clip-index="${index}"]`)) button.classList.add("active");
  if (mode === "slide" && getSlideItems(lessons[currentIndex].id)[slideIndex]?.segmentIndex === index) $("slide-play").classList.add("active");
  $("item-dialog-play").classList.add("loading");
  setClipStatus("جارٍ تجهيز نطق هذا العنصر فقط…");
  try {
    const AudioContextType = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextType) throw new Error("AudioContext unavailable");
    if (!clipAudioContext) clipAudioContext = new AudioContextType();
    // Resume under the user's click gesture, before any network wait.
    const resuming = clipAudioContext.resume();
    const [buffer] = await Promise.all([getDecodedAudio(lesson), resuming]);
    if (request !== clipRequest) return;
    const source = clipAudioContext.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = Number($("audio-speed").value);
    source.connect(clipAudioContext.destination);
    const total = segment[1] - segment[0];
    const start = portion ? segment[0] + total * portion[0] : segment[0];
    const end = portion ? segment[0] + total * portion[1] : segment[1];
    const duration = Math.max(.08, Math.min(end, buffer.duration) - start);
    activeClipSource = source;
    $("item-dialog-play").classList.remove("loading");
    $("item-dialog-play").classList.add("active");
    setClipStatus("يُشغَّل الآن صوت هذا العنصر فقط، دون بقية تسجيل الصفحة.");
    source.onended = () => {
      if (request !== clipRequest) return;
      clearClip();
      setClipStatus("يمكنك الضغط على زر الصوت لإعادة النطق.");
    };
    // Web Audio stops the recording at this duration even on mobile browsers.
    source.start(0, start, duration);
  } catch (error) {
    if (request !== clipRequest) return;
    clearClip();
    setClipStatus("تعذر تشغيل هذا المقطع وحده. جرّب الضغط مرة أخرى.");
    console.error("Individual pronunciation error", error);
  }
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

// A presentation slide represents exactly one element from the current book page.
// Words are cropped directly from the supplied page artwork so their spelling,
// vowel marks, and pedagogical order remain faithful to the printed book.
function renderSlide() {
  const lesson = lessons[currentIndex];
  const elements = getSlideItems(lesson.id);
  const element = elements[slideIndex];
  const slideRoot = $("slide-item");
  slideRoot.replaceChildren();
  slideRoot.style.animation = "none";
  void slideRoot.offsetHeight;
  slideRoot.style.animation = "";

  if (lesson.id === "letters" || lesson.id === "fatha" || element.word) {
    const glyph = document.createElement("span");
    glyph.className = "slide-glyph" + (element.word ? " slide-phrase-glyph" : "");
    glyph.lang = "ar";
    glyph.textContent = element.word || (lesson.id === "letters" ? letterNames[slideIndex] : fathaLetters[slideIndex]);
    slideRoot.append(glyph);
    slideRoot.setAttribute("aria-label", `الشريحة ${arabicDigits(slideIndex + 1)}: ${glyph.textContent}`);
  } else {
    const cropPadding = 5;
    const x = lesson.width * (element.x - element.width / 2) / 100;
    const y = lesson.height * (element.y - element.height / 2) / 100;
    const width = lesson.width * element.width / 100;
    const height = lesson.height * element.height / 100;
    const svgNs = "http://www.w3.org/2000/svg";
    const container = document.createElement("div");
    container.className = "slide-word-art" + (element.width > 30 ? " wide" : "");
    const svg = document.createElementNS(svgNs, "svg");
    svg.setAttribute("viewBox", `${x - cropPadding} ${y - cropPadding} ${width + cropPadding * 2} ${height + cropPadding * 2}`);
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", `الكلمة ${arabicDigits(slideIndex + 1)} من صفحة ${lesson.page}`);
    const image = document.createElementNS(svgNs, "image");
    image.setAttribute("href", lesson.image);
    image.setAttribute("width", lesson.width);
    image.setAttribute("height", lesson.height);
    svg.append(image);
    container.append(svg);
    slideRoot.append(container);
    slideRoot.setAttribute("aria-label", `الشريحة ${arabicDigits(slideIndex + 1)}: الكلمة ${arabicDigits(slideIndex + 1)}`);
  }

  $("slide-item-caption").textContent = "";
  $("slide-lesson-label").textContent = `${lesson.title} · الدرس ${lesson.number}`;
  $("slide-position").textContent = `الشريحة ${arabicDigits(slideIndex + 1)} من ${arabicDigits(elements.length)}`;
  $("slide-track-fill").style.width = `${(slideIndex + 1) / elements.length * 100}%`;
  $("slide-prev").disabled = slideIndex === 0;
  const isLastSlide = slideIndex === elements.length - 1;
  $("slide-next").querySelector("span").textContent = isLastSlide
    ? currentIndex === lessons.length - 1 ? "التدريبات" : "الدرس التالي"
    : "التالي";
  const hasAudio = Boolean(window.PAGE_SEGMENTS?.[lesson.id]?.[element.segmentIndex]);
  const speechFallback = lesson.id === "letters" && element.segmentIndex === letterNames.length - 1 && "speechSynthesis" in window;
  $("slide-play").disabled = !hasAudio && !speechFallback;
  $("slide-play").setAttribute("aria-label", hasAudio ? "استمع إلى العنصر الحالي" : speechFallback ? "استمع إلى اسم الحرف بصوت الجهاز" : "لا يتوفر صوت منفصل لهذا العنصر حاليًا");
  $("slide-sound-label").textContent = !hasAudio ? "الصوت قيد المراجعة" : lesson.id === "letters" || lesson.id === "fatha" ? "استمع إلى الحرف" : "استمع إلى الكلمة";
}

function renderFocusedItem() {
  slideIndex = focusedItemIndex;
  renderSlide();
  const lesson = lessons[currentIndex];
  const elements = getSlideItems(lesson.id);
  const element = elements[focusedItemIndex];
  const visual = $("item-dialog-visual");
  visual.replaceChildren($("slide-item").firstElementChild.cloneNode(true));
  visual.setAttribute("aria-label", $("slide-item").getAttribute("aria-label"));
  const unit = lesson.id === "letters" || lesson.id === "fatha" ? "الحرف" : "الكلمة";
  $("item-dialog-title").textContent = lesson.title;
  $("item-dialog-counter").textContent = `${unit} ${arabicDigits(focusedItemIndex + 1)} من ${arabicDigits(elements.length)}`;
  $("item-dialog-prev").disabled = focusedItemIndex === 0;
  $("item-dialog-next").disabled = focusedItemIndex === elements.length - 1;
  const hasAudio = Boolean(window.PAGE_SEGMENTS?.[lesson.id]?.[element.segmentIndex]);
  const speechFallback = lesson.id === "letters" && element.segmentIndex === letterNames.length - 1 && "speechSynthesis" in window;
  $("item-dialog-play").disabled = !hasAudio && !speechFallback;
  $("item-dialog-play").querySelector("span").textContent = hasAudio ? unit === "الحرف" ? "استمع إلى الحرف وحده" : "استمع إلى الكلمة وحدها" : speechFallback ? "نطق اسم الحرف آليًا" : "الصوت غير متوفر";
  $("item-dialog-status").textContent = "";
}

function playFocusedItem() {
  const element = getSlideItems(lessons[currentIndex].id)[focusedItemIndex];
  const portion = element.audioParts ? [element.audioPart / element.audioParts, (element.audioPart + 1) / element.audioParts] : null;
  playClip(element.segmentIndex, portion);
}

function openFocusedItem(index) {
  audio.pause();
  clearClip();
  if ($("zoom-dialog").open) $("zoom-dialog").close();
  focusedItemIndex = index;
  renderFocusedItem();
  if (!$("item-dialog").open) $("item-dialog").showModal();
  playFocusedItem();
}

function moveFocusedItem(change) {
  const next = focusedItemIndex + change;
  if (next < 0 || next >= getSlideItems(lessons[currentIndex].id).length) return;
  clearClip();
  focusedItemIndex = next;
  renderFocusedItem();
  playFocusedItem();
}

function nextSlide() {
  audio.pause();
  clearClip();
  if (slideIndex + 1 < getSlideItems(lessons[currentIndex].id).length) {
    slideIndex++;
    renderSlide();
  } else {
    markComplete();
    if (currentIndex + 1 < lessons.length) goToLesson(currentIndex + 1);
    else setMode("practice");
  }
}

function previousSlide() {
  if (slideIndex === 0) return;
  audio.pause();
  clearClip();
  slideIndex--;
  renderSlide();
}

function goToLesson(index) {
  if (index < 0 || index >= lessons.length) return;
  audio.pause();
  clearClip();
  currentIndex = index;
  slideIndex = 0;
  focusedItemIndex = 0;
  if ($("item-dialog").open) $("item-dialog").close();
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
  renderSlide();
  $("prev-button").disabled = index === 0;
  $("next-button").disabled = index === lessons.length - 1;
  questionIndex = 0; score = 0; selected = null;
  renderNavigation();
  renderQuestion();
  renderMatching();
  renderCompleteButton();
  setMode(mode);
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
  if (mode !== nextMode) {
    audio.pause();
    clearClip();
    if ($("item-dialog").open) $("item-dialog").close();
  }
  mode = nextMode;
  document.body.classList.toggle("slide-mode", mode === "slide");
  document.body.classList.toggle("book-mode", mode === "book");
  for (const next of ["slide", "book", "practice"]) {
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
    $("next-question").textContent = currentIndex < lessons.length - 1 ? "الدرس التالي ←" : "العودة إلى صفحة الكتاب";
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
    if (currentIndex < lessons.length - 1) { setMode("book"); goToLesson(currentIndex + 1); }
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
  $("slide-prev").addEventListener("click", previousSlide);
  $("slide-next").addEventListener("click", nextSlide);
  $("slide-play").addEventListener("click", () => {
    const element = getSlideItems(lessons[currentIndex].id)[slideIndex];
    const portion = element.audioParts ? [element.audioPart / element.audioParts, (element.audioPart + 1) / element.audioParts] : null;
    playClip(element.segmentIndex, portion);
  });
  $("item-dialog-prev").addEventListener("click", () => moveFocusedItem(-1));
  $("item-dialog-next").addEventListener("click", () => moveFocusedItem(1));
  $("item-dialog-play").addEventListener("click", playFocusedItem);
  $("item-dialog-close").addEventListener("click", () => $("item-dialog").close());
  $("item-dialog").addEventListener("close", clearClip);
  $("item-dialog").addEventListener("click", (event) => { if (event.target === $("item-dialog")) $("item-dialog").close(); });
  $("slide-fullscreen").addEventListener("click", () => {
    if (document.fullscreenElement === $("slide-deck")) document.exitFullscreen?.();
    else $("slide-deck").requestFullscreen?.();
  });
  $("show-book-from-slide").addEventListener("click", () => setMode("book"));
  $("practice-from-slide").addEventListener("click", () => setMode("practice"));
  $("prev-button").addEventListener("click", () => goToLesson(currentIndex - 1));
  $("next-button").addEventListener("click", () => goToLesson(currentIndex + 1));
  $("mark-complete").addEventListener("click", markComplete);
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
  document.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || document.activeElement?.matches("input, textarea, select")) return;
    if ($("item-dialog").open) {
      if (event.key === "ArrowLeft") { event.preventDefault(); moveFocusedItem(1); }
      else if (event.key === "ArrowRight") { event.preventDefault(); moveFocusedItem(-1); }
      return;
    }
    if (mode !== "slide" || document.querySelector("dialog[open]")) return;
    if (event.key === "ArrowLeft") { event.preventDefault(); nextSlide(); }
    else if (event.key === "ArrowRight") { event.preventDefault(); previousSlide(); }
  });
  window.addEventListener("hashchange", () => { const index = lessons.findIndex(lesson => `#${lesson.id}` === location.hash); if (index !== -1 && index !== currentIndex) goToLesson(index); });
}

initialize();

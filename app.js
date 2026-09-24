// card-config.js
var configKey = "zvuk-card-settings-v1";
var defaultConfig = { version: 1, order: [0, 1, 2], cards: ["#625BFF", "#BF4245", "#247DA4"].map((color) => ({ color, idle: { speed: 1.2, intensity: 0.4, contrast: 1, colorSpread: 1.14, motionScale: 2.15, maxPixelRatio: 1.5 }, playing: { speed: 2.8, intensity: 0.4, contrast: 1, colorSpread: 1.14, motionScale: 2.15, maxPixelRatio: 1.5 }, reaction: "both", strength: 0.8 })) };
var identities = [
  { title: ["\u042D\u043C\u0431\u0438\u0435\u043D\u0442-\u0442\u0435\u0445\u043D\u043E", "\u0440\u043E\u043C\u0430\u043D\u0442\u0438\u043A\u0430"], name: ["\u0412\u043B\u0430\u0434", "\u041C\u0438\u043A\u0435\u0435\u0432"], role: ["\u041C\u0443\u0437\u044B\u043A\u0430\u043B\u044C\u043D\u044B\u0439", "\u0440\u0435\u0434\u0430\u043A\u0442\u043E\u0440 \u0417\u0432\u0443\u043A"] },
  { title: ["\u0418\u043D\u0434\u0430\u0441\u0442\u0440\u0438\u0430\u043B", "\u0442\u0435\u0445\u043D\u043E-\u0442\u0435\u0440\u0430\u043F\u0438\u044F"], name: ["\u0422\u043E\u0441\u044F", "\u0427\u0430\u0439\u043A\u0438\u043D\u0430"], role: ["\u041C\u0443\u0437\u044B\u043A\u0430\u043B\u044C\u043D\u044B\u0439", "\u043A\u0440\u0438\u0442\u0438\u043A"] },
  { title: ["\u0421\u0438\u0442\u0438-\u043F\u043E\u043F", "\u043F\u0440\u044F\u043C\u043E \u0438\u0437 \u0422\u043E\u043A\u0438\u043E"], name: ["\u041D\u0430\u043E\u043A\u0438", "\u0422\u0430\u0447\u0438\u043A\u0430\u0432\u0430"], role: ["\u041C\u0443\u0437\u044B\u043A\u0430\u043B\u044C\u043D\u044B\u0439", "\u0436\u0443\u0440\u043D\u0430\u043B\u0438\u0441\u0442"] }
];
defaultConfig.cards.forEach((card, i) => Object.assign(card, identities[i], { avatar: `assets/card-0${i + 1}-avatar.png`, collection: i + 1 }));
function createCard() {
  return { ...structuredClone(defaultConfig.cards[0]), title: ["\u041D\u043E\u0432\u0430\u044F \u043F\u043E\u0434\u0431\u043E\u0440\u043A\u0430"], name: ["\u0410\u0432\u0442\u043E\u0440"], role: ["\u041A\u0443\u0440\u0430\u0442\u043E\u0440"], collection: 1 };
}
function validateConfig(input) {
  const result = structuredClone(defaultConfig);
  if (!input || !Array.isArray(input.cards) || input.cards.length < 1 || input.cards.length > 30) throw Error("\u0414\u043E\u043F\u0443\u0441\u0442\u0438\u043C\u043E \u043E\u0442 1 \u0434\u043E 30 \u043A\u0430\u0440\u0442\u043E\u0447\u0435\u043A");
  if (!Array.isArray(input.order) || input.order.length !== input.cards.length || new Set(input.order).size !== input.cards.length || input.order.some((i) => !Number.isInteger(i) || i < 0 || i >= input.cards.length)) throw Error("\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u043F\u043E\u0440\u044F\u0434\u043E\u043A \u043A\u0430\u0440\u0442\u043E\u0447\u0435\u043A");
  result.order = [...input.order];
  const ranges = { speed: [0, 4], intensity: [0, 2], contrast: [0, 2], colorSpread: [0, 1.5], motionScale: [0, 3], maxPixelRatio: [0.5, 2] };
  result.cards = [];
  input.cards.forEach((card, i) => {
    if (!/^#[0-9a-f]{6}$/i.test(card.color)) throw Error("\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0446\u0432\u0435\u0442");
    const out = structuredClone(defaultConfig.cards[i] || createCard());
    result.cards.push(out);
    out.color = card.color;
    for (const key of ["title", "name", "role"]) {
      if (card[key] !== void 0) {
        if (!Array.isArray(card[key]) || !card[key].length || card[key].length > 3 || card[key].some((v) => typeof v !== "string" || v.length > 120)) throw Error("\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0442\u0435\u043A\u0441\u0442 \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0438");
        out[key] = card[key];
      }
    }
    if (card.avatar !== void 0) {
      if (typeof card.avatar !== "string" || !/^assets\/[a-z0-9_./% -]+\.(png|jpe?g|webp)$/i.test(card.avatar) || card.avatar.includes("..")) throw Error("\u0423\u043A\u0430\u0436\u0438\u0442\u0435 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \u0438\u0437 \u043F\u0430\u043F\u043A\u0438 assets");
      out.avatar = card.avatar;
    }
    if (card.collection !== void 0) {
      if (!Number.isInteger(card.collection) || card.collection < 1) throw Error("\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u043F\u043E\u0434\u0431\u043E\u0440\u043A\u0430");
      out.collection = card.collection;
    }
    for (const state of ["idle", "playing"]) for (const [key, [min, max]] of Object.entries(ranges)) {
      const value = card[state]?.[key];
      if (!Number.isFinite(value) || value < min || value > max) throw Error(`\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430 ${key}`);
      out[state][key] = value;
    }
    if (!["off", "glow", "motion", "both"].includes(card.reaction) || !Number.isFinite(card.strength) || card.strength < 0 || card.strength > 1) throw Error("\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u0440\u0435\u0430\u043A\u0446\u0438\u044F \u043D\u0430 \u043C\u0443\u0437\u044B\u043A\u0443");
    out.reaction = card.reaction;
    out.strength = card.strength;
  });
  return result;
}
async function loadConfig() {
  try {
    const saved = localStorage.getItem(configKey);
    if (saved) return validateConfig(JSON.parse(saved));
  } catch {
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3e3);
  try {
    const response = await fetch("card-settings.json", { signal: controller.signal });
    if (response.ok) return validateConfig(await response.json());
  } catch {
  } finally {
    clearTimeout(timeout);
  }
  return structuredClone(defaultConfig);
}

// player-source.js
try {
  if (navigator.audioSession) navigator.audioSession.type = "playback";
} catch {
}
var cardConfig = await loadConfig();
document.documentElement.dataset.cardConfig = JSON.stringify(cardConfig);
for (const name of ["gesturestart", "gesturechange", "gestureend"]) {
  document.addEventListener(name, (event) => event.preventDefault(), { passive: false });
}
for (const name of ["touchstart", "touchmove"]) {
  document.addEventListener(name, (event) => {
    if (event.touches.length > 1) event.preventDefault();
  }, { passive: false });
}
var cards = cardConfig.cards;
var count = () => cards.length;
var $ = (selector) => document.querySelector(selector);
var carousel = $(".carousel");
var audio = $("#audio");
var seek = $("#seek");
var tg = window.Telegram?.WebApp;
var inTelegram = tg && tg.platform !== "unknown";
function haptic(kind = "medium") {
  const webApp = window.Telegram?.WebApp;
  if (!webApp?.isVersionAtLeast?.("6.1")) return;
  try {
    if (kind === "selection") webApp.HapticFeedback?.selectionChanged();
    else webApp.HapticFeedback?.impactOccurred(kind);
  } catch {
  }
}
var active = cardConfig.order[0];
var tracks = [];
var queues = [];
var positions = cards.map(() => 0);
var generation = 0;
var noticeTimer;
var scrollTimer;
var initializing = true;
var favorites = /* @__PURE__ */ new Set();
try {
  favorites = new Set(JSON.parse(localStorage.getItem("zvuk-favorites") || "[]"));
} catch {
}
var escapeHtml = (value) => String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
var lines = (words) => words.map(escapeHtml).join("<br>");
function buildCards() {
  carousel.innerHTML = Array.from({ length: 3 }, (_, set) => cardConfig.order.map((i, slot) => {
    const card = cards[i];
    return `<article class="card" style="--card-color:${card.color}" data-index="${i}" aria-label="${escapeHtml(card.title.join(" "))}" aria-roledescription="\u0441\u043B\u0430\u0439\u0434" ${set !== 1 ? 'aria-hidden="true"' : ""}><img class="card-background" src="assets/card-0${Math.min(i + 1, 3)}-background.png" alt="" draggable="false"><div class="card-top"><img class="logo" src="assets/logo.svg" alt="\u0417\u0432\u0443\u043A" draggable="false"><span>[${String(slot + 1).padStart(2, "0")}/${String(count()).padStart(2, "0")}]</span></div><img class="avatar" src="${escapeHtml(card.avatar)}" alt="${escapeHtml(card.name.join(" "))}" draggable="false"><div class="card-copy"><h2>${lines(card.title)}</h2><div class="byline"><p>${lines(card.name)}</p><p>${lines(card.role)}</p></div></div></article>`;
  }).join("")).join("");
}
buildCards();
var slides = [...carousel.children];
var reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
function center(index, behavior = "instant") {
  const el = slides[index];
  carousel.scrollTo({ left: el.offsetLeft - (carousel.clientWidth - el.offsetWidth) / 2, behavior });
}
function nearest() {
  const middle = carousel.getBoundingClientRect().left + carousel.clientWidth / 2;
  return slides.reduce((best, el, i) => Math.abs(el.getBoundingClientRect().left + el.offsetWidth / 2 - middle) < Math.abs(slides[best].getBoundingClientRect().left + slides[best].offsetWidth / 2 - middle) ? i : best, 0);
}
function tint(hex, fraction) {
  return "#" + hex.slice(1).match(/../g).map((v) => Math.round(255 + (parseInt(v, 16) - 255) * fraction).toString(16).padStart(2, "0")).join("");
}
function theme() {
  const color = cardConfig.cards[active].color, surface = tint(color, 0.08);
  document.documentElement.style.setProperty("--accent", color);
  document.documentElement.style.setProperty("--toast-background", color + "cc");
  document.documentElement.style.setProperty("--tint", color + "1a");
  document.documentElement.style.setProperty("--surface", surface);
  $("meta[name=theme-color]").content = surface;
  window.dispatchEvent(new Event("miniapp:theme"));
  if (inTelegram) {
    tg.setBackgroundColor?.(surface);
    if (tg.isVersionAtLeast?.("6.9")) tg.setHeaderColor?.(surface);
    if (tg.isVersionAtLeast?.("7.10")) tg.setBottomBarColor?.(surface);
  }
}
function notify(message) {
  clearTimeout(noticeTimer);
  $("#status").textContent = message;
  $("#status").hidden = false;
  noticeTimer = setTimeout(() => $("#status").hidden = true, 4500);
}
function trackSide(index, count2) {
  return index < Math.ceil(count2 / 2) ? "A" : "B";
}
function currentTrack() {
  return queues[active]?.[positions[active]];
}
function savedState() {
  const saved = favorites.has(currentTrack()?.src);
  $("#save").setAttribute("aria-pressed", String(saved));
  $("#save").setAttribute("aria-label", saved ? "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0442\u0440\u0435\u043A \u0438\u0437 \u0438\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0433\u043E" : "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0442\u0440\u0435\u043A \u0432 \u0438\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0435");
}
function time(seconds) {
  return Number.isFinite(seconds) ? `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}` : "0:00";
}
function progress() {
  const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
  seek.disabled = !duration;
  seek.value = duration ? audio.currentTime / duration * 100 : 0;
  seek.style.setProperty("--progress", `${seek.value}%`);
  seek.setAttribute("aria-valuetext", `${time(audio.currentTime)} \u0438\u0437 ${time(duration)}`);
  $("#elapsed").textContent = time(audio.currentTime);
  $("#duration").textContent = time(duration);
}
var startedTracks = /* @__PURE__ */ new Set();
var playbackKey = () => `${active}:${currentTrack()?.src || ""}`;
function playbackState() {
  const playing = !audio.paused && !audio.ended && !audio.error;
  $("#playlist").classList.toggle("has-started-track", !!currentTrack() && startedTracks.has(playbackKey()));
  $("#play").setAttribute("aria-label", playing ? "\u041F\u0430\u0443\u0437\u0430" : "\u0412\u043E\u0441\u043F\u0440\u043E\u0438\u0437\u0432\u0435\u0441\u0442\u0438");
  $("#play .icon").className = `icon ${playing ? "pause" : "play"}`;
  if ("mediaSession" in navigator) navigator.mediaSession.playbackState = playing ? "playing" : "paused";
}
async function play() {
  const request = generation;
  try {
    await audio.play();
  } catch (error) {
    if (request === generation && error.name !== "AbortError") notify("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0432\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u0442\u0440\u0435\u043A. \u041D\u0430\u0436\u043C\u0438\u0442\u0435 play \u0435\u0449\u0451 \u0440\u0430\u0437.");
  }
}
function loadTrack(autoplay = false) {
  const track = currentTrack();
  if (!track) {
    generation++;
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    $("#song-title").textContent = "\u0412 \u043F\u043E\u0434\u0431\u043E\u0440\u043A\u0435 \u043F\u043E\u043A\u0430 \u043D\u0435\u0442 \u0442\u0440\u0435\u043A\u043E\u0432";
    $("#artist").textContent = "";
    savedState();
    progress();
    playbackState();
    if ($("#playlist").open) renderPlaylist();
    return;
  }
  generation++;
  audio.pause();
  audio.src = track.src;
  audio.load();
  const playerTitle = `[${trackSide(positions[active], queues[active].length)}] ${track.title}`;
  $("#song-title").textContent = playerTitle;
  $("#song-title").title = playerTitle;
  $("#artist").textContent = track.artist;
  $("#artist").title = track.artist;
  savedState();
  progress();
  playbackState();
  if ("mediaSession" in navigator && "MediaMetadata" in window) navigator.mediaSession.metadata = new MediaMetadata({ title: track.title, artist: track.artist, album: cards[active].title.join(" "), artwork: [{ src: new URL(cards[active].avatar, location.href).href, type: "image/png" }] });
  if ($("#playlist").open) renderPlaylist();
  if (autoplay) void play();
}
function selectCard(index, feedback = false) {
  if (index === active) return;
  if (feedback) haptic("light");
  const resume = !audio.paused;
  active = index;
  theme();
  loadTrack(resume);
  if (new URLSearchParams(location.search).has("adminPreview")) parent.postMessage({ type: "admin:active", index: active }, location.origin);
}
carousel.addEventListener("scroll", () => {
  if (initializing) return;
  selectCard(cardConfig.order[nearest() % count()], true);
  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(() => {
    const physical = nearest();
    if (physical < count() || physical >= count() * 2) center(count() + physical % count());
  }, 160);
}, { passive: true });
carousel.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
    e.preventDefault();
    center(Math.max(0, Math.min(slides.length - 1, nearest() + (e.key === "ArrowRight" ? 1 : -1))), reducedMotion ? "instant" : "smooth");
  }
});
var drag;
carousel.addEventListener("pointerdown", (e) => {
  if (e.pointerType !== "mouse") return;
  drag = { x: e.clientX, left: carousel.scrollLeft };
  carousel.setPointerCapture(e.pointerId);
  carousel.style.scrollSnapType = "none";
});
carousel.addEventListener("pointermove", (e) => {
  if (drag) carousel.scrollLeft = drag.left + drag.x - e.clientX;
});
function endDrag() {
  if (!drag) return;
  drag = null;
  carousel.style.scrollSnapType = "";
  center(nearest(), reducedMotion ? "instant" : "smooth");
}
carousel.addEventListener("pointerup", endDrag);
carousel.addEventListener("pointercancel", endDrag);
var cardTap;
carousel.addEventListener("pointerdown", (event) => {
  if (!event.isPrimary || event.button !== 0) return;
  cardTap = { id: event.pointerId, x: event.clientX, y: event.clientY, left: carousel.scrollLeft, moved: false };
});
carousel.addEventListener("pointermove", (event) => {
  if (cardTap?.id === event.pointerId && Math.hypot(event.clientX - cardTap.x, event.clientY - cardTap.y) > 8) cardTap.moved = true;
});
carousel.addEventListener("pointercancel", () => {
  cardTap = null;
});
carousel.addEventListener("pointerup", (event) => {
  const tap = cardTap;
  cardTap = null;
  if (!tap || tap.id !== event.pointerId || tap.moved || Math.hypot(event.clientX - tap.x, event.clientY - tap.y) > 8 || Math.abs(carousel.scrollLeft - tap.left) > 8) return;
  const index = nearest(), card = slides[index];
  const bounds = card.getBoundingClientRect(), avatar = card.querySelector(".avatar").getBoundingClientRect();
  if (event.clientY < avatar.top || event.clientY > avatar.bottom || event.clientX < bounds.left || event.clientX > bounds.right) return;
  const direction = event.clientX < avatar.left ? -1 : event.clientX > avatar.right ? 1 : 0;
  if (!direction) return;
  center(count() + index % count());
  center(count() + index % count() + direction, reducedMotion ? "instant" : "smooth");
});
function step(delta, autoplay = !audio.paused) {
  const count2 = queues[active]?.length || 0;
  if (!count2) return;
  positions[active] = (positions[active] + delta + count2) % count2;
  loadTrack(autoplay);
}
$("#play").addEventListener("click", () => {
  if (!currentTrack()) return;
  haptic();
  audio.paused ? void play() : audio.pause();
});
$("#prev").addEventListener("click", () => {
  if (!currentTrack()) return;
  haptic();
  step(-1);
});
$("#next").addEventListener("click", () => {
  if (!currentTrack()) return;
  haptic();
  step(1);
});
audio.addEventListener("ended", () => step(1, true));
audio.addEventListener("playing", () => {
  if (currentTrack()) {
    startedTracks.add(playbackKey());
    playbackState();
  }
});
for (const event of ["play", "pause", "ended"]) audio.addEventListener(event, playbackState);
for (const event of ["loadedmetadata", "durationchange", "timeupdate", "emptied"]) audio.addEventListener(event, progress);
audio.addEventListener("error", () => {
  playbackState();
  notify("\u0422\u0440\u0435\u043A \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439.");
});
var seekGesture = null;
seek.addEventListener("pointerdown", (event) => {
  if (seek.disabled || !event.isPrimary || event.button !== 0 || seekGesture) return;
  seekGesture = { id: event.pointerId, bucket: Math.floor(audio.currentTime / 15) };
  seek.classList.add("is-scrubbing");
  haptic("light");
});
function finishSeek(event) {
  if (!seekGesture || event && event.pointerId !== seekGesture.id) return;
  seekGesture = null;
  seek.classList.remove("is-scrubbing");
  if (event?.type === "pointerup") haptic("light");
}
window.addEventListener("pointerup", finishSeek);
window.addEventListener("pointercancel", finishSeek);
window.addEventListener("blur", () => finishSeek());
audio.addEventListener("emptied", () => finishSeek());
document.addEventListener("visibilitychange", () => {
  if (document.hidden) finishSeek();
});
seek.addEventListener("input", () => {
  if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
  const nextTime = audio.duration * Number(seek.value) / 100;
  const oldBucket = seekGesture?.bucket ?? Math.floor(audio.currentTime / 15);
  const newBucket = Math.floor(nextTime / 15);
  if (newBucket !== oldBucket) haptic("selection");
  if (seekGesture) seekGesture.bucket = newBucket;
  audio.currentTime = nextTime;
  progress();
});
var heartbeatTimers = [];
function stopHeartbeat() {
  heartbeatTimers.forEach(clearTimeout);
  heartbeatTimers = [];
}
function heartbeat() {
  stopHeartbeat();
  haptic("medium");
  for (const [delay, kind] of [[120, "heavy"], [460, "medium"], [580, "heavy"]]) {
    heartbeatTimers.push(setTimeout(() => {
      if (!document.hidden) haptic(kind);
    }, delay));
  }
}
var likeToast = $("#like-toast");
var toastTimer;
var toastExitTimer;
var toastGesture;
var suppressToastClick = false;
function dismissLikeToast() {
  clearTimeout(toastTimer);
  clearTimeout(toastExitTimer);
  likeToast.classList.remove("is-visible");
  likeToast.inert = true;
  if (likeToast.contains(document.activeElement)) $("#save").focus({ preventScroll: true });
  toastExitTimer = setTimeout(() => {
    likeToast.hidden = true;
  }, reducedMotion ? 0 : 260);
}
function showLikeToast() {
  clearTimeout(toastTimer);
  clearTimeout(toastExitTimer);
  suppressToastClick = false;
  likeToast.hidden = false;
  likeToast.inert = false;
  void likeToast.offsetHeight;
  likeToast.classList.add("is-visible");
  toastTimer = setTimeout(dismissLikeToast, 4e3);
}
likeToast.addEventListener("pointerdown", (event) => {
  if (!event.isPrimary || event.button !== 0) return;
  toastGesture = { id: event.pointerId, x: event.clientX, y: event.clientY };
  suppressToastClick = false;
});
window.addEventListener("pointermove", (event) => {
  if (toastGesture?.id !== event.pointerId) return;
  const dy = event.clientY - toastGesture.y, dx = event.clientX - toastGesture.x;
  if (dy < -24 && Math.abs(dy) > Math.abs(dx)) {
    toastGesture = null;
    suppressToastClick = true;
    dismissLikeToast();
  }
}, { passive: true });
for (const name of ["pointerup", "pointercancel"]) window.addEventListener(name, () => {
  toastGesture = null;
});
$("#like-toast-open").addEventListener("click", () => {
  if (suppressToastClick) return;
  stopHeartbeat();
  haptic();
  dismissLikeToast();
});
likeToast.addEventListener("keydown", (event) => {
  if (event.key === "Escape") dismissLikeToast();
});
window.addEventListener("pagehide", stopHeartbeat);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopHeartbeat();
    dismissLikeToast();
  }
});
$("#save").addEventListener("click", () => {
  const track = currentTrack();
  if (!track) return;
  stopHeartbeat();
  if (favorites.has(track.src)) {
    favorites.delete(track.src);
    haptic();
    dismissLikeToast();
  } else {
    favorites.add(track.src);
    heartbeat();
    showLikeToast();
  }
  try {
    localStorage.setItem("zvuk-favorites", JSON.stringify([...favorites]));
  } catch {
  }
  savedState();
});
var sheet = $("#playlist");
var sheetCloseTimer;
var sheetDrag;
var sheetSuppressClick = false;
function closePlaylist() {
  if (!sheet.open) return;
  sheet.classList.remove("is-open");
  sheet.style.removeProperty("--sheet-drag");
  clearTimeout(sheetCloseTimer);
  sheetCloseTimer = setTimeout(() => sheet.close(), reducedMotion ? 0 : 260);
}
function renderPlaylist() {
  const container = $("#tracks");
  container.replaceChildren();
  $("#playlist-title").textContent = cards[active].title.join(" ");
  const queue = queues[active] || [], split = Math.ceil(queue.length / 2);
  let section;
  queue.forEach((track, i) => {
    const side = trackSide(i, queue.length);
    if (i === 0 || i === split) {
      section = document.createElement("section");
      section.className = "track-side";
      section.dataset.side = side;
      section.setAttribute("aria-label", `Side ${side}`);
      const heading = document.createElement("div");
      heading.className = "side-heading";
      heading.innerHTML = side === "A" ? "<span>Tracklist</span><span>Date/Time</span><span>[Side A]</span>" : '<span>[Side B]</span><span class="noise-label">Noise reduction <i aria-hidden="true"></i></span>';
      section.append(heading);
      container.append(section);
    }
    const button = document.createElement("button");
    button.className = "track";
    button.setAttribute("aria-current", String(i === positions[active]));
    const copy = document.createElement("span");
    copy.className = "track-copy";
    const title = document.createElement("span");
    title.className = "track-title";
    title.textContent = track.title;
    const artist = document.createElement("span");
    artist.className = "track-artist";
    artist.textContent = track.artist;
    const duration = document.createElement("span");
    duration.className = "track-duration";
    duration.textContent = Number.isFinite(track.duration) ? time(track.duration) : "\u2014";
    const number = document.createElement("span");
    number.className = "track-number";
    number.textContent = `[${String((side === "A" ? i : i - split) + 1).padStart(2, "0")}]`;
    duration.textContent = Number.isFinite(track.duration) ? `(${time(track.duration).padStart(5, "0")})` : "(\u2014)";
    button.dataset.side = side;
    copy.append(title, artist);
    button.append(number, copy, duration);
    button.onclick = () => {
      if (sheetSuppressClick) return;
      haptic();
      positions[active] = i;
      loadTrack(true);
      closePlaylist();
    };
    section.append(button);
  });
}
$("#tracklist").onclick = () => {
  haptic();
  sheetSuppressClick = false;
  clearTimeout(sheetCloseTimer);
  renderPlaylist();
  sheet.showModal();
  sheet.style.removeProperty("--sheet-drag");
  void sheet.offsetHeight;
  sheet.classList.add("is-open");
};
$(".sheet-handle").onclick = () => {
  if (!sheetSuppressClick) {
    haptic();
    closePlaylist();
  }
};
sheet.addEventListener("cancel", (event) => {
  event.preventDefault();
  closePlaylist();
});
sheet.addEventListener("click", (event) => {
  if (event.target !== sheet) return;
  const r = sheet.getBoundingClientRect();
  if (event.clientY < r.top || event.clientX < r.left || event.clientX > r.right) closePlaylist();
});
sheet.addEventListener("touchstart", (event) => {
  sheetSuppressClick = false;
  if (event.touches.length !== 1) return;
  const handle = event.target.closest(".sheet-handle,.dialog-heading");
  if (!handle && $("#tracks").scrollTop > 0) return;
  const touch = event.touches[0];
  sheetDrag = { x: touch.clientX, y: touch.clientY, dy: 0 };
}, { passive: true });
sheet.addEventListener("touchmove", (event) => {
  if (!sheetDrag || event.touches.length !== 1) return;
  const touch = event.touches[0], dy = touch.clientY - sheetDrag.y, dx = touch.clientX - sheetDrag.x;
  if (dy <= 0 || Math.abs(dx) > dy) {
    if (!sheetDrag.dy) sheetDrag = null;
    return;
  }
  event.preventDefault();
  sheetDrag.dy = dy;
  sheetSuppressClick = dy > 8;
  sheet.classList.add("is-dragging");
  sheet.style.setProperty("--sheet-drag", `${dy}px`);
}, { passive: false });
function endSheetDrag(event) {
  if (!sheetDrag) return;
  const dismiss = event.type !== "touchcancel" && sheetDrag.dy > 70;
  sheetDrag = null;
  sheet.classList.remove("is-dragging");
  if (dismiss) {
    haptic("light");
    closePlaylist();
  } else sheet.style.removeProperty("--sheet-drag");
}
sheet.addEventListener("touchend", endSheetDrag);
sheet.addEventListener("touchcancel", endSheetDrag);
sheet.addEventListener("pointerdown", (event) => {
  if (event.pointerType !== "mouse" || !event.target.closest(".sheet-handle")) return;
  sheetSuppressClick = false;
  sheetDrag = { y: event.clientY, dy: 0 };
  event.target.setPointerCapture(event.pointerId);
});
sheet.addEventListener("pointermove", (event) => {
  if (event.pointerType !== "mouse" || !sheetDrag) return;
  sheetDrag.dy = Math.max(0, event.clientY - sheetDrag.y);
  sheetSuppressClick = sheetDrag.dy > 8;
  sheet.classList.add("is-dragging");
  sheet.style.setProperty("--sheet-drag", `${sheetDrag.dy}px`);
});
sheet.addEventListener("pointerup", (event) => {
  if (event.pointerType === "mouse") endSheetDrag(event);
});
sheet.addEventListener("pointercancel", () => endSheetDrag({ type: "touchcancel" }));
function updateViewport() {
  if (inTelegram) {
    if (tg.viewportStableHeight) document.documentElement.style.setProperty("--app-height", `${tg.viewportStableHeight}px`);
    document.documentElement.style.setProperty("--safe-top", `${(tg.safeAreaInset?.top || 0) + (tg.contentSafeAreaInset?.top || 0)}px`);
    document.documentElement.style.setProperty("--safe-bottom", `${Math.max(12, (tg.safeAreaInset?.bottom || 0) + (tg.contentSafeAreaInset?.bottom || 0))}px`);
  }
  center(count() + cardConfig.order.indexOf(active));
}
if (inTelegram) {
  tg.ready();
  tg.expand();
  for (const event of ["viewportChanged", "safeAreaChanged", "contentSafeAreaChanged"]) tg.onEvent(event, updateViewport);
}
window.addEventListener("resize", updateViewport);
if ("mediaSession" in navigator) {
  for (const [action, handler] of Object.entries({ play: () => play(), pause: () => audio.pause(), previoustrack: () => step(-1), nexttrack: () => step(1), seekto: (details) => {
    if (Number.isFinite(details.seekTime)) audio.currentTime = details.seekTime;
  } })) {
    try {
      navigator.mediaSession.setActionHandler(action, handler);
    } catch {
    }
  }
}
updateViewport();
theme();
requestAnimationFrame(() => {
  center(count());
  initializing = false;
});
try {
  const response = await fetch("tracks.json?v=20260922-sheet");
  if (!response.ok) throw new Error("Catalog unavailable");
  tracks = await response.json();
  if (!tracks.length) throw new Error("Empty catalog");
  queues = cards.map((card) => tracks.filter((track) => track.card === card.collection));
  loadTrack();
} catch {
  $("#song-title").textContent = "\u041D\u0435\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u0445 \u0442\u0440\u0435\u043A\u043E\u0432";
  $("#artist").textContent = "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C Songs";
  notify("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u043C\u0443\u0437\u044B\u043A\u0443. \u041E\u0431\u043D\u043E\u0432\u0438\u0442\u0435 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0443.");
}
function applyCardConfig(next) {
  const validated = validateConfig(next);
  const changed = JSON.stringify(validated.order) !== JSON.stringify(cardConfig.order) || JSON.stringify(validated.cards.map((c) => [c.title, c.name, c.role, c.avatar, c.collection])) !== JSON.stringify(cards.map((c) => [c.title, c.name, c.role, c.avatar, c.collection]));
  const oldCollection = cards[active]?.collection;
  cardConfig = validated;
  cards = cardConfig.cards;
  if (active >= count()) active = cardConfig.order[0];
  positions = cards.map((_, i) => positions[i] || 0);
  queues = cards.map((card) => tracks.filter((track) => track.card === card.collection));
  positions = positions.map((value, i) => Math.min(value, Math.max(0, queues[i].length - 1)));
  document.documentElement.dataset.cardConfig = JSON.stringify(cardConfig);
  if (changed) {
    initializing = true;
    clearTimeout(scrollTimer);
    buildCards();
    slides = [...carousel.children];
    center(count() + cardConfig.order.indexOf(active));
    if (oldCollection !== cards[active].collection) loadTrack(false);
    requestAnimationFrame(() => {
      initializing = false;
    });
  }
  theme();
  window.dispatchEvent(new Event("miniapp:config"));
}
if (new URLSearchParams(location.search).has("adminPreview")) {
  window.addEventListener("message", (event) => {
    if (event.origin !== location.origin || event.source !== parent) return;
    try {
      if (event.data.type === "admin:config") applyCardConfig(event.data.config);
      if (event.data.type === "admin:card" && Number.isInteger(event.data.index) && event.data.index >= 0 && event.data.index < count()) {
        audio.pause();
        selectCard(event.data.index);
        center(count() + cardConfig.order.indexOf(active));
      }
    } catch (error) {
      parent.postMessage({ type: "admin:error", message: error.message }, location.origin);
    }
  });
  parent.postMessage({ type: "admin:ready" }, location.origin);
}
window.dispatchEvent(new Event("miniapp:config"));

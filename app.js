// Keep the Mini App at its designed scale, including Safari gesture events.
for (const name of ['gesturestart', 'gesturechange', 'gestureend']) {
  document.addEventListener(name, event => event.preventDefault(), {passive:false});
}
for (const name of ['touchstart', 'touchmove']) {
  document.addEventListener(name, event => {
    if (event.touches.length > 1) event.preventDefault();
  }, {passive:false});
}
// Card theme is configured here; all player and Telegram colors derive from color.
const cards = [
  { color: '#5C5BE4', title: ['Эмбиент-техно', 'романтика'], name: ['Влад', 'Микеев'], role: ['Музыкальный', 'редактор Звук'] },
  { color: '#BF4245', title: ['Индастриал', 'техно-терапия'], name: ['Тося', 'Чайкина'], role: ['Музыкальный', 'критик'] },
  { color: '#247DA4', title: ['Сити-поп', 'прямо из Токио'], name: ['Наоки', 'Тачикава'], role: ['Музыкальный', 'журналист'] },
];
const $ = selector => document.querySelector(selector);
const carousel = $('.carousel'), audio = $('#audio'), seek = $('#seek');
const tg = window.Telegram?.WebApp;
const inTelegram = tg && tg.platform !== 'unknown';
// Optional enhancement: unsupported clients must retain all button behavior.
function haptic(kind = 'medium') {
  const webApp = window.Telegram?.WebApp;
  if (!webApp?.isVersionAtLeast?.('6.1')) return;
  try {
    if (kind === 'selection') webApp.HapticFeedback?.selectionChanged();
    else webApp.HapticFeedback?.impactOccurred(kind);
  } catch { /* Haptics may be unavailable on this device. */ }
}

let active = 0, tracks = [], queues = [], positions = [0,0,0], generation = 0, noticeTimer, scrollTimer, initializing = true;
let favorites = new Set();
try { favorites = new Set(JSON.parse(localStorage.getItem('zvuk-favorites') || '[]')); } catch {}
const lines = words => words.join('<br>');
// Three repeated sets retain the previous implementation's seamless native swipe loop.
carousel.innerHTML = Array.from({length:3}, (_,set) => cards.map((card,i) => `<article class="card" style="--card-color:${card.color}" data-index="${i}" aria-label="${card.title.join(' ')}" aria-roledescription="слайд" ${set !== 1 ? 'aria-hidden="true"' : ''}><img class="card-background" src="assets/card-0${i+1}-background.png" alt="" draggable="false"><div class="card-top"><img class="logo" src="assets/logo.svg" alt="Звук" draggable="false"><span>[0${i+1}/03]</span></div><img class="avatar" src="assets/card-0${i+1}-avatar.png" alt="${card.name.join(' ')}" draggable="false"><div class="card-copy"><h2>${lines(card.title)}</h2><div class="byline"><p>${lines(card.name)}</p><p>${lines(card.role)}</p></div></div></article>`).join('')).join('');
const slides = [...carousel.children];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
function center(index, behavior = 'instant') {
  const el = slides[index];
  carousel.scrollTo({left:el.offsetLeft - (carousel.clientWidth - el.offsetWidth)/2,behavior});
}
function nearest() {
  const middle = carousel.getBoundingClientRect().left + carousel.clientWidth/2;
  return slides.reduce((best,el,i)=>Math.abs(el.getBoundingClientRect().left+el.offsetWidth/2-middle)<Math.abs(slides[best].getBoundingClientRect().left+slides[best].offsetWidth/2-middle)?i:best,0);
}
function tint(hex, fraction) {
  return '#'+hex.slice(1).match(/../g).map(v=>Math.round(255+(parseInt(v,16)-255)*fraction).toString(16).padStart(2,'0')).join('');
}
function theme() {
  const color = cards[active].color, surface = tint(color,.08);
  document.documentElement.style.setProperty('--accent',color);
  document.documentElement.style.setProperty('--toast-background',color+'cc');
  document.documentElement.style.setProperty('--tint',color+'1a');
  document.documentElement.style.setProperty('--surface',surface);
  $('meta[name=theme-color]').content = surface;
  window.dispatchEvent(new Event('miniapp:theme'));
  if (inTelegram) {
    tg.setBackgroundColor?.(surface);
    if (tg.isVersionAtLeast?.('6.9')) tg.setHeaderColor?.(surface);
    if (tg.isVersionAtLeast?.('7.10')) tg.setBottomBarColor?.(surface);
  }
}
function notify(message) { clearTimeout(noticeTimer); $('#status').textContent=message; $('#status').hidden=false; noticeTimer=setTimeout(()=>$('#status').hidden=true,4500); }
function trackSide(index, count) { return index < Math.ceil(count/2) ? 'A' : 'B'; }
function currentTrack() { return queues[active]?.[positions[active]]; }
function savedState() {
  const saved = favorites.has(currentTrack()?.src);
  $('#save').setAttribute('aria-pressed',String(saved));
  $('#save').setAttribute('aria-label',saved?'Удалить трек из избранного':'Добавить трек в избранное');
}
function time(seconds) { return Number.isFinite(seconds)?`${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,'0')}`:'0:00'; }
function progress() {
  const duration = Number.isFinite(audio.duration)?audio.duration:0;
  seek.disabled = !duration;
  seek.value = duration?audio.currentTime/duration*100:0;
  seek.style.setProperty('--progress',`${seek.value}%`);
  seek.setAttribute('aria-valuetext',`${time(audio.currentTime)} из ${time(duration)}`);
  $('#elapsed').textContent=time(audio.currentTime); $('#duration').textContent=time(duration);
}
// Remember playback separately for each card, including while paused.
const startedTracks = new Set();
const playbackKey = () => `${active}:${currentTrack()?.src || ''}`;
function playbackState() {
  const playing = !audio.paused && !audio.ended && !audio.error;
  $('#playlist').classList.toggle('has-started-track',!!currentTrack() && startedTracks.has(playbackKey()));
  $('#play').setAttribute('aria-label',playing?'Пауза':'Воспроизвести');
  $('#play .icon').className=`icon ${playing?'pause':'play'}`;
  if ('mediaSession' in navigator) navigator.mediaSession.playbackState=playing?'playing':'paused';
}
async function play() {
  const request = generation;
  try { await audio.play(); } catch(error) {
    if(request === generation && error.name !== 'AbortError') notify('Не удалось включить трек. Нажмите play ещё раз.');
  }
}
function loadTrack(autoplay=false) {
  const track = currentTrack();
  if (!track) {
    generation++; audio.pause(); audio.removeAttribute('src'); audio.load();
    $('#song-title').textContent='В подборке пока нет треков'; $('#artist').textContent='';
    savedState(); progress(); playbackState();
    if($('#playlist').open)renderPlaylist();
    return;
  }
  generation++;
  audio.pause(); audio.src=track.src; audio.load();
  const playerTitle=`[${trackSide(positions[active],queues[active].length)}] ${track.title}`;
  $('#song-title').textContent=playerTitle; $('#song-title').title=playerTitle;
  $('#artist').textContent=track.artist; $('#artist').title=track.artist;
  savedState(); progress(); playbackState();
  if ('mediaSession' in navigator && 'MediaMetadata' in window) navigator.mediaSession.metadata=new MediaMetadata({title:track.title,artist:track.artist,album:cards[active].title.join(' '),artwork:[{src:new URL(`assets/card-0${active+1}-avatar.png`,location.href).href,type:'image/png'}]});
  if($('#playlist').open) renderPlaylist();
  if(autoplay) void play();
}
function selectCard(index) {
  if (index===active) return;
  const resume = !audio.paused;
  active=index; theme(); loadTrack(resume);
}
carousel.addEventListener('scroll',()=>{
  if(initializing) return;
  selectCard(nearest()%3);
  clearTimeout(scrollTimer);
  scrollTimer=setTimeout(()=>{const physical=nearest(); if(physical<3||physical>5) center(3+physical%3);},160);
},{passive:true});
carousel.addEventListener('keydown',e=>{
  if(e.key==='ArrowRight'||e.key==='ArrowLeft') { e.preventDefault(); center(Math.max(0,Math.min(8,nearest()+(e.key==='ArrowRight'?1:-1))),reducedMotion?'instant':'smooth'); }
});
// Native touch scrolling; pointer drag additionally supports a desktop mouse.
let drag;
carousel.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')return;drag={x:e.clientX,left:carousel.scrollLeft};carousel.setPointerCapture(e.pointerId);carousel.style.scrollSnapType='none';});
carousel.addEventListener('pointermove',e=>{if(drag)carousel.scrollLeft=drag.left+drag.x-e.clientX;});
function endDrag(){if(!drag)return;drag=null;carousel.style.scrollSnapType='';center(nearest(),reducedMotion?'instant':'smooth');}
carousel.addEventListener('pointerup',endDrag);carousel.addEventListener('pointercancel',endDrag);
// Tap beside the portrait to change cards; movement cancels the tap so swipes
// and desktop dragging cannot accidentally trigger an additional transition.
let cardTap;
carousel.addEventListener('pointerdown',event=>{
  if (!event.isPrimary || event.button !== 0) return;
  cardTap={id:event.pointerId,x:event.clientX,y:event.clientY,left:carousel.scrollLeft,moved:false};
});
carousel.addEventListener('pointermove',event=>{
  if(cardTap?.id===event.pointerId && Math.hypot(event.clientX-cardTap.x,event.clientY-cardTap.y)>8) cardTap.moved=true;
});
carousel.addEventListener('pointercancel',()=>{cardTap=null;});
carousel.addEventListener('pointerup',event=>{
  const tap=cardTap;cardTap=null;
  if(!tap || tap.id!==event.pointerId || tap.moved || Math.hypot(event.clientX-tap.x,event.clientY-tap.y)>8 || Math.abs(carousel.scrollLeft-tap.left)>8) return;
  const index=nearest(), card=slides[index];
  const bounds=card.getBoundingClientRect(), avatar=card.querySelector('.avatar').getBoundingClientRect();
  if(event.clientY<avatar.top || event.clientY>avatar.bottom || event.clientX<bounds.left || event.clientX>bounds.right) return;
  const direction=event.clientX<avatar.left?-1:event.clientX>avatar.right?1:0;
  if(!direction)return;
  // Recenter the repeated set first to keep wraparound available at both ends.
  center(3+index%3);
  haptic();
  center(3+index%3+direction,reducedMotion?'instant':'smooth');
});

function step(delta,autoplay=!audio.paused) { const count=queues[active]?.length || 0;if(!count)return; positions[active]=(positions[active]+delta+count)%count; loadTrack(autoplay); }
$('#play').addEventListener('click',()=>{if(!currentTrack())return;haptic();audio.paused?void play():audio.pause();});
$('#prev').addEventListener('click',()=>{if(!currentTrack())return;haptic();step(-1);});$('#next').addEventListener('click',()=>{if(!currentTrack())return;haptic();step(1);});
audio.addEventListener('ended',()=>step(1,true));
audio.addEventListener('playing',()=>{
  if(currentTrack()){startedTracks.add(playbackKey());playbackState();}
});
for(const event of ['play','pause','ended']) audio.addEventListener(event,playbackState);
for(const event of ['loadedmetadata','durationchange','timeupdate','emptied']) audio.addEventListener(event,progress);
audio.addEventListener('error',()=>{playbackState();notify('Трек недоступен. Попробуйте следующий.');});
let seekGesture = null;
seek.addEventListener('pointerdown',event=>{
  if(seek.disabled || !event.isPrimary || event.button !== 0 || seekGesture)return;
  seekGesture={id:event.pointerId,bucket:Math.floor(audio.currentTime/15)};
  seek.classList.add('is-scrubbing');
  haptic('light');
});
function finishSeek(event){
  if(!seekGesture || (event && event.pointerId !== seekGesture.id))return;
  seekGesture=null;
  seek.classList.remove('is-scrubbing');
  if(event?.type==='pointerup')haptic('light');
}
window.addEventListener('pointerup',finishSeek);
window.addEventListener('pointercancel',finishSeek);
window.addEventListener('blur',()=>finishSeek());
audio.addEventListener('emptied',()=>finishSeek());
document.addEventListener('visibilitychange',()=>{if(document.hidden)finishSeek();});
seek.addEventListener('input',()=>{
  if(!Number.isFinite(audio.duration) || audio.duration<=0)return;
  const nextTime=audio.duration*Number(seek.value)/100;
  const oldBucket=seekGesture?.bucket ?? Math.floor(audio.currentTime/15);
  const newBucket=Math.floor(nextTime/15);
  // Only user scrubbing produces ticks, never ordinary playback. A large jump
  // emits one tick, avoiding a queued vibration burst when several marks pass.
  if(newBucket!==oldBucket)haptic('selection');
  if(seekGesture)seekGesture.bucket=newBucket;
  audio.currentTime=nextTime;
  progress();
});
// Telegram exposes individual impacts; two paired beats form the like rhythm.
let heartbeatTimers = [];
function stopHeartbeat() {
  heartbeatTimers.forEach(clearTimeout);
  heartbeatTimers = [];
}
function heartbeat() {
  stopHeartbeat();
  haptic('medium');
  for (const [delay, kind] of [[120,'heavy'],[460,'medium'],[580,'heavy']]) {
    heartbeatTimers.push(setTimeout(()=>{if(!document.hidden)haptic(kind);},delay));
  }
}
const likeToast = $('#like-toast');
let toastTimer, toastExitTimer, toastGesture, suppressToastClick = false;
function dismissLikeToast() {
  clearTimeout(toastTimer);
  clearTimeout(toastExitTimer);
  likeToast.classList.remove('is-visible');
  likeToast.inert = true;
  if(likeToast.contains(document.activeElement))$('#save').focus({preventScroll:true});
  toastExitTimer = setTimeout(()=>{likeToast.hidden=true;},reducedMotion?0:260);
}
function showLikeToast() {
  clearTimeout(toastTimer);
  clearTimeout(toastExitTimer);
  suppressToastClick = false;
  likeToast.hidden = false;
  likeToast.inert = false;
  void likeToast.offsetHeight;
  likeToast.classList.add('is-visible');
  toastTimer = setTimeout(dismissLikeToast,4000);
}
likeToast.addEventListener('pointerdown',event=>{
  if(!event.isPrimary || event.button!==0)return;
  toastGesture={id:event.pointerId,x:event.clientX,y:event.clientY};
  suppressToastClick=false;
});
window.addEventListener('pointermove',event=>{
  if(toastGesture?.id!==event.pointerId)return;
  const dy=event.clientY-toastGesture.y, dx=event.clientX-toastGesture.x;
  if(dy < -24 && Math.abs(dy)>Math.abs(dx)) {
    toastGesture=null;
    suppressToastClick=true;
    dismissLikeToast();
  }
},{passive:true});
for(const name of ['pointerup','pointercancel'])window.addEventListener(name,()=>{toastGesture=null;});
$('#like-toast-open').addEventListener('click',()=>{
  if(suppressToastClick)return;
  stopHeartbeat();
  haptic();
  dismissLikeToast();
});
likeToast.addEventListener('keydown',event=>{if(event.key==='Escape')dismissLikeToast();});
window.addEventListener('pagehide',stopHeartbeat);
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){stopHeartbeat();dismissLikeToast();}
});
$('#save').addEventListener('click',()=>{
  const track=currentTrack();if(!track)return;
  stopHeartbeat();
  if(favorites.has(track.src)) {
    favorites.delete(track.src);
    haptic();
    dismissLikeToast();
  } else {
    favorites.add(track.src);
    heartbeat();
    showLikeToast();
  }
  try{localStorage.setItem('zvuk-favorites',JSON.stringify([...favorites]));}catch{}
  savedState();
});
const sheet=$('#playlist');
let sheetCloseTimer, sheetDrag, sheetSuppressClick=false;
function closePlaylist() {
  if(!sheet.open)return;
  sheet.classList.remove('is-open');
  sheet.style.removeProperty('--sheet-drag');
  clearTimeout(sheetCloseTimer);
  sheetCloseTimer=setTimeout(()=>sheet.close(),reducedMotion?0:260);
}
function renderPlaylist() {
  const container=$('#tracks'); container.replaceChildren();
  $('#playlist-title').textContent=cards[active].title.join(' ');
  const queue=queues[active] || [], split=Math.ceil(queue.length/2);
  let section;
  queue.forEach((track,i)=>{
    const side=trackSide(i,queue.length);
    if(i===0 || i===split){
      section=document.createElement('section');section.className='track-side';section.dataset.side=side;
      section.setAttribute('aria-label',`Side ${side}`);
      const heading=document.createElement('div');heading.className='side-heading';
      heading.innerHTML=side==='A'?'<span>Tracklist</span><span>Date/Time</span><span>[Side A]</span>':'<span>[Side B]</span><span class="noise-label">Noise reduction <i aria-hidden="true"></i></span>';
      section.append(heading);container.append(section);
    }
    const button=document.createElement('button');button.className='track';
    button.setAttribute('aria-current',String(i===positions[active]));
    const copy=document.createElement('span');copy.className='track-copy';
    const title=document.createElement('span');title.className='track-title';title.textContent=track.title;
    const artist=document.createElement('span');artist.className='track-artist';artist.textContent=track.artist;
    const duration=document.createElement('span');duration.className='track-duration';duration.textContent=Number.isFinite(track.duration)?time(track.duration):'—';
    const number=document.createElement('span');number.className='track-number';number.textContent=`[${String((side==='A'?i:i-split)+1).padStart(2,'0')}]`;
    duration.textContent=Number.isFinite(track.duration)?`(${time(track.duration).padStart(5,'0')})`:'(—)';
    button.dataset.side=side;
    copy.append(title,artist);button.append(number,copy,duration);
    button.onclick=()=>{if(sheetSuppressClick)return;haptic();positions[active]=i;loadTrack(true);closePlaylist();};section.append(button);
  });
}
$('#tracklist').onclick=()=>{
  haptic();sheetSuppressClick=false;clearTimeout(sheetCloseTimer);renderPlaylist();sheet.showModal();
  sheet.style.removeProperty('--sheet-drag');void sheet.offsetHeight;sheet.classList.add('is-open');
};
$('.sheet-handle').onclick=()=>{if(!sheetSuppressClick){haptic();closePlaylist();}};
sheet.addEventListener('cancel',event=>{event.preventDefault();closePlaylist();});
sheet.addEventListener('click',event=>{
  if(event.target!==sheet)return;
  const r=sheet.getBoundingClientRect();
  if(event.clientY<r.top||event.clientX<r.left||event.clientX>r.right)closePlaylist();
});
// The handle always drags; the list can be pulled down only at its top.
sheet.addEventListener('touchstart',event=>{
  sheetSuppressClick=false;
  if(event.touches.length!==1)return;
  const handle=event.target.closest('.sheet-handle,.dialog-heading');
  if(!handle && $('#tracks').scrollTop>0)return;
  const touch=event.touches[0];sheetDrag={x:touch.clientX,y:touch.clientY,dy:0};
},{passive:true});
sheet.addEventListener('touchmove',event=>{
  if(!sheetDrag||event.touches.length!==1)return;
  const touch=event.touches[0],dy=touch.clientY-sheetDrag.y,dx=touch.clientX-sheetDrag.x;
  if(dy<=0 || Math.abs(dx)>dy){if(!sheetDrag.dy)sheetDrag=null;return;}
  event.preventDefault();sheetDrag.dy=dy;sheetSuppressClick=dy>8;
  sheet.classList.add('is-dragging');sheet.style.setProperty('--sheet-drag',`${dy}px`);
},{passive:false});
function endSheetDrag(event){
  if(!sheetDrag)return;
  const dismiss=event.type!=='touchcancel'&&sheetDrag.dy>70;
  sheetDrag=null;sheet.classList.remove('is-dragging');
  if(dismiss){haptic('light');closePlaylist();}else sheet.style.removeProperty('--sheet-drag');
}
sheet.addEventListener('touchend',endSheetDrag);
sheet.addEventListener('touchcancel',endSheetDrag);
sheet.addEventListener('pointerdown',event=>{
  if(event.pointerType!=='mouse'||!event.target.closest('.sheet-handle'))return;
  sheetSuppressClick=false;sheetDrag={y:event.clientY,dy:0};event.target.setPointerCapture(event.pointerId);
});
sheet.addEventListener('pointermove',event=>{
  if(event.pointerType!=='mouse'||!sheetDrag)return;
  sheetDrag.dy=Math.max(0,event.clientY-sheetDrag.y);sheetSuppressClick=sheetDrag.dy>8;
  sheet.classList.add('is-dragging');sheet.style.setProperty('--sheet-drag',`${sheetDrag.dy}px`);
});
sheet.addEventListener('pointerup',event=>{if(event.pointerType==='mouse')endSheetDrag(event);});
sheet.addEventListener('pointercancel',()=>endSheetDrag({type:'touchcancel'}));
function updateViewport() {
  if(inTelegram){
    if(tg.viewportStableHeight)document.documentElement.style.setProperty('--app-height',`${tg.viewportStableHeight}px`);
    document.documentElement.style.setProperty('--safe-top',`${(tg.safeAreaInset?.top||0)+(tg.contentSafeAreaInset?.top||0)}px`);
    document.documentElement.style.setProperty('--safe-bottom',`${Math.max(12,(tg.safeAreaInset?.bottom||0)+(tg.contentSafeAreaInset?.bottom||0))}px`);
  }
  center(3+active);
}
if(inTelegram){tg.ready();tg.expand();for(const event of ['viewportChanged','safeAreaChanged','contentSafeAreaChanged'])tg.onEvent(event,updateViewport);}
window.addEventListener('resize',updateViewport);
if('mediaSession' in navigator){for(const [action,handler] of Object.entries({play:()=>play(),pause:()=>audio.pause(),previoustrack:()=>step(-1),nexttrack:()=>step(1),seekto:details=>{if(Number.isFinite(details.seekTime))audio.currentTime=details.seekTime;}})){try{navigator.mediaSession.setActionHandler(action,handler);}catch{}}}
updateViewport();theme();requestAnimationFrame(()=>{center(3);initializing=false;});
try {
  const response=await fetch('tracks.json?v=20260922-sheet'); if(!response.ok)throw new Error('Catalog unavailable');
  tracks=await response.json(); if(!tracks.length)throw new Error('Empty catalog');
  queues=cards.map((_,i)=>tracks.filter(track=>track.card===i+1));
  loadTrack();
} catch { $('#song-title').textContent='Нет доступных треков';$('#artist').textContent='Не удалось загрузить Songs';notify('Не удалось загрузить музыку. Обновите страницу.'); }

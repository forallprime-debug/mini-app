import {loadConfig,validateConfig,defaultConfig,configKey} from './card-config.js?v=20260924-four-cards';
const $=s=>document.querySelector(s),names=['Эмбиент-техно романтика','Индастриал техно-терапия','Сити-поп прямо из Токио','Атмосфераная дарк альтернатива'];
let config=await loadConfig(),selected=config.order[0],state='idle',ready=false;
const iframe=$('#preview');
const controls=[['speed','Скорость',0,4,.01],['contrast','Контрастность',0,2,.01],['intensity','Свечение',0,2,.01],['colorSpread','Разброс оттенков',0,1.5,.01],['motionScale','Деформация',0,3,.01],['maxPixelRatio','Разрешение',.5,2,.1]];
function post(message){if(ready)iframe.contentWindow.postMessage(message,location.origin);}
function update(){post({type:'admin:config',config});$('#status').textContent='Есть несохранённые изменения';renderCards();}
function renderCards(){
  $('#card-list').replaceChildren();
  config.order.forEach((id,slot)=>{
    const row=document.createElement('div');row.className='card-row';
    const choose=document.createElement('button');choose.className='choose';choose.setAttribute('aria-pressed',String(selected===id));
    const dot=document.createElement('i');dot.style.background=config.cards[id].color;choose.append(dot,document.createTextNode(`${slot+1}. ${names[id]}`));
    choose.onclick=()=>{selected=id;render();post({type:'admin:card',index:id});};row.append(choose);
    for(const [delta,label] of [[-1,'↑'],[1,'↓']]){const button=document.createElement('button');button.textContent=label;button.setAttribute('aria-label',`${delta<0?'Поднять':'Опустить'} ${names[id]}`);button.disabled=slot+delta<0||slot+delta>=config.cards.length;button.onclick=()=>{[config.order[slot],config.order[slot+delta]]=[config.order[slot+delta],config.order[slot]];update();};row.append(button);}
    $('#card-list').append(row);
  });
}
function render(){
  renderCards();$('#card-title').textContent=names[selected];$('#color').value=config.cards[selected].color;$('#hex').value=config.cards[selected].color;
  document.querySelectorAll('[data-state]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.state===state)));
  $('#reaction-fields').hidden=state!=='playing';$('#reaction').value=config.cards[selected].reaction;$('#strength').value=config.cards[selected].strength;$('#strength-value').textContent=config.cards[selected].strength.toFixed(2);
  $('#sliders').replaceChildren();
  for(const [key,label,min,max,step] of controls){
    const field=document.createElement('label');field.className='field';field.textContent=label;
    const output=document.createElement('output');output.textContent=config.cards[selected][state][key].toFixed(2);
    const input=document.createElement('input');input.type='range';input.min=min;input.max=max;input.step=step;input.value=config.cards[selected][state][key];input.id=`setting-${key}`;
    input.oninput=()=>{config.cards[selected][state][key]=Number(input.value);output.textContent=Number(input.value).toFixed(2);update();};field.append(output,input);$('#sliders').append(field);
  }
}
document.querySelectorAll('[data-state]').forEach(b=>b.onclick=()=>{state=b.dataset.state;render();});
$('#color').oninput=()=>{config.cards[selected].color=$('#color').value;$('#hex').value=$('#color').value;update();};
$('#hex').onchange=()=>{const value=$('#hex').value.trim();if(value===config.cards[selected].color)return;if(!/^#[0-9a-f]{6}$/i.test(value)){$('#status').textContent='Введите HEX в формате #625BFF';return;}config.cards[selected].color=value;$('#color').value=value;update();};
$('#reaction').onchange=()=>{config.cards[selected].reaction=$('#reaction').value;update();};
$('#strength').oninput=()=>{config.cards[selected].strength=Number($('#strength').value);$('#strength-value').textContent=config.cards[selected].strength.toFixed(2);update();};
$('#save').onclick=()=>{try{localStorage.setItem(configKey,JSON.stringify(validateConfig(config)));$('#status').textContent='Сохранено в этом браузере. Мини-апп прочитает настройки при следующем открытии.';}catch{$('#status').textContent='Не удалось сохранить настройки';}};
$('#export').onclick=()=>{const blob=new Blob([JSON.stringify(validateConfig(config),null,2)+'\n'],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='card-settings.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('#import').onchange=async event=>{try{const file=event.target.files[0];if(!file)return;config=validateConfig(JSON.parse(await file.text()));render();update();post({type:'admin:card',index:selected});}catch(error){$('#status').textContent=`Не удалось загрузить: ${error.message}`;}event.target.value='';};
$('#reset').onclick=()=>{config.cards[selected]=structuredClone(defaultConfig.cards[selected]);render();update();};
function player(){return iframe.contentDocument?.querySelector('#audio');}
$('#music').onclick=()=>{if(!ready)return;const audio=player();if(audio?.paused)iframe.contentDocument.querySelector('#play').click();state='playing';render();};
$('#silent').onclick=()=>{player()?.pause();state='idle';render();};
function connect(){ready=true;post({type:'admin:config',config});post({type:'admin:card',index:selected});const audio=player();if(audio){const sync=()=>$('#preview-state').textContent=audio.paused?'Без музыки / пауза':'Играет музыка';for(const name of ['play','pause','ended'])audio.addEventListener(name,sync);sync();}}
window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==iframe.contentWindow)return;if(event.data.type==='admin:ready')connect();if(event.data.type==='admin:active'&&selected!==event.data.index){selected=event.data.index;render();}if(event.data.type==='admin:error')$('#status').textContent=event.data.message;});
// The iframe may finish loading while the editor reads its saved configuration.
if(iframe.contentDocument?.querySelector('#song-title')?.textContent.startsWith('['))connect();
render();

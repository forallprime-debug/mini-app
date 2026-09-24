export const configKey='zvuk-card-settings-v1';
export const defaultConfig={version:1,order:[0,1,2,3],cards:['#625BFF','#BF4245','#247DA4','#5A1DA5'].map(color=>({color,idle:{speed:1.2,intensity:.4,contrast:1,colorSpread:1.14,motionScale:2.15,maxPixelRatio:1.5},playing:{speed:2.8,intensity:.4,contrast:1,colorSpread:1.14,motionScale:2.15,maxPixelRatio:1.5},reaction:'both',strength:.8}))};
export function validateConfig(input){
  if(input?.cards?.length===3 && input.order?.length===3)input={...input,cards:[...input.cards,structuredClone(defaultConfig.cards[3])],order:[...input.order,3]};
  const result=structuredClone(defaultConfig);
  if(!input||!Array.isArray(input.cards)||input.cards.length!==4)throw Error('Нужны настройки четырёх карточек');
  if(!Array.isArray(input.order)||input.order.length!==4||new Set(input.order).size!==4||input.order.some(i=>![0,1,2,3].includes(i)))throw Error('Неверный порядок карточек');
  result.order=[...input.order];
  const ranges={speed:[0,4],intensity:[0,2],contrast:[0,2],colorSpread:[0,1.5],motionScale:[0,3],maxPixelRatio:[.5,2]};
  input.cards.forEach((card,i)=>{
    if(!/^#[0-9a-f]{6}$/i.test(card.color))throw Error('Неверный цвет');
    const out=result.cards[i];out.color=card.color;
    for(const state of ['idle','playing'])for(const [key,[min,max]] of Object.entries(ranges)){
      const value=card[state]?.[key];if(!Number.isFinite(value)||value<min||value>max)throw Error(`Неверная настройка ${key}`);out[state][key]=value;
    }
    if(!['off','glow','motion','both'].includes(card.reaction)||!Number.isFinite(card.strength)||card.strength<0||card.strength>1)throw Error('Неверная реакция на музыку');
    out.reaction=card.reaction;out.strength=card.strength;
  });return result;
}
export async function loadConfig(){
  try{const saved=localStorage.getItem(configKey);if(saved)return validateConfig(JSON.parse(saved));}catch{/* Ignore invalid local settings. */}
  try{const response=await fetch('card-settings.json');if(response.ok)return validateConfig(await response.json());}catch{/* Built-in defaults work offline. */}
  return structuredClone(defaultConfig);
}

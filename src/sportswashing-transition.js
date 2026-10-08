import {victoryState,victoryCamera} from './victory-state.js';
const mix=(a,b,p)=>a+(b-a)*p;
const alpha=(element,value)=>{element.style.opacity=String(value);element.style.visibility=value>.001?'visible':'hidden'};

export function createSportswashingTransition(){
 const section=document.querySelector('#celebracion'),photo=section.querySelector('.victory-photo'),shade=section.querySelector('.victory-shade');
 const panel=section.querySelector('.sportswashing-panel'),title=panel.querySelector('.sportswashing-wordmark'),wLetter=title.querySelector('.sportswashing-w');
 const mural=panel.querySelector('.sportswashing-mural'),prefix=title.querySelector('.sportswashing-prefix'),suffix=title.querySelector('.sportswashing-suffix');
 const ink=wLetter.querySelector('.sportswashing-w-ink');
 const strokes=[...panel.querySelectorAll('.sportswashing-paint-stroke')],copy=[...panel.querySelectorAll('[data-sportswashing-copy]')],kicker=panel.querySelector('.sportswashing-kicker'),definition=panel.querySelector('.sportswashing-definition');
 let geometry;
 function resize(){
  const w=section.clientWidth,h=innerHeight,mobile=w<701;
  const ox=wLetter.offsetLeft+wLetter.offsetWidth/2,oy=wLetter.offsetTop+wLetter.offsetHeight/2;
  geometry={w,h,ox,oy,tw:title.offsetWidth,th:title.offsetHeight,lw:wLetter.offsetWidth,lh:wLetter.offsetHeight,mobile};
  title.style.transformOrigin=`${ox}px ${oy}px`;
 }
 function render(progress){
  if(!geometry)return;
  if(document.body.classList.contains('victory-static')){
   photo.style.cssText='';shade.style.opacity='';alpha(panel,1);alpha(title,1);title.style.transform='';title.removeAttribute('aria-hidden');mural.style.transform='';mural.style.opacity='1';prefix.style.clipPath='none';suffix.style.clipPath='none';ink.style.fill='';
   strokes.forEach(path=>path.style.strokeDashoffset='0');copy.forEach(el=>{alpha(el,1);el.style.transform='';el.inert=false});alpha(kicker,1);alpha(definition,1);definition.inert=false;return;
  }
  const s=victoryState(progress),g=geometry,camera=victoryCamera(g.w,g.h,s);
  photo.style.width=`${camera.width}px`;photo.style.height=`${camera.height}px`;
  photo.style.transform=`translate3d(${camera.x}px,${camera.y}px,0)`;
  // Depth of field softens the background as the same engraved W stays crisp.
  photo.style.filter=`blur(${s.focus*3}px)`;shade.style.opacity=String(1-s.focus*.65);
  const restScale=g.mobile?1:.62;
  const sx=mix(mix(camera.letterWidth/g.lw,1,s.pullback),restScale,s.travel);
  const sy=mix(mix(camera.letterHeight/g.lh,1,s.pullback),restScale,s.travel);
  const x=mix(mix(camera.letterX-g.ox,g.w/2-g.tw/2,s.center),g.w*.07-g.ox*(1-restScale),s.travel);
  const y=mix(mix(camera.letterY-g.oy,g.h*.5-g.th/2,s.center),(g.mobile?125:g.h*.34)-g.oy*(1-restScale),s.travel);
  title.style.transform=`translate3d(${x}px,${y}px,0) scale(${sx},${sy})`;
  alpha(title,s.inscription);title.setAttribute('aria-hidden',s.letters<.05?'true':'false');
  prefix.style.clipPath=`inset(0 0 0 ${(1-s.letters)*100}%)`;suffix.style.clipPath=`inset(0 ${(1-s.letters)*100}% 0 0)`;
  ink.style.fill=`color-mix(in srgb, #28302f ${(1-s.letters)*100}%, var(--noche))`;
  alpha(panel,1);mural.style.opacity='1';mural.style.transform=`scale(${mix(1.06,1,s.pullback)})`;
  strokes.forEach((path,i)=>path.style.strokeDashoffset=String(1-s.strokes[i]));
  alpha(kicker,s.travel);alpha(definition,s.copy[0]);definition.inert=s.copy[0]<.8;
  copy.forEach((el,i)=>{alpha(el,s.copy[i]);el.style.transform=`translate3d(0,${(1-s.copy[i])*24}px,0)`;el.inert=s.copy[i]<.8});
  section.dataset.phase=s.copy[0]>0?'explanation':s.travel>0?'title-left':s.pullback>0?'word-reveal':s.focus>0?'plate-inscription':'celebration';
 }
 resize();return {render,resize};
}

import {gsap} from 'gsap';
import {sportswashingCases,previewPosition} from './sportswashing-cases-data.js';

export function createSportswashingCases({reduced=false}={}){
 const section=document.querySelector('#contexto'),panel=section.querySelector('.washing-explanation');
 const list=section.querySelector('.washing-cases'),preview=section.querySelector('.washing-case-preview');
 const poster=preview.querySelector('img'),title=preview.querySelector('.washing-preview-title'),credit=preview.querySelector('.washing-preview-credit');
 const links=[...list.querySelectorAll('[data-case]')],buttons=[...list.querySelectorAll('[data-case-preview]')];
 const cleanups=[];let active=null,enabled=reduced,disposed=false,sticky=false,lastPointer;
 const xTo=gsap.quickTo(preview,'x',{duration:reduced?0:.35,ease:'power3.out'}),yTo=gsap.quickTo(preview,'y',{duration:reduced?0:.35,ease:'power3.out'});
 gsap.set(preview,{autoAlpha:0,scale:1});
 function listen(target,type,handler){target.addEventListener(type,handler);cleanups.push(()=>target.removeEventListener(type,handler))}
 function position(event,initial=false){
  const bounds=panel.getBoundingClientRect(),rect=preview.getBoundingClientRect();
  const anchor=list.querySelector(`[data-case="${active}"]`)?.getBoundingClientRect();
  const compact=innerWidth<601;
  const p=previewPosition({x:event?.clientX??anchor?.right??bounds.width*.75,y:event?.clientY??(anchor?.top+anchor?.height/2),width:rect.width,height:rect.height,bounds,compact});
  if(compact){p.x=Math.max(12,(bounds.width-rect.width)/2);p.y=Math.max(panel.scrollTop+92,anchor.top-bounds.top+panel.scrollTop-rect.height-12)}
  if(initial||reduced)gsap.set(preview,p);else{xTo(p.x);yTo(p.y)}
 }
 function hide(){
  active=null;sticky=false;
  list.removeAttribute('data-active');links.forEach(link=>link.removeAttribute('data-active'));
  buttons.forEach(button=>button.setAttribute('aria-pressed','false'));
  gsap.to(preview,{autoAlpha:0,scale:reduced?1:.95,duration:reduced?0:.2,overwrite:'auto'});
 }
 function show(id,event,{explicit=false}={}){
  if(!enabled||disposed)return;
  if(active===id){position(event);if(explicit)sticky=true;return}
  const first=active===null;active=id;sticky=explicit;
  const data=sportswashingCases[id];preview.dataset.playback='poster';preview.dataset.case=id;
  poster.src=import.meta.env.BASE_URL+data.poster;title.textContent=data.title;credit.textContent=data.posterCredit;
  list.dataset.active=id;links.forEach(link=>link.toggleAttribute('data-active',link.dataset.case===id));
  buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.casePreview===id)));
  position(event,first);
  gsap.to(preview,{autoAlpha:1,scale:1,rotation:0,duration:reduced?0:.35,ease:'power3.out',overwrite:'auto'});
 }
 links.forEach(link=>{
  listen(link,'pointerenter',event=>{if(event.pointerType!=='touch'){lastPointer=event;show(link.dataset.case,event)}});
  listen(link,'pointermove',event=>{if(event.pointerType!=='touch'){lastPointer=event;if(active===link.dataset.case)position(event)}});
  listen(link,'focus',()=>show(link.dataset.case));
  listen(link,'blur',()=>{if(!sticky)hide()});
 });
 buttons.forEach(button=>listen(button,'click',()=>active===button.dataset.casePreview&&sticky?hide():show(button.dataset.casePreview,null,{explicit:true})));
 listen(list,'pointerleave',()=>{if(!sticky&&!list.contains(document.activeElement))hide()});
 listen(document,'keydown',event=>{if(event.key==='Escape')hide()});
 listen(document,'pointerdown',event=>{if(sticky&&!list.contains(event.target))hide()});
 listen(document,'visibilitychange',()=>{if(document.hidden)hide()});
 function responsive(){panel.toggleAttribute('data-lenis-prevent',innerWidth<601&&!reduced);if(active)position(null,true)}
 listen(window,'resize',responsive);responsive();
 function setEnabled(value){
  if(enabled===value)return;enabled=value;
  if(!value){hide();return}
  const hovered=links.find(link=>link.matches(':hover'));
  const focused=links.find(link=>link===document.activeElement);
  if(hovered)show(hovered.dataset.case,lastPointer);
  else if(focused)show(focused.dataset.case);
 }
 return {setEnabled,hide,dispose(){disposed=true;hide();cleanups.forEach(fn=>fn());gsap.killTweensOf(preview);xTo.tween.kill();yTo.tween.kill();panel.removeAttribute('data-lenis-prevent')}};
}

import {gsap} from 'gsap';
import {sportswashingCases,previewPosition} from './sportswashing-cases-data.js';

let apiPromise;
function youtubeAPI(){
 if(window.YT?.Player)return Promise.resolve(window.YT);
 if(apiPromise)return apiPromise;
 apiPromise=new Promise((resolve,reject)=>{
  const previous=window.onYouTubeIframeAPIReady;
  const timer=setTimeout(()=>reject(new Error('Video provider unavailable')),15000);
  window.onYouTubeIframeAPIReady=()=>{clearTimeout(timer);previous?.();resolve(window.YT)};
  const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.async=true;
  script.onerror=()=>{clearTimeout(timer);reject(new Error('Video provider unavailable'))};
  document.head.append(script);
 });
 return apiPromise;
}

export function createSportswashingCases({reduced=false}={}){
 const section=document.querySelector('#contexto'),panel=section.querySelector('.washing-explanation');
 const list=section.querySelector('.washing-cases'),preview=section.querySelector('.washing-case-preview');
 const poster=preview.querySelector('img'),title=preview.querySelector('.washing-preview-title'),credit=preview.querySelector('.washing-preview-credit');
 const links=[...list.querySelectorAll('[data-case]')],buttons=[...list.querySelectorAll('[data-case-preview]')];
 const cleanups=[];let active=null,enabled=reduced,disposed=false,sticky=false,player,ready=false,creating,timeout,lastPointer;
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
 function fallback(){
  clearTimeout(timeout);preview.dataset.playback='unavailable';
  if(active)credit.textContent=sportswashingCases[active].posterCredit;
 }
 function loadActive(){
  if(!ready||!active||!enabled||disposed)return;
  const data=sportswashingCases[active];preview.dataset.playback='loading';
  player.mute();player.loadVideoById({videoId:data.videoId,startSeconds:data.start,endSeconds:data.end});
  clearTimeout(timeout);timeout=setTimeout(fallback,14000);
 }
 async function play(){
  if(ready){loadActive();return}
  if(creating)return;
  creating=true;
  try{
   const YT=await youtubeAPI();
   if(disposed||!active||!enabled){creating=false;return}
   const iframe=document.createElement('iframe');
   iframe.src=`https://www.youtube-nocookie.com/embed/${sportswashingCases[active].videoId}?enablejsapi=1&origin=${encodeURIComponent(location.origin)}&playsinline=1&controls=0&rel=0&mute=1`;
   iframe.title='Vista previa de video del caso';iframe.allow='autoplay; encrypted-media';iframe.referrerPolicy='strict-origin-when-cross-origin';iframe.tabIndex=-1;iframe.setAttribute('aria-hidden','true');
   preview.querySelector('.washing-case-player').replaceChildren(iframe);
   clearTimeout(timeout);timeout=setTimeout(fallback,14000);
   player=new YT.Player(iframe,{events:{
    onReady(){ready=true;if(active&&enabled)loadActive()},
    onStateChange(event){
     if(disposed||!active||!enabled){if(event.data===1)player.pauseVideo();return}
     if(event.data===1&&player.getVideoData()?.video_id===sportswashingCases[active].videoId){clearTimeout(timeout);preview.dataset.playback='playing';credit.textContent=sportswashingCases[active].credit}
     if(event.data===0)loadActive();
    },
    onError(event){preview.dataset.error=String(event.data);if(!disposed&&active)fallback()},
    onAutoplayBlocked(){if(!disposed&&active)fallback()},
   }});
  }catch{if(!disposed&&active)fallback();creating=false}
 }
 function hide(){
  active=null;sticky=false;clearTimeout(timeout);player?.pauseVideo?.();
  list.removeAttribute('data-active');links.forEach(link=>link.removeAttribute('data-active'));
  buttons.forEach(button=>button.setAttribute('aria-pressed','false'));
  gsap.to(preview,{autoAlpha:0,scale:reduced?1:.95,duration:reduced?0:.2,overwrite:'auto'});
 }
 function show(id,event,{explicit=false}={}){
  if(!enabled||disposed)return;
  if(active===id){position(event);if(explicit){sticky=true;play()}return}
  const first=active===null;active=id;sticky=explicit;
  const data=sportswashingCases[id];preview.dataset.playback='loading';preview.dataset.case=id;delete preview.dataset.error;
  poster.src=import.meta.env.BASE_URL+data.poster;title.textContent=data.title;credit.textContent=data.posterCredit;
  list.dataset.active=id;links.forEach(link=>link.toggleAttribute('data-active',link.dataset.case===id));
  buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.casePreview===id)));
  position(event,first);
  gsap.to(preview,{autoAlpha:1,scale:1,rotation:0,duration:reduced?0:.35,ease:'power3.out',overwrite:'auto'});
  if(!reduced||explicit)play();else preview.dataset.playback='poster';
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
 return {setEnabled,hide,dispose(){disposed=true;hide();cleanups.forEach(fn=>fn());clearTimeout(timeout);player?.destroy?.();gsap.killTweensOf(preview);xTo.tween.kill();yTo.tween.kill();panel.removeAttribute('data-lenis-prevent')}};
}

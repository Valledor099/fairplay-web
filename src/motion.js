import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {eventStory,storyDistance,productDistance,REWARDS_READY,PRODUCT_DISTANCE} from './event-story.js';
import {smooth} from './passport-model.js';
import {WASHING_DISTANCE,washingState} from './sportswashing-state.js';
gsap.registerPlugin(ScrollTrigger);
export function initMotion({reduced,collection,onFrame}){
 const state={progress:0,washing:0};let paused=false;
 const washing=document.querySelector('#contexto');
 const header=document.querySelector('.site-header');
 const updateHeader=()=>header.classList.toggle('is-scrolled',scrollY>12);
 addEventListener('scroll',updateHeader,{passive:true});updateHeader();
 // La reserva pausa el recorrido, pero mantiene el scroll nativo del documento.
 const event=document.querySelector('#evento'),lenis=reduced?null:new Lenis({lerp:.08,smoothWheel:true,wheelMultiplier:.95,virtualScroll:()=>!paused});
 const passport=document.querySelector('.passport-story'),rewards=document.querySelector('#recompensas'),windowElement=document.querySelector('.collection-window');
 const count=document.querySelectorAll('.collection-card').length,total=storyDistance(count);
 const previous=document.querySelector('[data-collection-prev]'),next=document.querySelector('[data-collection-next]');
 let cinematic=!reduced,currentProduct=0;
 function configure(){
  cinematic=!reduced&&!document.body.classList.contains('no-webgl');
  washing.style.height=reduced?'':`${(WASHING_DISTANCE+1)*innerHeight}px`;
  document.body.classList.toggle('has-event-story',cinematic);
  event.style.height=cinematic?`${(1+total)*innerHeight}px`:'';
  windowElement.toggleAttribute('data-lenis-prevent',!cinematic);
  if(!cinematic){collection.reset();for(const layer of [passport,rewards]){layer.removeAttribute('style');layer.inert=false;layer.removeAttribute('aria-hidden')}}
  collection.resize();
 }
 configure();
 lenis?.on('scroll',ScrollTrigger.update);gsap.ticker.lagSmoothing(0);
 const context=gsap.context(()=>{
  if(reduced)return;
  const hero=document.querySelector('.hero'),brand=document.querySelector('.shared-brand');
  gsap.to(brand,{y:-60,autoAlpha:0,ease:'none',scrollTrigger:{trigger:hero,start:'top -6%',end:'bottom 65%',scrub:.6,invalidateOnRefresh:true}});
  gsap.from('.hero-reveal-control>*',{opacity:0,y:12,duration:1,delay:.5,stagger:.12,ease:'power3.out'});
  gsap.to('.hero-scroll,.hero-reveal-control',{autoAlpha:0,y:-16,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'top -22%',scrub:true,invalidateOnRefresh:true}});
  gsap.to('.hero-media',{opacity:0,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom 20%',scrub:true,invalidateOnRefresh:true}});
  document.querySelectorAll('.context-media').forEach(media=>gsap.fromTo(media.querySelector('img'),{yPercent:-4,scale:1.08},{yPercent:4,scale:1.08,ease:'none',scrollTrigger:{trigger:media,start:'top bottom',end:'bottom top',scrub:.8,invalidateOnRefresh:true}}));
  gsap.to(state,{washing:1,ease:'none',scrollTrigger:{id:'washing-story',trigger:washing,start:'top top',end:'bottom bottom',scrub:.65,invalidateOnRefresh:true}});
  gsap.to(state,{progress:1,ease:'none',scrollTrigger:{id:'event-story',trigger:event,start:'top top',end:'bottom bottom',scrub:.65,invalidateOnRefresh:true,snap:{snapTo:value=>{
   const distance=value*total,last=productDistance(count-1);
   if(!cinematic||distance<REWARDS_READY-.12||distance>last+.2)return value;
   return productDistance(Math.max(0,Math.min(count-1,Math.round((distance-REWARDS_READY)/PRODUCT_DISTANCE))))/total;
  },delay:.22,duration:{min:.2,max:.45},inertia:false}}});
 });
 const nav=[...document.querySelectorAll('[data-nav]')];
 const sectionTriggers=['contexto','evento','nosotros','tickets'].map(id=>ScrollTrigger.create({trigger:'#'+id,start:'top 45%',end:'bottom 45%',onToggle:self=>{if(self.isActive&&document.querySelector('#reservation-view').hidden)nav.forEach(link=>{if(link.dataset.nav===id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')})}}));
 function position(p){return event.offsetTop+p*(event.offsetHeight-innerHeight)}
 function scrollTo(target,immediate=false,duration=1.1){const top=typeof target==='number'?target:target.getBoundingClientRect().top+scrollY;if(lenis)lenis.scrollTo(top,{immediate,duration});else window.scrollTo({top,behavior:'instant'})}
 function productTo(index){
  const target=Math.max(0,Math.min(count-1,index));
  if(cinematic)scrollTo(position(productDistance(target)/total),false,.75);
  else collection.scrollTo(target,reduced);
 }
 const prevClick=()=>productTo(Math.round(currentProduct)-1),nextClick=()=>productTo(Math.round(currentProduct)+1);
 const keys=e=>{if(!cinematic||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();productTo(e.key==='Home'?0:e.key==='End'?count-1:Math.round(currentProduct)+(e.key==='ArrowRight'?1:-1))};
 const horizontal=e=>{if(!cinematic||Math.abs(e.deltaX)<=Math.abs(e.deltaY))return;e.preventDefault();scrollTo(scrollY+e.deltaX*2,true)};
 let swipe=null,suppressClick=false;
 const down=e=>{suppressClick=false;if(!cinematic||e.pointerType==='mouse')return;swipe={x:e.clientX,y:e.clientY,scroll:scrollY,claimed:false}};
 const move=e=>{if(!swipe)return;const dx=e.clientX-swipe.x,dy=e.clientY-swipe.y;if(!swipe.claimed){if(Math.abs(dy)>8&&Math.abs(dy)>Math.abs(dx)){swipe=null;return}if(Math.abs(dx)<10)return;swipe.claimed=true}e.preventDefault();scrollTo(swipe.scroll-dx/windowElement.clientWidth*PRODUCT_DISTANCE*innerHeight,true)};
 const up=()=>{if(swipe?.claimed){suppressClick=true;productTo(Math.round(currentProduct))}swipe=null};
 const cancelClick=e=>{if(suppressClick){suppressClick=false;e.preventDefault();e.stopImmediatePropagation()}};
 const nativeScroll=()=>{if(cinematic)return;currentProduct=collection.nativePosition();document.querySelector('.collection-current').textContent=String(Math.round(currentProduct)+1).padStart(2,'0');previous.disabled=currentProduct<.05;next.disabled=currentProduct>count-1.05};
 windowElement.addEventListener('scroll',nativeScroll,{passive:true});nativeScroll();
 previous.addEventListener('click',prevClick);next.addEventListener('click',nextClick);windowElement.addEventListener('keydown',keys);
 windowElement.addEventListener('wheel',horizontal,{passive:false});windowElement.addEventListener('pointerdown',down);windowElement.addEventListener('pointermove',move,{passive:false});windowElement.addEventListener('pointerup',up);windowElement.addEventListener('pointercancel',up);windowElement.addEventListener('click',cancelClick,true);
 const tick=time=>{
  if(document.hidden)return;lenis?.raf(time*1000);if(paused)return;
  const story=eventStory(state.progress,count),wash=washingState(state.washing);
  const handoffActive=cinematic&&document.body.classList.contains('three-ready')&&state.washing>=.9&&scrollY<event.offsetTop;
  const handoff={active:handoffActive,opacity:handoffActive?wash.handoff:1};
  document.body.classList.toggle('has-passport-handoff',handoffActive);
  document.body.style.setProperty('--handoff-copy',String(handoffActive?wash.handoffCopy:1));
  if(cinematic){
   const passportOpacity=story.passportOpacity*handoff.opacity;
   passport.style.opacity=String(passportOpacity);passport.style.visibility=passportOpacity>0?'visible':'hidden';passport.inert=passportOpacity<(handoffActive?.99:.1);
   rewards.style.opacity=String(story.rewards);rewards.style.visibility=story.rewards>0?'visible':'hidden';rewards.style.transform=`translate3d(0,${(1-story.rewards)*55}px,0)`;rewards.inert=story.rewards<.75;
   currentProduct=story.product;rewards.dataset.product=currentProduct.toFixed(3);collection.render(currentProduct);
   previous.disabled=currentProduct<.05;next.disabled=currentProduct>count-1.05;
  }
  onFrame(handoffActive?0:cinematic?story.passport:reduced?.78:Math.max(0,Math.min(1,(scrollY-event.offsetTop)/innerHeight)),time,state.washing,handoff);
 };
 gsap.ticker.add(tick);
 function refresh(){configure();lenis?.resize();ScrollTrigger.refresh()}
 document.fonts.ready.then(refresh);addEventListener('resize',refresh);addEventListener('load',refresh,{once:true});
 return {refresh,scrollTo,rewardsStart:()=>cinematic?position(REWARDS_READY/total):event.offsetTop+rewards.offsetTop,pause(value){paused=value;lenis?.scrollTo(scrollY,{immediate:true,force:true})},dispose(){gsap.ticker.remove(tick);context.revert();sectionTriggers.forEach(t=>t.kill());lenis?.destroy();removeEventListener('resize',refresh);removeEventListener('load',refresh);removeEventListener('scroll',updateHeader);header.classList.remove('is-scrolled');previous.removeEventListener('click',prevClick);next.removeEventListener('click',nextClick);windowElement.removeEventListener('keydown',keys);windowElement.removeEventListener('wheel',horizontal);windowElement.removeEventListener('pointerdown',down);windowElement.removeEventListener('pointermove',move);windowElement.removeEventListener('pointerup',up);windowElement.removeEventListener('pointercancel',up);windowElement.removeEventListener('click',cancelClick,true);windowElement.removeEventListener('scroll',nativeScroll);document.body.classList.remove('has-event-story','has-passport-handoff','has-live-passport');document.body.style.removeProperty('--handoff-copy')}};
}

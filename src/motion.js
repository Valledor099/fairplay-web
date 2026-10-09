import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {eventStory,storyDistance} from './event-story.js';
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
 const passport=document.querySelector('.passport-story'),rewards=document.querySelector('#recompensas');
 const total=storyDistance();
 let cinematic=!reduced;
 function configure(){
  cinematic=!reduced&&!document.body.classList.contains('no-webgl');
  washing.style.height=reduced?'':`${(WASHING_DISTANCE+1)*innerHeight}px`;
  document.body.classList.toggle('has-event-story',cinematic);
  event.style.height=cinematic?`${(1+total)*innerHeight}px`:'';
  if(!cinematic){passport.removeAttribute('style');passport.inert=false;passport.removeAttribute('aria-hidden');rewards.style.removeProperty('opacity');rewards.inert=false}
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
  gsap.to(state,{progress:1,ease:'none',scrollTrigger:{id:'event-story',trigger:event,start:'top top',end:'bottom bottom',scrub:.65,invalidateOnRefresh:true}});
 });
 const nav=[...document.querySelectorAll('[data-nav]')];
 const sectionTriggers=['contexto','evento','nosotros','tickets'].map(id=>ScrollTrigger.create({trigger:'#'+id,start:'top 45%',end:'bottom 45%',onToggle:self=>{if(self.isActive&&document.querySelector('#reservation-view').hidden)nav.forEach(link=>{if(link.dataset.nav===id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')})}}));
 function scrollTo(target,immediate=false,duration=1.1){const top=typeof target==='number'?target:target.getBoundingClientRect().top+scrollY;if(lenis)lenis.scrollTo(top,{immediate,duration});else window.scrollTo({top,behavior:'instant'})}
 const tick=time=>{
  if(document.hidden)return;lenis?.raf(time*1000);if(paused)return;
  const story=eventStory(state.progress),wash=washingState(state.washing);
  const handoffActive=cinematic&&document.body.classList.contains('three-ready')&&state.washing>=.9&&scrollY<event.offsetTop;
  const handoff={active:handoffActive,opacity:handoffActive?wash.handoff:1};
  document.body.classList.toggle('has-passport-handoff',handoffActive);
  document.body.style.setProperty('--handoff-copy',String(handoffActive?wash.handoffCopy:1));
  if(cinematic){
   const passportOpacity=story.passportOpacity*handoff.opacity;
   passport.style.opacity=String(passportOpacity);passport.style.visibility=passportOpacity>0?'visible':'hidden';passport.inert=passportOpacity<(handoffActive?.99:.1);
   const galleryOpacity=smooth(.93,.97,story.passport);
   rewards.style.opacity=String(galleryOpacity);rewards.inert=galleryOpacity<.75;
  }
  onFrame(handoffActive?0:cinematic?story.passport:reduced?.78:Math.max(0,Math.min(1,(scrollY-event.offsetTop)/innerHeight)),time,state.washing,handoff);
 };
 gsap.ticker.add(tick);
 function refresh(){configure();lenis?.resize();ScrollTrigger.refresh()}
 document.fonts.ready.then(refresh);addEventListener('resize',refresh);addEventListener('load',refresh,{once:true});
 return {refresh,scrollTo,rewardsStart:()=>rewards.getBoundingClientRect().top+scrollY-(cinematic?0:92),pause(value){paused=value;lenis?.scrollTo(scrollY,{immediate:true,force:true})},dispose(){gsap.ticker.remove(tick);context.revert();sectionTriggers.forEach(t=>t.kill());lenis?.destroy();removeEventListener('resize',refresh);removeEventListener('load',refresh);removeEventListener('scroll',updateHeader);header.classList.remove('is-scrolled');rewards.style.removeProperty('opacity');rewards.inert=false;document.body.classList.remove('has-event-story','has-passport-handoff','has-live-passport');document.body.style.removeProperty('--handoff-copy')}};
}

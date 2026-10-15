import {gsap} from 'gsap';
import {EVENT,eventCountdown,visitDetails} from './event-config.js';

export function createHeroEntry({reduced=false}={}){
 const panel=document.querySelector('.hero-entry'),timer=panel.querySelector('[role=timer]');
 const status=panel.querySelector('[data-countdown-status]');
 const numbers=[...panel.querySelectorAll('[data-countdown-value]')];
 let previousPhase='',previousSecond=-1;
 const context=gsap.context(()=>{
  if(!reduced)gsap.from(panel.children,{y:18,opacity:0,duration:1,delay:.35,stagger:.16,ease:'power3.out',clearProps:'transform,opacity'});
 },panel);
 context.add('animate',elements=>{
  if(!reduced&&elements.length)gsap.fromTo(elements,{y:7,opacity:.4},{y:0,opacity:1,duration:.3,ease:'power2.out',overwrite:true});
 });
 function render(){
  const now=Date.now(),second=Math.floor(now/1000);if(second===previousSecond)return;previousSecond=second;
  const countdown=eventCountdown(now),changed=[];
  for(const number of numbers){const value=String(countdown[number.dataset.countdownValue]).padStart(2,'0');if(number.textContent!==value){number.textContent=value;changed.push(number)}}
  context.animate(changed);
  timer.setAttribute('aria-label',`Faltan ${countdown.days} días, ${countdown.hours} horas, ${countdown.minutes} minutos y ${countdown.seconds} segundos para Fair Play.`);
  if(countdown.phase!==previousPhase){
   previousPhase=countdown.phase;panel.dataset.phase=countdown.phase;
   status.textContent=countdown.phase==='upcoming'?'El encuentro empieza en':countdown.phase==='today'?'Es hoy. Abierto desde las 08:00 h.':'El encuentro terminó.';
   timer.hidden=countdown.phase!=='upcoming';
   if(countdown.phase!=='upcoming')timer.setAttribute('aria-label',status.textContent);
  }
 }
 document.querySelectorAll('[data-event-date]').forEach(label=>{label.textContent=EVENT.label;label.dateTime=EVENT.date});
 const visit=visitDetails();
 document.querySelectorAll('[data-event-address]').forEach(label=>label.textContent=visit.address);
 document.querySelectorAll('[data-event-hours]').forEach(label=>label.textContent=visit.openingHours);
 render();
 return {render,dispose(){context.revert()}};
}

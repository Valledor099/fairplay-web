import {gsap} from 'gsap';
import {washingState} from './sportswashing-state.js';
import {createSportswashingCases} from './sportswashing-cases.js';

export function createSportswashingStory({reduced=false}={}){
 const section=document.querySelector('#contexto'),panels=[...section.querySelectorAll('[data-washing-panel]')];
 let previousPhase='';
 const cases=createSportswashingCases({reduced});
 const context=gsap.context(()=>{},section);
 let timeline;
 if(!reduced)context.add(()=>{
  timeline=gsap.timeline({paused:true,defaults:{ease:'none'}});
  timeline
   .fromTo('.washing-stadium img',{scale:1.06},{scale:1.3,duration:2.8},0)
   .fromTo('.washing-opening>span>span',{yPercent:105},{yPercent:0,duration:.7,stagger:.12,ease:'power3.out'},0)
   .fromTo('.washing-opening-note',{autoAlpha:0,y:20},{autoAlpha:1,y:0,duration:.5},.4)
   .to('.washing-opening,.washing-opening-note',{autoAlpha:0,y:-50,duration:.55},1.3)
   .fromTo('.washing-mechanism',{autoAlpha:0},{autoAlpha:1,duration:.3},1.45)
   .fromTo('.washing-mechanism-media img',{scale:1.03},{scale:1.15,duration:2.6},1.45)
   .fromTo('.washing-hidden-words>span',{yPercent:120,rotationX:-45},{yPercent:0,rotationX:0,duration:.6,stagger:.12,ease:'power3.out'},1.6)
   .to('.washing-intro',{autoAlpha:0,duration:.45},1.75)
   .fromTo('.washing-gloss',{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)',duration:.85,ease:'power2.inOut'},2.1)
   .fromTo('.washing-sweep',{xPercent:-105},{xPercent:105,duration:.85,ease:'power2.inOut'},2.1)
   .to('.washing-gloss',{yPercent:-115,duration:.85,ease:'power3.inOut'},3.3)
   .to('.washing-hidden-words',{autoAlpha:0,y:-60,duration:.5},3.35)
   .fromTo('.washing-explanation',{autoAlpha:1,clipPath:'inset(100% 0 0 0)'},{autoAlpha:1,clipPath:'inset(0% 0 0 0)',duration:.85,ease:'power3.inOut'},3.3)
   .fromTo('.washing-wordmark',{y:()=>innerHeight*.16,scale:1.08},{y:0,scale:1,duration:1,ease:'power3.inOut'},3.6)
   .fromTo('.washing-sport',{xPercent:-115},{xPercent:0,duration:.85,ease:'power3.out'},3.6)
   .fromTo('.washing-washing',{xPercent:115},{xPercent:0,duration:.85,ease:'power3.out'},3.72)
   .to('.washing-mechanism',{autoAlpha:0,duration:.2},4.1)
   .fromTo('.washing-definition>*',{autoAlpha:0,y:28},{autoAlpha:1,y:0,duration:.5,stagger:.14,ease:'power2.out'},4.35)
   .fromTo('.washing-cases h3,.washing-cases-list>li',{autoAlpha:0,y:24},{autoAlpha:1,y:0,duration:.55,stagger:.13,ease:'power3.out'},4.35)
   // Hold the complete definition for nearly two viewport heights.
   .to('.washing-explanation',{autoAlpha:0,y:-65,duration:.7,ease:'power2.in'},6.85)
   .fromTo('.washing-outro',{autoAlpha:0,y:55},{autoAlpha:1,y:0,duration:.6,ease:'power3.out'},7.2)
   .fromTo('.washing-outro-media img',{scale:1.14},{scale:1,duration:1.35,ease:'power2.out'},7.2)
   .to('.washing-outro',{autoAlpha:0,y:-30,duration:.55},8.05)
   .to({}, {duration:.45},8.55);
 });
 function render(value){
  if(reduced)return;
  const state=washingState(value);
  timeline.totalProgress(state.progress);
  cases.setEnabled(state.panels[1]);
  document.body.classList.toggle('washing-light-phase',state.progress>=.3&&state.progress<.375);
  if(previousPhase!==state.phase){
   previousPhase=state.phase;section.dataset.phase=state.phase;
  }
  panels.forEach((panel,i)=>{panel.inert=!state.panels[i];panel.setAttribute('aria-hidden',String(!state.panels[i]))});
 }
 render(0);
 return {render,dispose(){cases.dispose();context.revert();document.body.classList.remove('washing-light-phase');panels.forEach(panel=>{panel.inert=false;panel.removeAttribute('aria-hidden')})}};
}

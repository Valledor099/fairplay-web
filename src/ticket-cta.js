import {gsap} from 'gsap';

export function createTicketCta({reduced=false}={}){
 const controllers=[...document.querySelectorAll('.ticket-cta')].map(wrapper=>{
 const link=wrapper.querySelector('a'),papers=[...wrapper.querySelectorAll('.ticket-paper')];
 let hovered=false,focused=false,timeline;
 const compact=matchMedia('(max-width:600px)');
 const context=gsap.context(()=>{
  timeline=gsap.timeline({paused:true});
  papers.forEach((paper,index)=>{
   const centre=(papers.length-1)/2,slot=index-centre;
   timeline.fromTo(paper,{xPercent:-50,x:slot*3,y:8,rotation:slot*3,opacity:.85},
    {xPercent:-50,x:()=>slot*(compact.matches?13:18),y:-35-(centre-Math.abs(slot))*14,rotation:slot*(compact.matches?12:14),opacity:1,duration:.65,ease:'power3.out'},index*.035);
  });
 },wrapper);
 const update=()=>{const active=hovered||focused;wrapper.classList.toggle('is-open',active);if(reduced)timeline.progress(active?1:0).pause();else active?timeline.play():timeline.reverse()};
 const enter=event=>{if(event.pointerType==='touch')return;hovered=true;update()};
 const leave=()=>{hovered=false;update()};
 const focus=()=>{focused=true;update()};
 const blur=()=>{focused=false;update()};
 const resize=()=>{timeline.invalidate();update()};
 wrapper.addEventListener('pointerenter',enter);wrapper.addEventListener('pointerleave',leave);link.addEventListener('focus',focus);link.addEventListener('blur',blur);compact.addEventListener('change',resize);
 return {dispose(){wrapper.removeEventListener('pointerenter',enter);wrapper.removeEventListener('pointerleave',leave);link.removeEventListener('focus',focus);link.removeEventListener('blur',blur);compact.removeEventListener('change',resize);context.revert()}};
 });
 return {dispose(){controllers.forEach(controller=>controller.dispose())}};
}

import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// All scroll motion shares the existing Lenis/GSAP clock in motion.js.
export function createSiteChoreography({reduced=false}={}){
 const originals=[],listeners=[];
 const title=document.querySelector('#event-title');
 let collectionIntro,collectionVisible=false,lastTitle='';
 function words(element){
  const original={element,html:element.innerHTML,label:element.getAttribute('aria-label')};originals.push(original);
  const readable=element.cloneNode(true);readable.querySelectorAll('br').forEach(br=>br.replaceWith(document.createTextNode(' ')));
  element.setAttribute('aria-label',readable.textContent.replace(/\s+/g,' ').trim());
  const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT),nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(node=>{
   const fragment=document.createDocumentFragment();
   node.textContent.split(/(\s+)/).forEach(word=>{
    if(!word.trim()){fragment.append(document.createTextNode(word));return}
    const mask=document.createElement('span'),inner=document.createElement('span');
    mask.className='motion-mask';mask.setAttribute('aria-hidden','true');inner.className='motion-word';inner.textContent=word;
    mask.append(inner);fragment.append(mask);
   });node.replaceWith(fragment);
  });return element.querySelectorAll('.motion-word');
 }
 const context=gsap.context(()=>{
  if(reduced)return;
  const hero=words(document.querySelector('#hero-title'));
  gsap.fromTo(hero,{yPercent:115,rotation:5},{yPercent:0,rotation:0,duration:1.3,stagger:.12,ease:'power4.out',delay:.1});
  gsap.from('.home-link',{y:-20,opacity:0,duration:.85,ease:'power3.out'});
  document.querySelectorAll('[data-motion-heading]').forEach(heading=>{
   const targets=words(heading);
   const options={yPercent:0,rotation:0,duration:1,stagger:.055,ease:'power4.out'};
   if(heading.id==='collection-title'){
    collectionIntro=gsap.fromTo(targets,{yPercent:115,rotation:4},{...options,paused:true});
   }else{
    gsap.fromTo(targets,{yPercent:115,rotation:4},{...options,scrollTrigger:{trigger:heading,start:'top 88%',toggleActions:'play none none reverse'}});
   }
  });
  document.querySelectorAll('[data-motion-photo]').forEach(figure=>{
   const image=figure.querySelector('img'),shutter=figure.querySelector('.photo-reveal-shutter');
   gsap.set(shutter,{display:'block'});
   const reveal=gsap.timeline({scrollTrigger:{trigger:figure,start:'top 88%',toggleActions:'play none none reverse'}});
   reveal.fromTo(shutter,{scaleY:1},{scaleY:0,duration:1.15,ease:'power3.inOut'},0)
    .fromTo(image,{scale:1.2},{scale:1.08,duration:1.65,ease:'power3.out'},.05)
    .fromTo(figure.querySelector('figcaption'),{y:16,opacity:0},{y:0,opacity:1,duration:.6},.7);
   gsap.fromTo(image,{yPercent:-3},{yPercent:3,ease:'none',scrollTrigger:{trigger:figure,start:'top bottom',end:'bottom top',scrub:.8}});
   if(matchMedia('(hover:hover) and (pointer:fine)').matches){
    const move=event=>{const rect=figure.getBoundingClientRect();gsap.to(image,{xPercent:(event.clientX-rect.left)/rect.width*2-1,duration:.6,ease:'power2.out',overwrite:'auto'})};
    const leave=()=>gsap.to(image,{xPercent:0,duration:.7,ease:'power3.out',overwrite:'auto'});
    figure.addEventListener('pointermove',move);figure.addEventListener('pointerleave',leave);
    listeners.push(()=>{figure.removeEventListener('pointermove',move);figure.removeEventListener('pointerleave',leave)});
   }
  });
  gsap.from('.about-columns article',{y:40,opacity:0,duration:1,stagger:.16,ease:'power3.out',scrollTrigger:{trigger:'.about-columns',start:'top 85%',toggleActions:'play none none reverse'}});
  gsap.from('.ticket-copy>h3,.ticket-copy>p',{y:25,opacity:0,duration:.9,stagger:.1,ease:'power3.out',scrollTrigger:{trigger:'.ticket-copy',start:'top 75%',toggleActions:'play none none reverse'}});
  gsap.fromTo('.ticket-photo-note',{rotation:-8,y:35,opacity:0},{rotation:4,y:0,opacity:1,duration:1.2,ease:'back.out(1.2)',scrollTrigger:{trigger:'.ticket-visual',start:'top 65%',toggleActions:'play none none reverse'}});
  gsap.fromTo('.footer-photo',{yPercent:-8,scale:1.1},{yPercent:8,scale:1.1,ease:'none',scrollTrigger:{trigger:'footer',start:'top bottom',end:'bottom top',scrub:1}});
 });
 function render(progress,time,washingProgress,handoff){
  if(reduced)return;
  const showCollection=progress>=.99&&!handoff.active;
  if(collectionVisible!==showCollection){collectionVisible=showCollection;showCollection?collectionIntro?.play():collectionIntro?.reverse()}
  if(title&&title.textContent!==lastTitle){
   lastTitle=title.textContent;
   context.add(()=>gsap.fromTo(title,{y:12,opacity:.3},{y:0,opacity:1,duration:.65,ease:'power3.out',overwrite:'auto'}));
  }
 }
 return {render,dispose(){listeners.forEach(remove=>remove());context.revert();originals.forEach(({element,html,label})=>{element.innerHTML=html;label===null?element.removeAttribute('aria-label'):element.setAttribute('aria-label',label)})}};
}

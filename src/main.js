import './site-styles.js';
import {createPassportScene} from './scene.js';
import {initMotion} from './motion.js';
import {initBooking} from './booking.js';
import {createHeroReveal} from './hero-reveal.js';
import {initCollection} from './collection.js';
import {createSportswashingStory} from './sportswashing-story.js';
import {createSiteChoreography} from './site-choreography.js';
import {createHeroEntry} from './hero-entry.js';
import {createTicketCta} from './ticket-cta.js';
import {initSiteMenu,setActiveSection} from './site-menu.js';
const siteMenu=initSiteMenu();
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(reduced)document.body.classList.add('is-reduced');
const landing=document.querySelector('#contenido'),reservation=document.querySelector('#reservation-view');
let experience,booking,washing,choreography;
const heroReveal=createHeroReveal({reduced});
const heroEntry=createHeroEntry({reduced});
const collection=initCollection();
const motion=initMotion({reduced,collection,onFrame:(progress,time,washingProgress,handoff)=>{heroReveal.render();heroEntry.render();experience?.render(progress,time,handoff);washing?.render(washingProgress);choreography?.render(progress,time,washingProgress,handoff)}});
washing=createSportswashingStory({reduced});
choreography=createSiteChoreography({reduced});
const ticketCta=createTicketCta({reduced});
function navigate(hash,{immediate=false}={}){
 const wasReservation=!reservation.hidden;
 if(wasReservation)booking?.save();
 if(location.hash!==hash)history.pushState(null,'',hash);
 const isReservation=['#entradas','#revision','#confirmacion'].includes(hash);
 landing.hidden=isReservation;reservation.hidden=!isReservation;motion.pause(isReservation);
 if(isReservation){window.scrollTo(0,0);booking.show(hash);setActiveSection('tickets')}
 else{
  motion.refresh();
  let section;try{section=document.querySelector(hash||'#inicio')}catch{section=null}
  const target=hash==='#recompensas'?motion.rewardsStart():(section||landing);
  motion.scrollTo(target,immediate||wasReservation);
  setActiveSection(section?.closest('section')?.id||section?.id||'inicio');
  const focus=section?.querySelector('h1,h2')||section||document.querySelector('#hero-title');
  focus.setAttribute('tabindex','-1');focus.focus({preventScroll:true});
 }
}
const openPassport=document.querySelector('[data-open-passport]');
const openPreview=()=>{
 const section=document.querySelector('#evento');
 motion.scrollTo(section.offsetTop+(reduced||document.body.classList.contains('no-webgl')?0:.34*(section.offsetHeight-innerHeight)),reduced);
};
openPassport.addEventListener('click',openPreview);
booking=initBooking({navigate});
const links=event=>{const anchor=event.target.closest('a[href^="#"]');if(!anchor||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();navigate(anchor.getAttribute('href'))};
document.addEventListener('click',links);
const disclosureChange=event=>{if(event.target.matches('.reward-conditions details'))motion.refresh()};
document.addEventListener('toggle',disclosureChange,true);
const historyChange=()=>navigate(location.hash||'#inicio',{immediate:true});addEventListener('popstate',historyChange);addEventListener('hashchange',historyChange);
const sceneReady=createPassportScene({reduced}).then(value=>{experience=value;motion.refresh()}).catch(error=>{console.error(error);document.body.classList.add('no-webgl');document.querySelector('#model-loading').textContent='El pasaporte físico te espera en el evento.';motion.refresh()});
if(location.hash)historyChange();
addEventListener('pagehide',()=>{openPassport.removeEventListener('click',openPreview);ticketCta.dispose();heroEntry.dispose();siteMenu.dispose();choreography.dispose();motion.dispose();booking.dispose();experience?.dispose();washing.dispose();heroReveal.dispose();collection.dispose();document.removeEventListener('click',links);document.removeEventListener('toggle',disclosureChange,true);removeEventListener('popstate',historyChange);removeEventListener('hashchange',historyChange)},{once:true});

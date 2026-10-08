import {fanCard} from './collection-fan.js';

export function initCollection(){
 const cards=[...document.querySelectorAll('[data-product-photo]')],cleanups=[],hoverEnabled=matchMedia('(hover: hover) and (min-width: 601px)');
 const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.querySelector('.worn-shot').loading='eager';observer.unobserve(entry.target)}},{rootMargin:'500px'});
 for(const button of cards){
  const product=button.querySelector('.catalog-shot'),worn=button.querySelector('.worn-shot'),label=button.querySelector('[data-photo-label]');
  let hovered=false,focused=false,manual=null;
  const intended=()=>manual??(hovered||focused);
  const update=()=>{const active=intended()&&worn.complete&&worn.naturalWidth>0;button.dataset.preview=String(active);button.setAttribute('aria-pressed',String(active));button.setAttribute('aria-label',(active?'Ver producto: ':'Ver en uso: ')+button.dataset.name);product.setAttribute('aria-hidden',String(active));worn.setAttribute('aria-hidden',String(!active));label.textContent=active?'Ver producto':'Ver en uso'};
  const enter=e=>{if(e.pointerType==='mouse'&&hoverEnabled.matches&&button.tabIndex!==-1){hovered=true;manual=null;update()}};
  const leave=e=>{if(e.pointerType==='mouse'&&hoverEnabled.matches){hovered=false;manual=null;update()}};
  const focus=()=>{focused=button.matches(':focus-visible');update()};
  const blur=()=>{focused=false;manual=null;update()};
  const click=()=>{manual=!intended();update()};
  const handlers={pointerenter:enter,pointerleave:leave,focus,blur,click};
  for(const [event,handler] of Object.entries(handlers))button.addEventListener(event,handler);
  worn.addEventListener('load',update);observer.observe(button);update();
  cleanups.push(()=>{for(const [event,handler] of Object.entries(handlers))button.removeEventListener(event,handler);worn.removeEventListener('load',update)});
 }
 const articles=cards.map(button=>button.closest('.collection-card'));
 const viewport=document.querySelector('.collection-window'),track=document.querySelector('.collection-grid');
 let stride=1,lastIndex=-1,lastPosition=NaN;
 function resize(){
  const cinematic=document.body.classList.contains('has-event-story');
  if(cinematic){
   const mobile=innerWidth<701,step=mobile?2.3:6,spacing=mobile?2.5:8;
   // Fit actual transformed corners, rather than a symmetric empty safety box.
   let horizontalExtent=.5,top=-2/3,bottom=2/3;
   for(let distance=0;distance<=cards.length-1;distance+=.02){
    const focus=fanCard(distance,0,cards.length,step,spacing),angle=focus.angle*Math.PI/180;
    const centreY=focus.y/100*4/3+2/3*(1-Math.cos(angle));
    const halfHeight=.5*Math.sin(angle)+2/3*Math.cos(angle);
    horizontalExtent=Math.max(horizontalExtent,focus.x/100+4/3*Math.sin(angle)+.5*Math.cos(angle));
    top=Math.min(top,centreY-halfHeight);bottom=Math.max(bottom,centreY+halfHeight);
   }
   const horizontal=(viewport.clientWidth/2-12)/horizontalExtent;
   const vertical=(viewport.clientHeight-16)/(bottom-top);
   const width=Math.max(70,Math.min(horizontal,vertical,mobile?290:520));
   viewport.style.setProperty('--collection-card-width',`${width}px`);
   viewport.style.setProperty('--collection-card-top',`${(viewport.clientHeight-(top+bottom)*width)/2}px`);
  }else viewport.style.removeProperty('--collection-card-width');
  stride=Math.max(1,articles.length>1?articles[1].offsetLeft-articles[0].offsetLeft:articles[0].offsetWidth);lastPosition=NaN;
 }
 resize();
 return {resize,nativePosition:()=>Math.max(0,Math.min(cards.length-1,viewport.scrollLeft/stride)),scrollTo(index,reduced){viewport.scrollTo({left:index*stride,behavior:reduced?'instant':'smooth'})},render(position){
  if(position===lastPosition)return;lastPosition=position;
  track.style.removeProperty('transform');
  const current=Math.round(position);
  articles.forEach((article,i)=>{
   const focus=fanCard(i,position,cards.length,innerWidth<701?2.3:6,innerWidth<701?2.5:8);
   article.style.filter=`blur(${focus.blur.toFixed(2)}px)`;
   article.style.transform=`translate(-50%,-50%) translate(${focus.x.toFixed(2)}%,${focus.y.toFixed(2)}%) rotate(${focus.angle.toFixed(2)}deg) scale(${focus.scale.toFixed(3)})`;
   article.style.opacity=String(focus.opacity);
   article.style.zIndex=String(focus.z);article.style.visibility=focus.opacity>.001?'visible':'hidden';
   article.inert=i!==current;
   cards[i].tabIndex=i===current?0:-1;
   article.dataset.focused=String(i===current);
  });
  if(current!==lastIndex){lastIndex=current;document.querySelector('.collection-current').textContent=String(current+1).padStart(2,'0');cards[current].querySelectorAll('img').forEach(img=>img.loading='eager')}
 },reset(){lastPosition=NaN;track.style.removeProperty('transform');articles.forEach((article,i)=>{for(const property of ['filter','transform','opacity','z-index','visibility'])article.style.removeProperty(property);article.inert=false;cards[i].tabIndex=0})},dispose(){observer.disconnect();cleanups.forEach(clean=>clean())}};
}

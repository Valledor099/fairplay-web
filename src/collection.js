
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
 const viewport=document.querySelector('.collection-window');
 const previous=document.querySelector('[data-collection-prev]'),next=document.querySelector('[data-collection-next]');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let lastWheel=0;
 const targetLeft=index=>articles[index].offsetLeft+articles[index].offsetWidth/2-viewport.clientWidth/2;
 function currentIndex(){
  let current=0,distance=Infinity;
  articles.forEach((article,i)=>{const gap=Math.abs(targetLeft(i)-viewport.scrollLeft);if(gap<distance){distance=gap;current=i}});
  return current;
 }
 function updatePosition(){
  const current=currentIndex();
  document.querySelector('.collection-current').textContent=String(current+1).padStart(2,'0');
  viewport.closest('#recompensas').dataset.product=String(current);
  previous.disabled=current===0;next.disabled=current===cards.length-1;
  articles.forEach((article,i)=>{article.dataset.focused=String(i===current)});
  cards[current].querySelectorAll('img').forEach(img=>img.loading='eager');
 }
 function resize(){
  const current=currentIndex();
  viewport.style.setProperty('--collection-edge',Math.max(12,(viewport.clientWidth-articles[0].offsetWidth)/2)+'px');
  viewport.scrollTo({left:targetLeft(current),behavior:'instant'});updatePosition();
 }
 function scrollTo(index,immediate=reduced.matches){
  viewport.scrollTo({left:targetLeft(Math.max(0,Math.min(cards.length-1,index))),behavior:immediate?'instant':'smooth'});
 }
 const prevClick=()=>scrollTo(currentIndex()-1),nextClick=()=>scrollTo(currentIndex()+1);
 const keys=event=>{
  if(event.ctrlKey||event.metaKey||event.altKey||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();scrollTo(event.key==='Home'?0:event.key==='End'?cards.length-1:currentIndex()+(event.key==='ArrowRight'?1:-1));
 };
 const wheel=event=>{
  if(event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY)||Math.abs(event.deltaY)<2)return;
  const direction=Math.sign(event.deltaY),atEdge=direction<0?viewport.scrollLeft<=1:viewport.scrollLeft>=viewport.scrollWidth-viewport.clientWidth-1;
  if(atEdge)return;
  event.preventDefault();
  if(performance.now()-lastWheel<450)return;
  lastWheel=performance.now();scrollTo(currentIndex()+direction);
 };
 viewport.addEventListener('scroll',updatePosition,{passive:true});viewport.addEventListener('keydown',keys);viewport.addEventListener('wheel',wheel,{passive:false});
 previous.addEventListener('click',prevClick);next.addEventListener('click',nextClick);
 const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(viewport);resizeObserver.observe(articles[0]);
 resize();
 return {resize,scrollTo,nativePosition:currentIndex,dispose(){observer.disconnect();resizeObserver.disconnect();cleanups.forEach(clean=>clean());viewport.removeEventListener('scroll',updatePosition);viewport.removeEventListener('keydown',keys);viewport.removeEventListener('wheel',wheel);previous.removeEventListener('click',prevClick);next.removeEventListener('click',nextClick)}};
}

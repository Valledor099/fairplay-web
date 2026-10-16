
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
 let selectedIndex=0,pendingIndex=null,wheelTarget=null,settleTimer,drag=null,suppressClick=false,lastWidth=0,lastCardWidth=0;
 const targetLeft=index=>articles[index].offsetLeft+articles[index].offsetWidth/2-viewport.clientWidth/2;
 function currentIndex(){
  let current=0,distance=Infinity;
  articles.forEach((article,i)=>{const gap=Math.abs(targetLeft(i)-viewport.scrollLeft);if(gap<distance){distance=gap;current=i}});
  return current;
 }
 function updatePosition(){
  if(!viewport.clientWidth)return;
  const current=currentIndex();
  selectedIndex=current;
  document.querySelector('.collection-current').textContent=String(current+1);
  viewport.closest('#recompensas').dataset.product=String(current);
  previous.disabled=(pendingIndex??current)===0;next.disabled=(pendingIndex??current)===cards.length-1;
  articles.forEach((article,i)=>{article.dataset.focused=String(i===current)});
  cards[current].querySelectorAll('img').forEach(img=>img.loading='eager');
 }
 function resize(){
  if(!viewport.clientWidth)return;
  const width=viewport.clientWidth,cardWidth=articles[0].offsetWidth;
  if(width===lastWidth&&cardWidth===lastCardWidth)return;
  lastWidth=width;lastCardWidth=cardWidth;pendingIndex=null;wheelTarget=null;
  viewport.style.setProperty('--collection-edge',Math.max(12,(viewport.clientWidth-articles[0].offsetWidth)/2)+'px');
  viewport.scrollTo({left:targetLeft(selectedIndex),behavior:'instant'});updatePosition();
 }
 function scrollTo(index,immediate=reduced.matches){
  wheelTarget=null;
  pendingIndex=Math.max(0,Math.min(cards.length-1,index));
  viewport.scrollTo({left:targetLeft(pendingIndex),behavior:immediate?'instant':'smooth'});
  updatePosition();scheduleSettle();
 }
 const prevClick=()=>scrollTo((pendingIndex??currentIndex())-1),nextClick=()=>scrollTo((pendingIndex??currentIndex())+1);
 const keys=event=>{
  if(event.ctrlKey||event.metaKey||event.altKey||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();scrollTo(event.key==='Home'?0:event.key==='End'?cards.length-1:(pendingIndex??currentIndex())+(event.key==='ArrowRight'?1:-1));
 };
 function settle(){clearTimeout(settleTimer);pendingIndex=null;wheelTarget=null;updatePosition()}
 function scheduleSettle(){clearTimeout(settleTimer);settleTimer=setTimeout(settle,180)}
 const onScroll=()=>{updatePosition();scheduleSettle()};
 // Convert the mouse wheel to continuous horizontal movement, releasing the page at either end.
 const wheel=event=>{
  if(event.ctrlKey||event.defaultPrevented)return;
  pendingIndex=null;
  if(Math.abs(event.deltaX)>Math.abs(event.deltaY)){wheelTarget=null;return}
  const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?viewport.clientWidth:1);
  if(!delta)return;
  const max=viewport.scrollWidth-viewport.clientWidth;
  if(delta<0&&viewport.scrollLeft<=1||delta>0&&viewport.scrollLeft>=max-1){wheelTarget=null;return}
  event.preventDefault();event.stopPropagation();
  wheelTarget=Math.max(0,Math.min(max,(wheelTarget??viewport.scrollLeft)+delta));
  viewport.scrollTo({left:wheelTarget,behavior:reduced.matches?'instant':'smooth'});
  scheduleSettle();
 };
 const pointerDown=event=>{
  pendingIndex=null;wheelTarget=null;
  if(event.pointerType!=='mouse'||event.button!==0)return;
  suppressClick=false;
  drag={id:event.pointerId,x:event.clientX,y:event.clientY,left:viewport.scrollLeft,active:false};
 };
 const pointerMove=event=>{
  if(!drag||event.pointerId!==drag.id)return;
  const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
  if(!drag.active){
   if(Math.abs(dx)<6)return;
   if(Math.abs(dy)>Math.abs(dx)){drag=null;return}
   drag.active=true;suppressClick=true;viewport.classList.add('is-dragging');
   viewport.setPointerCapture(event.pointerId);
   viewport.scrollTo({left:drag.left,behavior:'instant'});
  }
  event.preventDefault();viewport.scrollLeft=drag.left-dx;
 };
 const pointerEnd=event=>{
  if(!drag||event.pointerId!==drag.id)return;
  const moved=drag.active;drag=null;
  if(viewport.hasPointerCapture(event.pointerId))viewport.releasePointerCapture(event.pointerId);
  viewport.classList.remove('is-dragging');
  if(moved)scrollTo(currentIndex());
 };
 const preventDragClick=event=>{if(suppressClick){event.preventDefault();event.stopImmediatePropagation();suppressClick=false}};
 const handlers={scroll:onScroll,scrollend:settle,keydown:keys,pointerdown:pointerDown,pointermove:pointerMove,pointerup:pointerEnd,pointercancel:pointerEnd,lostpointercapture:pointerEnd};
 for(const [event,handler] of Object.entries(handlers))viewport.addEventListener(event,handler);
 viewport.addEventListener('wheel',wheel,{passive:false});
 viewport.addEventListener('click',preventDragClick,true);
 previous.addEventListener('click',prevClick);next.addEventListener('click',nextClick);
 const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(viewport);resizeObserver.observe(articles[0]);
 resize();
 return {resize,scrollTo,nativePosition:currentIndex,dispose(){clearTimeout(settleTimer);observer.disconnect();resizeObserver.disconnect();cleanups.forEach(clean=>clean());for(const [event,handler] of Object.entries(handlers))viewport.removeEventListener(event,handler);viewport.removeEventListener('wheel',wheel);viewport.removeEventListener('click',preventDragClick,true);viewport.classList.remove('is-dragging');previous.removeEventListener('click',prevClick);next.removeEventListener('click',nextClick)}};
}

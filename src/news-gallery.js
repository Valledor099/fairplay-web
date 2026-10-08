import {newsGalleryState,magazineLayout} from './news-gallery-state.js';
const alpha=(element,value)=>{element.style.opacity=String(value);element.style.visibility=value>.001?'visible':'hidden'};

export function createNewsGallery(section){
 const world=section.querySelector('.magazine-world'),space=section.querySelector('.news-gallery-space');
 const frame=section.querySelector('.sportswashing-panel'),track=section.querySelector('.news-gallery-cases');
 const cases=[...section.querySelectorAll('[data-news-case]')];
 const backgroundStories=[...section.querySelectorAll('[data-background-story]')];
 const haze=section.querySelector('.newspaper-reading-haze');
 const invitation=section.querySelector('.newspaper-event-invitation'),endNote=section.querySelector('.newspaper-end-note');
 const pages=[frame,...cases,invitation];
 const photo=invitation.querySelector('.event-news-passport img'),copy=invitation.querySelector('.event-news-copy'),caption=invitation.querySelector('figcaption'),holder=document.querySelector('#passport-scene');
 let photoMetrics=null,metricsKey='';
 function render(progress){
  if(document.body.classList.contains('victory-static')){
   for(const el of [world,space,track,frame,...pages,endNote]){el.style.cssText='';el.inert=false;el.removeAttribute('aria-hidden')}
   haze.style.cssText='';
   photo.style.opacity='';copy.style.opacity='';caption.style.opacity='';copy.inert=false;copy.removeAttribute('aria-hidden');
   return;
  }
  const s=newsGalleryState(progress),w=section.clientWidth,h=innerHeight,preview=holder.dataset.previewBounds?JSON.parse(holder.dataset.previewBounds):null,key=`${w}:${h}:${photo.naturalWidth}:${photo.naturalHeight}`;
  if(!preview){s.eventZoom=0;s.handoff=0;s.paperOpacity=1}
  if(key!==metricsKey)photoMetrics=null;
  const layout=magazineLayout(s,w,h,preview,photoMetrics),pw=layout.paperWidth,ph=layout.paperHeight;
  world.style.width=`${pw}px`;world.style.height=`${ph}px`;
  world.style.transform=`translate3d(${layout.x*w}px,${layout.y*h}px,0) scale(${layout.scale})`;
  world.style.setProperty('--magazine-reveal',s.chrome);world.style.setProperty('--page-width',`${pw}px`);world.style.setProperty('--page-height',`${ph}px`);
  world.style.setProperty('--sheet-length',layout.geometry.height);world.style.setProperty('--publication-visible',s.chrome);
  alpha(space,s.space);
  world.style.opacity=String(s.paperOpacity);
  photo.style.opacity=String(1-s.handoff);copy.style.opacity=String(1-s.eventZoom*.9);caption.style.opacity=String(1-s.eventZoom);
  copy.inert=s.eventZoom>.8;copy.setAttribute('aria-hidden',s.eventZoom>.8?'true':'false');
  alpha(haze,layout.gaze.opacity);
  haze.style.setProperty('--reading-x',`${layout.gaze.x*100}%`);
  haze.style.setProperty('--reading-y',`${layout.gaze.y*100}%`);
  haze.style.setProperty('--reading-radius',`${layout.gaze.radius}px`);
  pages.forEach((el,index)=>{
   const p=layout.pages[index];
   el.style.left=`${p.source.left*pw}px`;el.style.top=`${p.source.top*ph}px`;
   el.style.width=`${index===0?w:p.source.width*pw}px`;el.style.height=`${index===0?h:p.source.height*ph}px`;
   el.style.transform=index===0?`scale(${layout.leadScale})`:'none';el.style.transformOrigin='0 0';el.style.filter=`blur(${(3*(1-p.focus)).toFixed(3)}px)`;
   if(index!==0)alpha(el,s.retreat);
   el.inert=index===0?s.victory<1||s.camera>.35:!p.readable;
   el.setAttribute('aria-hidden',(index===0?s.victory<.7:s.retreat<.9)?'true':'false');
  });
  backgroundStories.forEach((el,index)=>{
   const r=layout.geometry.backgrounds[index];
   el.style.left=`${r.left*pw}px`;el.style.top=`${r.top*ph}px`;el.style.width=`${r.width*pw}px`;el.style.height=`${r.height*ph}px`;
  });
  track.style.transform='none';alpha(track,1);
  // Measure only when the viewport or snapshot changes; include the paper's borders.
  if(preview&&photo.complete&&photo.naturalWidth&&key!==metricsKey){
   const r=photo.getBoundingClientRect(),paper=world.getBoundingClientRect(),scale=layout.scale,aspect=photo.naturalWidth/photo.naturalHeight;
   const height=Math.min(r.height,r.width/aspect),width=height*aspect;
   invitation.style.setProperty('--passport-photo-height',`${height/scale}px`);
   photoMetrics={left:(r.left+(r.width-width)/2-paper.left)/scale,top:(r.top+(r.height-height)/2-paper.top)/scale,width:width/scale,height:height/scale};metricsKey=key;
  }
  alpha(endNote,s.eventHint);endNote.setAttribute('aria-hidden',s.eventHint<.8?'true':'false');
  section.dataset.storyPhase=s.phase;section.dataset.storyDistance=s.distance.toFixed(3);
  section.dataset.magazineCamera=s.camera.toFixed(3);
 }
 return {render};
}

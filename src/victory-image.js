import {clamp} from './passport-model.js';
import {createSportswashingTransition} from './sportswashing-transition.js';
import {newsGalleryState} from './news-gallery-state.js';
import {createNewsGallery} from './news-gallery.js';

export function createVictoryImage({reduced=false,onLayout=()=>{}}={}){
 const section=document.querySelector('#celebracion'),image=section.querySelector('.victory-photo'),loading=section.querySelector('.victory-loading');
 const transition=createSportswashingTransition();
 const gallery=createNewsGallery(section);
 let disposed=false;
 const update=p=>{transition.render(newsGalleryState(p).victory);gallery.render(p)};
 const fallback=()=>{document.body.classList.add('victory-static');loading.textContent='';onLayout();transition.resize();update(1)};
 const loaded=()=>{if(disposed)return;section.dataset.loaded='true';loading.textContent='';transition.resize();update(section.dataset.progress||0)};
 const resize=()=>{transition.resize();update(section.dataset.progress||0)};
 image.addEventListener('load',loaded);image.addEventListener('error',fallback);
 addEventListener('resize',resize);document.fonts.ready.then(()=>{if(!disposed)resize()});
 if(reduced)fallback();else if(image.complete&&image.naturalWidth)loaded();
 return {
  render(next){if(reduced)return;const p=clamp(next);section.dataset.progress=p.toFixed(3);update(p)},
  dispose(){disposed=true;removeEventListener('resize',resize);image.removeEventListener('load',loaded);image.removeEventListener('error',fallback)},
 };
}

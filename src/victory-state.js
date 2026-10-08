import {clamp,smooth} from './passport-model.js';

export const PLATE_IMAGE={width:1672,height:941,x:790/1672,y:131/941,letterWidth:80/1672,letterHeight:62/941};
const mix=(a,b,p)=>a+(b-a)*p;

// Every position derives from scroll, including the return to the original photo.
export function victoryState(progress){
 const p=clamp(progress),approach=clamp(p/.46);
 return {
  progress:p,approach,
  firstText:smooth(.1,.24,approach)*(1-smooth(.48,.61,approach)),
  question:smooth(.69,.84,approach)*(1-smooth(.47,.53,p)),
  firstLines:[0,1].map(i=>smooth(.1+i*.045,.24+i*.045,approach)*(1-smooth(.48,.61,approach))),
  questionLines:[0,1].map(i=>smooth(.69+i*.035,.84+i*.035,approach)*(1-smooth(.47,.53,p))),
  cue:1-smooth(.02,.1,approach),
  focus:smooth(.46,.66,p),
  inscription:smooth(.48,.55,p),
  letters:smooth(.70,.82,p),
  pullback:smooth(.70,.84,p),
  center:smooth(.79,.85,p),
  travel:smooth(.86,.94,p),
  strokes:Array.from({length:8},(_,i)=>smooth(.61+i*.012,.72+i*.012,p)),
  copy:Array.from({length:4},(_,i)=>smooth(.925+i*.012,.96+i*.012,p)),
 };
}

// Photo and vector inscription use this same camera projection. No shot switch.
export function victoryCamera(width,height,state){
 const mobile=width<701,im=PLATE_IMAGE;
 const fit=Math.max(width/im.width,height/im.height),baseHeight=im.height*fit;
 const zoom=mix(1,mobile?1.25:1.16,smooth(0,1,state.approach))*mix(1,mobile?2.1:2.65,state.focus);
 const w=im.width*fit*zoom,h=im.height*fit*zoom;
 const x=mix((width-w)/2,width/2-im.x*w,state.focus);
 // Cover the viewport while keeping the raised trophy in view during approach.
 const y=mix((height-baseHeight)/2-(h-baseHeight)*im.y,height*.42-im.y*h,state.focus);
 return {x,y,width:w,height:h,letterX:x+im.x*w,letterY:y+im.y*h,letterWidth:im.letterWidth*w,letterHeight:im.letterHeight*h};
}

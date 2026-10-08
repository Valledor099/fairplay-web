import {clamp,smooth} from './passport-model.js';

export const STORY_DISTANCE=23;
export const STORY_VIEWPORTS=STORY_DISTANCE+1;
export const INFORMATION_AT=8.2/STORY_DISTANCE;
const mix=(a,b,p)=>a+(b-a)*p;

// One large portrait sheet; the original mural is its lead, without a replacement.
export function publicationGeometry(width){
 const articles=[
  [.055,.16,.89,.32],[.665,.515,.28,.24],[.055,.515,.28,.24],[.36,.66,.28,.19],[.055,.87,.89,.23],
 ];
 const backgrounds=[
  [.36,.515,.13,.082],[.51,.515,.13,.082],[.36,.61,.13,.04],[.51,.61,.13,.04],
  [.055,.767,.13,.03],[.205,.767,.13,.03],[.055,.81,.13,.04],[.205,.81,.13,.04],
  [.665,.767,.13,.03],[.815,.767,.13,.03],[.665,.81,.13,.04],[.815,.81,.13,.04],
  [.055,.491,.43,.012],[.515,.491,.43,.012],
 ];
 const rect=([left,top,width,height])=>({left,top,width,height,center:top+height/2});
 return {articles:articles.map(rect),backgrounds:backgrounds.map(rect),height:1.13};
}

export function magazineLayout(state,width,height=width<701?844:720,preview=null,photoMetrics=null){
 const geometry=publicationGeometry(width);
 const index=Math.min(3,Math.floor(state.camera)),fraction=state.camera-index;
 const start=geometry.articles[index],end=geometry.articles[index+1],ease=smooth(0,1,fraction);
 const paperWidth=Math.min(width*.94,1180),paperFraction=paperWidth/width;
 const lead=geometry.articles[0],leadScale=lead.width*paperWidth/width;
 const paperHeight=leadScale*height/lead.height;
 const targetCenter=mix(start.center,end.center,ease)*paperHeight;
 const focusHeights=[.58,.5,.46,.54,.57],eyeY=mix(focusHeights[index],focusHeights[index+1],ease);
 const mastheadHeight=paperWidth*.94*450/3758+(width<701?28:44);
 const leadReadingTop=Math.max(height*.16,mastheadHeight+80);
 const readingY=mix(leadReadingTop-lead.top*paperHeight,height*eyeY-targetCenter,smooth(0,.85,state.camera));
 const closeScale=1/leadScale;
 let scale=mix(closeScale,1,state.retreat),x=mix(-lead.left*paperFraction*closeScale,(1-paperFraction)/2,state.retreat),y=mix(-lead.top*paperHeight*closeScale,readingY,state.retreat)/height;
 const target=preview||{left:width<601?.28:.56,top:.22,width:width<601?.44:.29,height:.52};
 const event=geometry.articles[4],figure={left:(event.left+event.width*.68)*paperWidth,top:(event.top+event.height*.15)*paperHeight,width:event.width*.30*paperWidth,height:event.height*.48*paperHeight};
 const aspect=target.width*width/(target.height*height),photoHeight=Math.min(figure.height,figure.width/aspect),photoWidth=photoHeight*aspect;
 const photo=photoMetrics||{left:figure.left+(figure.width-photoWidth)/2,top:figure.top+(figure.height-photoHeight)/2,width:photoWidth,height:photoHeight};
 const zoom=target.width*width/photo.width;
 scale=mix(scale,zoom,state.eventZoom);x=mix(x,(target.left*width-photo.left*zoom)/width,state.eventZoom);y=mix(y,(target.top*height-photo.top*zoom)/height,state.eventZoom);
 const photoScreen={left:x+photo.left*scale/width,top:y+photo.top*scale/height,width:photo.width*scale/width,height:photo.height*scale/height};
 const gaze={x:x+mix(start.left+start.width/2,end.left+end.width/2,ease)*paperFraction*scale,y:y+targetCenter*scale/height,radius:Math.min(height*.45,width<701?310:330),opacity:state.chrome*smooth(0,.35,state.camera)*(1-smooth(3.5,4,state.camera))};
 return {scale,x,y,paperWidth,paperHeight,leadScale,geometry,gaze,photo:photoScreen,target,pages:geometry.articles.map((source,index)=>{
  const top=y+source.top*paperHeight*scale/height,left=x+source.left*paperFraction*scale,pageHeight=source.height*paperHeight*scale/height;
  const visibleHeight=Math.max(0,Math.min(1,top+pageHeight)-Math.max(0,top));
  const focus=1-smooth(.05,.90,Math.abs(state.camera-index));
  return {index,source,left,top,width:source.width*paperFraction*scale,height:pageHeight,focus,visible:visibleHeight>0,readable:state.retreat>.9&&focus>.7};
 })};
}

export function newsGalleryState(progress){
 const distance=clamp(progress)*STORY_DISTANCE;
 return {
  distance,victory:clamp(distance/8),
  retreat:smooth(9,10.6,distance),
  camera:4*clamp((distance-10.6)/8.1),
  space:smooth(8.9,9.6,distance),chrome:smooth(9.2,10.4,distance),
  eventHint:smooth(21.5,22.3,distance),
  eventZoom:smooth(19.3,21.5,distance),handoff:smooth(21.5,22.8,distance),paperOpacity:1-smooth(22,22.8,distance),
  phase:distance<9?'sportswashing':distance<10.6?'magazine-retreat':distance<18.7?'magazine-news':distance<19.3?'event-news':distance<21.5?'event-zoom':'passport-handoff',
 };
}

import {clamp,smooth} from './passport-model.js';

// Distances in viewport heights preserve the passport's existing scroll speed.
export const PASSPORT_DISTANCE=3.2,REWARDS_START=PASSPORT_DISTANCE*.93,REWARDS_READY=PASSPORT_DISTANCE+.6,PRODUCT_DISTANCE=.9;
export const storyDistance=(count=6)=>REWARDS_READY+Math.max(0,count-1)*PRODUCT_DISTANCE+.65;
export const productDistance=index=>REWARDS_READY+index*PRODUCT_DISTANCE;
export function eventStory(progress,count=6){
 const distance=clamp(progress)*storyDistance(count);
 return {passport:clamp(distance/PASSPORT_DISTANCE),passportOpacity:1-smooth(REWARDS_START,PASSPORT_DISTANCE,distance),rewards:smooth(PASSPORT_DISTANCE-.12,REWARDS_READY,distance),product:clamp((distance-REWARDS_READY)/PRODUCT_DISTANCE,0,count-1)};
}
export function productFocus(distance){
 const d=Math.abs(distance),depth=clamp(d/2);
 return {blur:9*smooth(.12,1.8,d),scale:1-.12*depth,opacity:1-.6*depth,y:24*depth};
}

import {clamp,smooth} from './passport-model.js';

// Las recompensas se recorren de forma independiente con scroll horizontal.
export const PASSPORT_DISTANCE=3.2,REWARDS_START=PASSPORT_DISTANCE*.93;
export const storyDistance=()=>PASSPORT_DISTANCE;
export function eventStory(progress){
 const passport=clamp(progress);
 return {passport,passportOpacity:1-smooth(REWARDS_START,PASSPORT_DISTANCE,passport*PASSPORT_DISTANCE)};
}

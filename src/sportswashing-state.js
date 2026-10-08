import {clamp,smooth} from './passport-model.js';

// One reversible scroll clock: spectacle, concealment, definition, passport.
export const WASHING_DISTANCE=6.4;
export function washingState(progress){
 const p=clamp(progress);
 return {
  progress:p,
  phase:p<.2?'spectacle':p<.43?'concealment':p<.84?'definition':'passport',
  handoff:smooth(.90,.995,p),
  handoffCopy:smooth(.96,1,p),
  panels:[p<.23,p>=.43&&p<.85,p>=.85&&p<.97],
 };
}

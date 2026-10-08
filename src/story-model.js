import {clamp} from './passport-model.js';
export function boundedDrag(start,dx,dy){return {x:clamp(start.x+dy*.004,-.22,.22),y:clamp(start.y+dx*.004,-.40,.40)}}

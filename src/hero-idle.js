export const IDLE_DELAY=5,DEMO_DURATION=2.8,DEMO_REST=10;

const smooth=(a,b,value)=>{const t=Math.max(0,Math.min(1,(value-a)/(b-a)));return t*t*(3-2*t)};

// One quick blade stroke, followed by a short reveal and a gradual closing.
export function idleSlash(phase){
 if(phase===null||phase<=0||phase>=1)return {length:0,width:0};
 return {length:smooth(0,.15,phase),width:smooth(.025,.19,phase)*(1-smooth(.55,.96,phase))};
}

// Sampled by the existing animation ticker; no background timer or extra render loop.
export function createIdleReveal(now=0){
 let next=now+IDLE_DELAY,start=null;
 function reset(time){next=time+IDLE_DELAY;start=null}
 return {reset,sample(time,enabled=true){
  if(!enabled){reset(time);return null}
  if(start===null){if(time<next)return null;start=time}
  const phase=(time-start)/DEMO_DURATION;
  if(phase>=1){start=null;next=time+DEMO_REST;return null}
  return phase;
 }};
}

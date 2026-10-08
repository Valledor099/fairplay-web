export const referenceQuads={cover:[[73,304],[504,223],[618,834],[171,912]],left:[[627,158],[1046,196],[1001,791],[608,746]],right:[[1046,196],[1458,221],[1430,823],[1001,791]]};
export const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
export function homography(points){
 const square=[[0,0],[1,0],[1,1],[0,1]],rows=[];
 square.forEach(([u,v],i)=>{const [x,y]=points[i];rows.push([u,v,1,0,0,0,-u*x,-v*x,x]);rows.push([0,0,0,u,v,1,-u*y,-v*y,y])});
 for(let col=0;col<8;col++){let best=col;for(let row=col+1;row<8;row++)if(Math.abs(rows[row][col])>Math.abs(rows[best][col]))best=row;[rows[col],rows[best]]=[rows[best],rows[col]];const d=rows[col][col];for(let j=col;j<9;j++)rows[col][j]/=d;for(let row=0;row<8;row++){if(row===col)continue;const f=rows[row][col];for(let j=col;j<9;j++)rows[row][j]-=f*rows[col][j]}}
 return [...rows.map(row=>row[8]),1];
}
export function inversePoint(h,x,y){const a=h[0]-x*h[6],b=h[1]-x*h[7],c=x-h[2],d=h[3]-y*h[6],e=h[4]-y*h[7],f=y-h[5],det=a*e-b*d;return {u:(c*e-b*f)/det,v:(a*f-c*d)/det}}
export const stampRanges=[[.35,.48],[.48,.61],[.61,.74]];
// Run each impression in real time so its rebound finishes even when scrolling stops.
export function stampImpression(age,direction=1){
 const reverse=direction<0;
 if(age<0||age>=.6)return {scale:1,pressure:0,opacity:reverse?0:1};
 const phase=reverse?.6-age:age;
 return {scale:1+.18*Math.pow(1-phase/.6,3),pressure:direction*Math.sin(phase*28)*Math.exp(-phase*9),opacity:reverse?1-smooth(0,.6,age):1};
}
export function passportState(progress){
 const p=clamp(progress),opening=smooth(.10,.34,p)*(1-smooth(.82,.93,p));
 const completed=stampRanges.map(([a,b])=>p>=a+(b-a)*.5);
 const station=stampRanges.findIndex(([a,b])=>p>=a&&p<b);
 return {progress:p,opening,completed,station,closing:p>=.82,exit:smooth(.94,1,p)};
}

// A single, overlapping hand moves one slot at a time. No card wraps around
// or leaves the group: the selected slot is always centred and in front.
export function fanCard(index,position,count,step=6,spacing=8){
 const distance=index-Math.max(0,Math.min(count-1,position));
 // Align the lower corners so the enlarged photos use the full stage height.
 const radians=distance*step*Math.PI/180;
 return {distance,x:distance*spacing||0,y:-37.5*Math.abs(Math.sin(radians))||0,
  angle:distance*step||0,scale:1,blur:0,opacity:1,
  z:Math.round(100-Math.abs(distance)*10)};
}

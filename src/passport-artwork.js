import * as THREE from 'three';

export const passportPrint={width:1400,height:1000,columns:[.17,.5,.83],circleY:.48};

export async function createPassportArtwork(){
 await document.fonts.load('500 30px "Playfair Display"');
 const {width,height,columns,circleY}=passportPrint;
 const spread=document.createElement('canvas');spread.width=width;spread.height=height;
 const ctx=spread.getContext('2d');
 ctx.fillStyle='#f3f0e8';ctx.fillRect(0,0,width,height);
 ctx.textAlign='center';ctx.textBaseline='middle';
 const titles=[['LA ALFOMBRA ROJA'],['COMPRATE UN DEPORTE'],['EL NOMBRE QUE NO','SALE EN PANTALLA']];
 columns.forEach((column,i)=>{
  const x=column*width;
  ctx.fillStyle='#07130f';ctx.font='28px Arial';ctx.fillText('ZONA '+(i+1)+' ·',x,170);
  ctx.font='500 30px "Playfair Display", Georgia, serif';
  titles[i].forEach((line,row)=>ctx.fillText(line,x,215+row*35));
  ctx.strokeStyle='#46695b';ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(x-27,280);ctx.lineTo(x+27,280);ctx.stroke();
  ctx.lineWidth=4;ctx.beginPath();ctx.arc(x,circleY*height,151,0,Math.PI*2);ctx.stroke();
 });
 ctx.fillStyle='#46695b';ctx.font='26px Arial';
 ctx.fillText('Completá las 3 zonas y llegá a la asamblea final.',width/2,740);
 ctx.strokeStyle='#708d81';ctx.lineWidth=2;
 for(const [from,to] of [[.08,.18],[.82,.92]]){ctx.beginPath();ctx.moveTo(from*width,740);ctx.lineTo(to*width,740);ctx.stroke()}
 ctx.textAlign='left';ctx.fillStyle='#202923';ctx.font='24px Arial';
 for(const [label,x] of [['NOMBRE',105],['N.º DE PASAPORTE',870]]){
  ctx.fillText(label,x,835);ctx.strokeStyle='#38443c';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(x,890);ctx.lineTo(x+425,890);ctx.stroke();
 }
 // Both pages come from the same spread: their typography shares identical baselines.
 return [0,1].map(page=>{
  const canvas=document.createElement('canvas');canvas.width=width/2;canvas.height=height;
  canvas.getContext('2d').drawImage(spread,page*width/2,0,width/2,height,0,0,width/2,height);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  texture.flipY=false;return texture;
 });
}

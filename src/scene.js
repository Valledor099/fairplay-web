import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {passportState,stampImpression,smooth,clamp} from './passport-model.js';
import {createPassportArtwork,passportPrint} from './passport-artwork.js';
import {boundedDrag} from './story-model.js';
const W=1.95,H=2.8;
function sealTexture(i){const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d');ctx.strokeStyle=ctx.fillStyle='#46695b';ctx.lineWidth=9;ctx.beginPath();ctx.arc(256,256,218,0,Math.PI*2);ctx.stroke();ctx.lineWidth=3;ctx.beginPath();ctx.arc(256,256,196,0,Math.PI*2);ctx.stroke();ctx.textAlign='center';ctx.font='26px Arial';ctx.fillText('ZONA '+(i+1),256,155);ctx.font='bold 90px Arial';ctx.fillText('✓',256,289);ctx.font='25px Arial';ctx.fillText('COMPLETADO',256,357);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
export async function createPassportScene({reduced=false}={}){
 const holder=document.querySelector('#passport-scene'),stage=document.querySelector('.event-stage'),loading=document.querySelector('#model-loading');
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;holder.append(renderer.domElement);
 const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Pasaporte FAIR PLAY en 3D. Arrastrá para girar; usá las flechas y Home con el teclado.');canvas.style.touchAction='pan-y';
 const scene=new THREE.Scene(),night=new THREE.Color('#051014');scene.background=night;const camera=new THREE.PerspectiveCamera(35,1,.1,80);
 const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment(),environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;scene.environmentIntensity=.6;room.dispose();pmrem.dispose();
 scene.add(new THREE.HemisphereLight(0xfffcf6,0x23382c,1.1));const light=new THREE.DirectionalLight(0xfffcf2,2.2);light.position.set(-3,8,4);light.castShadow=true;light.shadow.mapSize.set(1024,1024);Object.assign(light.shadow.camera,{left:-5,right:5,top:5,bottom:-5,near:.1,far:30});light.shadow.bias=-.00015;light.shadow.normalBias=.008;scene.add(light);
 const rim=new THREE.DirectionalLight(0xa8c8bc,1.7);rim.position.set(4,3,-2);scene.add(rim);
 let asset;try{asset=(await new GLTFLoader().loadAsync(import.meta.env.BASE_URL+'models/pasaporte.glb')).scene}catch(error){environment.dispose();light.shadow.dispose();renderer.dispose();canvas.remove();throw error}
 const pageArtwork=await createPassportArtwork();
 // Close the 0.02-unit gap between the printed sheets without changing the cover or hinge.
 for(const name of ['PassportLeftArtwork','PassportRightArtwork'])asset.getObjectByName(name).scale.x*=W/1.93;
 asset.traverse(o=>{if(!o.isMesh)return;o.castShadow=o.receiveShadow=true;for(const m of Array.isArray(o.material)?o.material:[o.material]){m.side=THREE.FrontSide;for(const texture of [m.map,m.normalMap])if(texture)texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy())}if(/Artwork/.test(o.name)){const old=o.material,cover=/Cover/.test(o.name),page=o.name==='PassportLeftArtwork'?0:o.name==='PassportRightArtwork'?1:-1;const map=page>=0?pageArtwork[page]:old.map;if(page>=0){old.map.dispose();map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy())}o.material=new THREE.MeshPhysicalMaterial({map,normalMap:old.normalMap,normalScale:old.normalScale.clone(),roughnessMap:old.roughnessMap,roughness:1,metalness:0,clearcoat:cover?.03:0,clearcoatRoughness:.65,specularIntensity:cover?.35:.15,envMapIntensity:cover?.3:.18,side:THREE.FrontSide});old.dispose()}});
 const book=new THREE.Group();book.name='InteractivePassport';book.add(asset);scene.add(book);book.updateMatrixWorld(true);
 const rawHinge=book.getObjectByName('PassportHinge');if(!rawHinge)throw new Error('Falta el pivote PassportHinge');
 const hinge=new THREE.Group();hinge.position.set(-W/2,.131,0);book.add(hinge);book.updateMatrixWorld(true);hinge.attach(rawHinge);
 const centres=passportPrint.columns.map(u=>new THREE.Vector3((u*2-1.5)*W,.145,(passportPrint.circleY-.5)*H));
 // Attach the ink while the spread is open, then let each page carry it through the hinge.
 // Zone 2 straddles the fold, so its two halves belong to different pages.
 hinge.rotation.z=Math.PI;book.updateMatrixWorld(true);
 const seals=centres.map((centre,i)=>{
  const material=new THREE.MeshBasicMaterial({map:sealTexture(i),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
  return (i===1?[0,1]:[i===0?0:1]).map(page=>{
   const part=new THREE.Group();part.position.copy(centre);part.position.y=page===0?.145:.128;part.rotation.x=-Math.PI/2;book.add(part);
   const geometry=new THREE.PlaneGeometry(i===1?.415:.83,.83);
   if(i===1){const uv=geometry.getAttribute('uv');for(let vertex=0;vertex<uv.count;vertex++)uv.setX(vertex,uv.getX(vertex)*.5+page*.5)}
   const mesh=new THREE.Mesh(geometry,material);if(i===1)mesh.position.x=page===0?-.2075:.2075;part.add(mesh);
   book.updateMatrixWorld(true);book.getObjectByName(page===0?'PassportLeftArtwork':'PassportRightArtwork').attach(part);part.visible=false;
   return part;
  });
 });
 hinge.rotation.z=0;
 const sealTimes=seals.map(()=>-Infinity),sealDirections=seals.map(()=>1),wasCompleted=seals.map(()=>false);
 const steps=[...document.querySelectorAll('[data-step]')],title=document.querySelector('#event-title'),description=document.querySelector('#event-description'),status=document.querySelector('#passport-status');
 let bounds,visible=true,disposed=false,dirty=true,lastProgress=-1,lastTime=0,previousPhase='',drag=null;
 const rotation={x:0,y:0,targetX:0,targetY:0},raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
 function picked(e){const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);return book.visible&&raycaster.intersectObject(book,true).length>0}
 const down=e=>{if(e.button!==0||drag||!picked(e))return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,start:{x:rotation.x,y:rotation.y},touch:e.pointerType==='touch',claimed:e.pointerType!=='touch'};if(drag.claimed){canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing'}dirty=true};
 const move=e=>{if(!drag){canvas.style.cursor=picked(e)?'grab':'default';return}if(e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(drag.touch&&!drag.claimed){if(Math.abs(dy)>8&&Math.abs(dy)>Math.abs(dx)){drag=null;return}if(Math.abs(dx)<8)return;drag.claimed=true;canvas.setPointerCapture(e.pointerId)}if(drag.claimed){e.preventDefault();const next=boundedDrag(drag.start,dx,dy);rotation.targetX=next.x;rotation.targetY=next.y;dirty=true}};
 const up=e=>{if(!drag||drag.id!==e.pointerId)return;if(!reduced)rotation.targetX=rotation.targetY=0;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);drag=null;canvas.style.cursor='grab';dirty=true};
 const keys=e=>{if(e.key==='Home'){e.preventDefault();rotation.targetX=rotation.targetY=0}else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();rotation.targetY=clamp(rotation.targetY+(e.key==='ArrowRight'?.08:e.key==='ArrowLeft'?-.08:0),-.4,.4);rotation.targetX=clamp(rotation.targetX+(e.key==='ArrowDown'?.06:e.key==='ArrowUp'?-.06:0),-.22,.22)}else return;dirty=true};
 canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);canvas.addEventListener('lostpointercapture',up);canvas.addEventListener('keydown',keys);
 function resize(){dirty=true;bounds=holder.getBoundingClientRect();renderer.setSize(bounds.width,bounds.height,false);camera.aspect=bounds.width/bounds.height;camera.updateProjectionMatrix()}
 const observer=new ResizeObserver(resize);observer.observe(holder);resize();const visibility=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)dirty=true},{rootMargin:'100px'});visibility.observe(stage);
 document.body.classList.add('three-ready');loading.textContent='';
 function render(progress,time=performance.now()/1000,handoff=null){if(disposed||(!visible&&!handoff?.active)||document.hidden||document.querySelector('#contenido').hidden)return;
  const dt=Math.min(.05,Math.max(.001,time-lastTime));lastTime=time;
  const rotating=Math.abs(rotation.x-rotation.targetX)+Math.abs(rotation.y-rotation.targetY)>.0001;
  if(rotating){rotation.x=reduced?rotation.targetX:THREE.MathUtils.damp(rotation.x,rotation.targetX,10,dt);rotation.y=reduced?rotation.targetY:THREE.MathUtils.damp(rotation.y,rotation.targetY,10,dt)}
  const firstFrame=lastProgress<0,impressing=!reduced&&sealTimes.some(start=>time-start<.6);
  const floating=!reduced&&progress<.94&&!handoff?.active;if(!dirty&&!rotating&&!floating&&!impressing&&Math.abs(progress-lastProgress)<.000001)return;dirty=false;lastProgress=progress;
  const p=reduced?.78:clamp(progress),state=passportState(p),mobile=innerWidth<601,overhead=smooth(.08,.35,p);
  let pressure=0,tiltX=0,tiltZ=0;
  seals.forEach((seal,i)=>{
   if(state.completed[i]!==wasCompleted[i]&&!reduced&&!firstFrame){sealTimes[i]=time;sealDirections[i]=state.completed[i]?1:-1}
   wasCompleted[i]=state.completed[i];
   const age=reduced?Infinity:time-sealTimes[i],impression=stampImpression(age,sealDirections[i]);
   seal.forEach(part=>{part.visible=state.completed[i]||(sealDirections[i]<0&&age>=0&&age<.6);part.scale.setScalar(impression.scale);part.children[0].material.opacity=impression.opacity});
   pressure+=impression.pressure;
   tiltX+=impression.pressure*centres[i].z*.018;
   tiltZ+=impression.pressure*(centres[i].x+W/2)*.018;
  });
  hinge.rotation.z=Math.PI*state.opening;const idle=floating&&!drag?1:0;book.rotation.set(.14*(1-overhead)+rotation.x,THREE.MathUtils.lerp(-.18,0,overhead)+rotation.y,-.055*(1-overhead)+idle*.008*Math.sin(time*.65));book.position.set(THREE.MathUtils.lerp(.65,W/2,overhead)+state.exit*14,idle*.045*Math.sin(time*.85),-state.exit*2);book.visible=state.exit<.995;
  const contact=state.opening>.97?1:0;book.position.y-=pressure*.075*contact;book.rotation.x+=tiltX*contact;book.rotation.z-=tiltZ*contact;
  const overheadDistance=mobile?11.4:Math.max(7.5,3.9/(.53*2*Math.tan(THREE.MathUtils.degToRad(35)/2)*camera.aspect));
  camera.fov=mobile?48:35;camera.position.set(0,THREE.MathUtils.lerp(mobile?8.6:4.7,overheadDistance,overhead),THREE.MathUtils.lerp(mobile?8:5.7,.01,overhead));camera.lookAt(0,0,0);camera.setViewOffset(bounds.width,bounds.height,mobile?0:-bounds.width*.13,mobile?-bounds.height*.08:0,bounds.width,bounds.height);
  const completed=state.completed.filter(Boolean).length;steps.forEach((step,i)=>{step.classList.toggle('completed',state.completed[i]);const text=state.completed[i]?'✓':String(i+1);if(step.querySelector('.step-dot').textContent!==text)step.querySelector('.step-dot').textContent=text;if(state.station===i)step.setAttribute('aria-current','step');else step.removeAttribute('aria-current')});
  const phase=p<.14?'closed':p<.35?'opening':p<.74?'route':p<.94?'complete':'exit';if(phase!==previousPhase){previousPhase=phase;const content={closed:['Tu recorrido empieza acá.','Al ingresar recibís tu pasaporte. Tres zonas, tres sellos y otra forma de mirar el deporte.'],opening:['Completá tu pasaporte.','Las tres estaciones se recorren en orden. Cada una cambia un poco tu mirada.'],route:['Tres zonas. Otra mirada.','Del brillo del espectáculo a las historias que no salen en pantalla. Viví el recorrido en el evento.'],complete:['Tu pasaporte está completo.','Al finalizar, acercate al Vestuario para recibir tu camiseta FAIR PLAY personalizada.'],exit:['El recorrido deja su marca.','La conversación sigue en el Vestuario. Descubrí la colección de FAIR PLAY.']}[phase];title.textContent=content[0];description.textContent=content[1]}
  status.textContent=completed===3?'Tres zonas completas. Una nueva mirada.':completed?completed+' de 3 zonas completas.':'Scrolleá para descubrir el recorrido.';
  scene.background=handoff?.active?null:night;
  holder.dataset.progress=clamp(progress).toFixed(3);holder.dataset.completed=String(completed);holder.dataset.dragging=String(Boolean(drag));renderer.render(scene,camera);
 }
 return {render,resize,dispose(){disposed=true;observer.disconnect();visibility.disconnect();for(const [event,handler] of [['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',up],['lostpointercapture',up],['keydown',keys]])canvas.removeEventListener(event,handler);scene.traverse(o=>{o.geometry?.dispose();for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[]){for(const v of Object.values(m))if(v?.isTexture)v.dispose();m.dispose()}});environment.dispose();light.shadow.dispose();renderer.dispose();canvas.remove()}};
}

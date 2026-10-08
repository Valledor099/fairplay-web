import {WebGLRenderer,Scene,OrthographicCamera,PlaneGeometry,Mesh,ShaderMaterial,Texture,Vector2,Vector4,SRGBColorSpace,LinearFilter} from 'three';
import {createIdleReveal,idleSlash} from './hero-idle.js';

const TRAIL_LENGTH=32;
const fragmentShader=`
uniform sampler2D uGood;
uniform sampler2D uPressure;
uniform vec2 uSize;
uniform vec2 uCover;
uniform vec2 uOffset;
uniform vec2 uParallax;
uniform vec4 uTrail[${TRAIL_LENGTH}];
uniform vec2 uSlash;
uniform float uTime;
uniform float uLocked;
uniform float uZoom;
varying vec2 vUv;
float smoothUnion(float a,float b,float k){
 float h=clamp(.5+.5*(b-a)/k,0.,1.);
 return mix(b,a,h)-k*h*(1.-h);
}
void main(){
 vec2 pixel=vUv*uSize;
 float field=10000.;
 for(int i=0;i<${TRAIL_LENGTH};i++){
  vec4 point=uTrail[i];
  if(point.z>.1){
   vec2 q=pixel-point.xy;
   q.y+=sin(q.x*.015+uTime*1.1+point.w)*min(18.,point.z*.25);
   q.y+=sin(q.x*.031-uTime*.8)*point.z*.07;
   float d=(length(q/vec2(2.8,1.))-point.z);
   field=smoothUnion(field,d,12.);
  }
 }
 float cut=0.;
 if(uSlash.y>0. && uSlash.x>0.){
  vec2 start=vec2(.10,.20)*uSize;
  vec2 stroke=(vec2(.92,.82)*uSize-start)*uSlash.x;
  vec2 q=pixel-start;
  float along=dot(q,stroke)/dot(stroke,stroke);
  if(along>0. && along<1.){
   float distanceToBlade=length(q-stroke*along);
   float taper=pow(sin(along*3.14159265),.65);
   float halfWidth=min(uSize.x,uSize.y)*.16*uSlash.y*taper;
   cut=1.-smoothstep(halfWidth-1.,halfWidth+1.,distanceToBlade);
  }
 }
 float brush=1.-smoothstep(-2.,3.,field);
 float reveal=max(max(brush,cut),uLocked);
 vec2 imageUv=(vUv-.5)*uCover/uZoom+.5+uOffset+uParallax;
 float edge=brush*(1.-brush);
 vec2 refraction=vec2(sin(pixel.y*.025),cos(pixel.x*.018))*edge*1.6/uSize;
 vec4 good=texture2D(uGood,imageUv+refraction);
 vec4 pressure=texture2D(uPressure,imageUv-refraction);
 gl_FragColor=vec4(mix(good.rgb,pressure.rgb,reveal),1.);
 #include <colorspace_fragment>
}`;

/** Shares the site's GSAP ticker; no extra scroll engine or animation loop. */
export function createHeroReveal({reduced}){
 const hero=document.querySelector('.hero'),media=hero.querySelector('.hero-media');
 const good=media.querySelector('.hero-good'),pressure=media.querySelector('.hero-pressure');
 const toggle=hero.querySelector('.hero-reveal-toggle');
 const hint=hero.querySelector('.hero-reveal-hint');
 const target=new Vector2(),cursor=new Vector2(),parallax=new Vector2();
 const demo=createIdleReveal(performance.now()/1000);
 const trail=Array.from({length:TRAIL_LENGTH},()=>({position:new Vector2(),born:-100,radius:0}));
 let renderer,geometry,material,textures=[],observer,disposed=false,visible=true,locked=false,active=false;
 let width=1,height=1,index=0,lastTime=0,lastStamp=0,lastInput=-100,touchUntil=0,lockMix=0,readyAt=0,lastRender=0;
 const points=Array.from({length:TRAIL_LENGTH},()=>new Vector4());
 const slash=new Vector2();
 const fallback=()=>{media.classList.remove('reveal-ready');media.classList.toggle('show-pressure',locked)};
 function stopDemo(){
  demo.reset(performance.now()/1000);
  slash.set(0,0);
 }
 function resize(){
  stopDemo();
  const rect=media.getBoundingClientRect();width=Math.max(1,rect.width);height=Math.max(1,rect.height);
  if(!renderer)return;
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(width,height,false);
  const imageAspect=good.naturalWidth/good.naturalHeight,aspect=width/height;
  const cover=new Vector2(Math.min(1,aspect/imageAspect),Math.min(1,imageAspect/aspect));
  // Keep the face visible on narrow screens; matches the image fallback's object-position.
  material.uniforms.uCover.value.copy(cover);
  material.uniforms.uOffset.value.set((.64-.5)*(1-cover.x),0);
  material.uniforms.uSize.value.set(width,height);
  trail.forEach(point=>point.radius=0);active=false;
 }
 function pointer(event){
  stopDemo();
  if(reduced||event.target.closest('a,button'))return;
  const rect=media.getBoundingClientRect();
  target.set(event.clientX-rect.left,height-(event.clientY-rect.top));
  if(!active)cursor.copy(target);
  active=true;
  lastInput=performance.now()/1000;
  if(event.pointerType!=='mouse')touchUntil=performance.now()/1000+1.8;
 }
 function leave(){stopDemo();active=false;touchUntil=0}
 function changeSide(){
  stopDemo();
  locked=!locked;toggle.setAttribute('aria-pressed',String(locked));
  toggle.querySelector('span').textContent=locked?'Volver al juego':'Ver lo que no se ve';
  fallback();
  if(renderer&&!reduced)media.classList.add('reveal-ready');
 }
 function lost(event){event.preventDefault();fallback();media.classList.remove('reveal-ready')}
 function restored(){resize();if(!disposed)media.classList.add('reveal-ready')}
 toggle.addEventListener('click',changeSide);
 hero.addEventListener('pointermove',pointer,{passive:true});
 hero.addEventListener('pointerdown',pointer,{passive:true});
 hero.addEventListener('pointerleave',leave);
 if(reduced)hint.textContent='Dos caras del mismo juego.';
 else if(matchMedia('(pointer:coarse)').matches)hint.textContent='Tocá el retrato. Mirá detrás del juego.';
 observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;stopDemo();if(!visible)leave()});
 observer.observe(hero);
 document.addEventListener('visibilitychange',stopDemo);

 async function load(){
  if(reduced)return;
  try{
   await Promise.all([good.decode(),pressure.decode()]);if(disposed)return;
   if(good.naturalWidth!==pressure.naturalWidth||good.naturalHeight!==pressure.naturalHeight)throw new Error('Hero layers must align.');
   renderer=new WebGLRenderer({alpha:false,antialias:false,powerPreference:'low-power',depth:false,stencil:false});
   renderer.domElement.setAttribute('aria-hidden','true');renderer.domElement.className='hero-reveal-canvas';
   textures=[good,pressure].map(image=>{const texture=new Texture(image);texture.colorSpace=SRGBColorSpace;texture.minFilter=LinearFilter;texture.generateMipmaps=false;texture.needsUpdate=true;return texture});
   material=new ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{uGood:{value:textures[0]},uPressure:{value:textures[1]},uSize:{value:new Vector2()},uCover:{value:new Vector2(1,1)},uOffset:{value:new Vector2()},uParallax:{value:new Vector2()},uTrail:{value:points},uSlash:{value:slash},uTime:{value:0},uLocked:{value:0},uZoom:{value:1.018}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader});
   geometry=new PlaneGeometry(2,2);const scene=new Scene();scene.add(new Mesh(geometry,material));
   const camera=new OrthographicCamera(-1,1,1,-1,0,1);renderer.userData={scene,camera};
   renderer.debug.onShaderError=()=>{fallback();media.classList.remove('reveal-ready');renderer.userData.failed=true};
   media.append(renderer.domElement);resize();readyAt=performance.now()/1000;
   renderer.render(scene,camera);
   if(!renderer.userData.failed)media.classList.add('reveal-ready');
   renderer.domElement.addEventListener('webglcontextlost',lost);
   renderer.domElement.addEventListener('webglcontextrestored',restored);
  }catch(error){fallback();console.warn('Hero: usando imágenes accesibles.',error);renderer?.dispose();renderer?.domElement.remove();renderer=undefined}
 }
 load();addEventListener('resize',resize);
 return {
  render(){
   if(!renderer||renderer.userData.failed||disposed||!visible||hero.closest('[hidden]')||document.hidden)return;
   const time=performance.now()/1000;
   // Cap at 40 fps and 1.5 DPR: one draw call, two compressed images, 32 brush samples.
   if(time-lastRender<1/40)return;lastRender=time;
   const dt=Math.min(.05,time-lastTime||1/40);lastTime=time;
   if(touchUntil&&time>touchUntil)leave();
   const phase=demo.sample(time,!locked&&time>=touchUntil);
   const blade=idleSlash(phase);slash.set(blade.length,blade.width);
   const ease=1-Math.exp(-dt*12);cursor.lerp(target,ease);
   if(active&&!locked&&time-lastInput<.18&&time-lastStamp>1/40){
    const previous=trail[(index+TRAIL_LENGTH-1)%TRAIL_LENGTH];
    const distance=previous.position.distanceTo(cursor),steps=Math.min(8,Math.max(1,Math.ceil(distance/30)));
    const start=previous.radius>0?previous.position.clone():cursor.clone();
    for(let step=1;step<=steps;step++){
     const point=trail[index];point.position.copy(start).lerp(cursor,step/steps);point.born=time;
     point.radius=Math.min(145,Math.max(80,height*.16))+Math.min(distance,70)*.12;
     index=(index+1)%TRAIL_LENGTH;
    }
    lastStamp=time;
   }
   let strength=blade.width;
   trail.forEach((point,i)=>{
    const life=Math.max(0,1-(time-point.born)/1.05);
    points[i].set(point.position.x,point.position.y,point.radius*Math.pow(life,1.3),i*.7);
    strength=Math.max(strength,life);
   });
   lockMix+=(Number(locked)-lockMix)*(1-Math.exp(-dt*7));
   const desired=active?new Vector2((cursor.x/width-.5)*.006,(cursor.y/height-.5)*.006):new Vector2();
   parallax.lerp(desired,ease*.4);
   material.uniforms.uParallax.value.copy(parallax);material.uniforms.uTime.value=time;
   material.uniforms.uLocked.value=lockMix;material.uniforms.uZoom.value=1+.018*Math.exp(-(time-readyAt)*2);
   hero.style.setProperty('--reveal-strength',String(Math.max(strength,lockMix)));
   renderer.render(renderer.userData.scene,renderer.userData.camera);
  },
  dispose(){
   disposed=true;observer?.disconnect();removeEventListener('resize',resize);document.removeEventListener('visibilitychange',stopDemo);
   toggle.removeEventListener('click',changeSide);hero.removeEventListener('pointermove',pointer);hero.removeEventListener('pointerdown',pointer);hero.removeEventListener('pointerleave',leave);
   renderer?.domElement.removeEventListener('webglcontextlost',lost);renderer?.domElement.removeEventListener('webglcontextrestored',restored);
   textures.forEach(texture=>texture.dispose());geometry?.dispose();material?.dispose();renderer?.dispose();renderer?.domElement.remove();
  }
 };
}

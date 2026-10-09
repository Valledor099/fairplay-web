import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {referenceQuads,homography,inversePoint,passportState,stampRanges,stampImpression} from '../src/passport-model.js';
import {initialBooking,selectionError,contactErrors,qrPayload} from '../src/booking-model.js';
import {EVENT,eventCountdown} from '../src/event-config.js';
import {createIdleReveal,IDLE_DELAY,DEMO_DURATION,DEMO_REST} from '../src/hero-idle.js';
import {eventStory,storyDistance,PASSPORT_DISTANCE,REWARDS_START} from '../src/event-story.js';

test('the passport closes before the independent gallery without adding vertical distance for products',()=>{
 assert.equal(storyDistance(1),PASSPORT_DISTANCE);assert.equal(storyDistance(6),PASSPORT_DISTANCE);
 const closing=eventStory(REWARDS_START/PASSPORT_DISTANCE);
 assert.ok(closing.passport>=.93-1e-10);assert.equal(closing.passportOpacity,1);
 assert.deepEqual(eventStory(0),{passport:0,passportOpacity:1});
 assert.deepEqual(eventStory(1),{passport:1,passportOpacity:0});
 const positions=[0,.3,.5,.8,.93,.97,1];
 assert.deepEqual(positions.map(eventStory),positions.toReversed().map(eventStory).toReversed());
});

test('the hero demonstrates its reveal after inactivity, rests, and repeats',()=>{
 const demo=createIdleReveal(0);
 assert.equal(demo.sample(IDLE_DELAY-.1),null);
 assert.equal(demo.sample(IDLE_DELAY),0);
 assert.ok(Math.abs(demo.sample(IDLE_DELAY+DEMO_DURATION/2)-.5)<1e-10);
 const finish=IDLE_DELAY+DEMO_DURATION+.01;
 assert.equal(demo.sample(finish),null);
 assert.equal(demo.sample(finish+DEMO_REST-.1),null);
 assert.equal(demo.sample(finish+DEMO_REST),0);
});
test('pointer input cancels a demo and a disabled hero cannot demonstrate itself',()=>{
 const demo=createIdleReveal(0);demo.sample(5);demo.reset(6);
 assert.equal(demo.sample(6),null);assert.equal(demo.sample(10.9),null);assert.equal(demo.sample(11),0);
 assert.equal(demo.sample(40,false),null);
 assert.equal(demo.sample(44.9),null);assert.equal(demo.sample(45),0);
});
test('photo projection preserves every corner and inverts the stamp positions',()=>{for(const quad of Object.values(referenceQuads)){const h=homography(quad);[[0,0],[1,0],[1,1],[0,1]].forEach(([u,v],i)=>{const d=h[6]*u+h[7]*v+h[8];assert.ok(Math.abs((h[0]*u+h[1]*v+h[2])/d-quad[i][0])<1e-8);assert.ok(Math.abs((h[3]*u+h[4]*v+h[5])/d-quad[i][1])<1e-8);const inverse=inversePoint(h,...quad[i]);assert.ok(Math.abs(inverse.u-u)<1e-8&&Math.abs(inverse.v-v)<1e-8)})}});
test('passport stamps sequentially, reverses with scroll, closes and exits',()=>{assert.equal(passportState(0).opening,0);assert.equal(passportState(.35).opening,1);for(let i=0;i<3;i++){const [a,b]=stampRanges[i];assert.equal(passportState(a+.49*(b-a)).completed.filter(Boolean).length,i);assert.equal(passportState(a+.51*(b-a)).completed.filter(Boolean).length,i+1)}assert.equal(passportState(.78).completed.filter(Boolean).length,3);assert.equal(passportState(.93).opening,0);assert.equal(passportState(1).exit,1);assert.equal(passportState(.3).completed.filter(Boolean).length,0)});
test('each automatic stamp presses, rebounds and settles in real time',()=>{
 assert.ok(stampImpression(0).scale>1);
 assert.ok(stampImpression(.05).pressure>0);
 assert.ok(stampImpression(.16).pressure<0);
 assert.ok(Math.abs(stampImpression(.5).pressure)<.02);
 for(const age of [-1,.6,1,Infinity])assert.deepEqual(stampImpression(age),{scale:1,pressure:0,opacity:1});
});
test('backward impressions reverse the motion and fade the ink before settling',()=>{
 for(const age of [.05,.2,.4,.55]){
  const reverse=stampImpression(age,-1),forward=stampImpression(.6-age);
  assert.equal(reverse.scale,forward.scale);
  assert.equal(reverse.pressure,-forward.pressure);
 }
 assert.equal(stampImpression(0,-1).opacity,1);
 assert.ok(stampImpression(.4,-1).opacity<stampImpression(.2,-1).opacity);
 assert.deepEqual(stampImpression(.6,-1),{scale:1,pressure:0,opacity:0});
});
test('closing retains every stamp; scrolling back through the zones removes them in reverse order',()=>{
 for(const p of [.78,.86,.938,.78])assert.deepEqual(passportState(p).completed,[true,true,true]);
 assert.deepEqual(passportState(.64).completed,[true,true,false]);
 assert.deepEqual(passportState(.5).completed,[true,false,false]);
 assert.deepEqual(passportState(.4).completed,[false,false,false]);
});
test('single-day reservations only require a valid quantity and keep no date or time selection',()=>{const s=initialBooking();assert.equal(selectionError(s),'');assert.ok(!('date' in s)&&!('time' in s));for(const q of [0,7,1.5,NaN])assert.ok(selectionError({...s,quantity:q}));for(const q of [1,4,6])assert.equal(selectionError({...s,quantity:q}),'')});
test('contact validation and QR use the fixed all-day event without personal information',()=>{const s={...initialBooking(),name:'Ana Prueba',email:'ana@example.com',accessibility:'Prueba de acceso',date:'2026-11-14',time:'11:00'};assert.deepEqual(contactErrors(s),{name:'',email:''});assert.ok(contactErrors({...s,email:'invalid'}).email);const raw=qrPayload(s,'TEST'),payload=JSON.parse(raw);assert.equal(payload.validForAdmission,false);assert.equal(payload.type,'FAIRPLAY-DEMO');assert.equal(payload.date,EVENT.date);assert.equal(payload.access,'all-day');assert.ok(!('time' in payload));assert.ok(!raw.includes(s.email)&&!raw.includes(s.name)&&!raw.includes(s.accessibility))});
test('countdown uses Buenos Aires midnight and handles the event day and its end',()=>{
 const start=Date.parse(EVENT.startsAt),end=Date.parse(EVENT.endsAt);
 assert.deepEqual(eventCountdown(start-90061000),{phase:'upcoming',days:1,hours:1,minutes:1,seconds:1});
 assert.deepEqual(eventCountdown(start-1),{phase:'upcoming',days:0,hours:0,minutes:0,seconds:1});
 assert.equal(new Date(EVENT.startsAt).toISOString(),'2026-12-12T03:00:00.000Z');
 assert.equal(eventCountdown(start).phase,'today');assert.equal(eventCountdown(end-1).phase,'today');
 assert.deepEqual(eventCountdown(end),{phase:'finished',days:0,hours:0,minutes:0,seconds:0});
});
test('original reference files keep their image dimensions',()=>{for(const file of ['pasaporte.png','merchandising-sin-frase.png']){const bytes=fs.readFileSync(new URL('../public/artwork/'+file,import.meta.url));assert.equal(bytes.readUInt32BE(16),1536);assert.equal(bytes.readUInt32BE(20),1024)}});

import {boundedDrag} from '../src/story-model.js';
test('grabbing an object limits rotation instead of permitting accidental full spins',()=>{assert.deepEqual(boundedDrag({x:0,y:0},10,-10),{x:-.04,y:.04});assert.deepEqual(boundedDrag({x:0,y:0},1000,-1000),{x:-.22,y:.4})});
test('the active passport GLB contains meshes and the real hinge',()=>{for(const name of ['pasaporte']){const data=fs.readFileSync(new URL('../public/models/'+name+'.glb',import.meta.url));assert.equal(data.toString('ascii',0,4),'glTF');assert.equal(data.readUInt32LE(4),2);assert.equal(data.readUInt32LE(8),data.length);const json=JSON.parse(data.toString('utf8',20,20+data.readUInt32LE(12)));assert.ok(json.meshes.length);assert.ok(data.length<5*1024*1024);if(name==='pasaporte'){const hinge=json.nodes.find(n=>n.name==='PassportHinge');[-.975,.131,0].forEach((v,i)=>assert.ok(Math.abs(hinge.translation[i]-v)<1e-6));for(const node of ['PassportCover','PassportLeftArtwork','PassportRightArtwork'])assert.ok(json.nodes.some(n=>n.name===node))}}});

test('every catalog product has two distinct, valid photographic assets linked in the page',()=>{const manifest=JSON.parse(fs.readFileSync(new URL('../design/product-photography/prompts.json',import.meta.url),'utf8'));const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');assert.equal(manifest.assets.length,6);for(const asset of manifest.assets){const pair=['product','lifestyle'].map(variant=>{const file=asset.slug+'-'+variant+'.webp';assert.ok(html.includes('artwork/products/'+file));const data=fs.readFileSync(new URL('../public/artwork/products/'+file,import.meta.url));assert.equal(data.toString('ascii',0,4),'RIFF');assert.equal(data.toString('ascii',8,12),'WEBP');assert.equal(data.readUInt32LE(4)+8,data.length);assert.ok(data.length>10000&&data.length<200000);return data});assert.ok(!pair[0].equals(pair[1]))}});

import test from 'node:test';
import assert from 'node:assert/strict';
import {victoryState,victoryCamera,PLATE_IMAGE} from '../src/victory-state.js';
import fs from 'node:fs';

test('phrases reveal sequential lines without overlapping each other',()=>{
 const entering=victoryState(.17*.46),first=victoryState(.4*.46),question=victoryState(.9*.46);
 assert.ok(entering.firstText>0&&entering.firstText<1);assert.ok(entering.firstLines[0]>entering.firstLines[1]);
 assert.equal(first.question,0);assert.equal(first.firstText,1);assert.deepEqual(first.firstLines,[1,1]);
 assert.equal(question.question,1);assert.equal(question.firstText,0);assert.deepEqual(question.questionLines,[1,1]);
 for(let p=0;p<=1;p+=.01)assert.ok(victoryState(p).firstText+victoryState(p).question<=1.00001);
});
test('the existing inscription is isolated before the word and definition appear',()=>{
 const close=victoryState(.60),center=victoryState(.85),complete=victoryState(1);
 assert.equal(close.inscription,1);assert.equal(close.question,0);assert.equal(close.pullback,0);assert.equal(close.letters,0);
 assert.equal(center.pullback,1);assert.equal(center.center,1);assert.equal(center.travel,0);assert.ok(center.strokes.every(v=>v===1));assert.ok(center.copy.every(v=>v===0));
 assert.ok(complete.copy.every(v=>v===1));assert.equal(complete.letters,1);assert.equal(complete.travel,1);
});
test('camera projection registers the engraved W in the same photo on desktop and mobile',()=>{
 for(const [width,height] of [[1440,900],[390,844],[1920,1080],[700,650]]){
  let last=0;
  for(let p=0;p<=.69;p+=.005){
   const c=victoryCamera(width,height,victoryState(p));
   assert.ok(Math.abs(c.letterX-(c.x+c.width*PLATE_IMAGE.x))<1e-8);
   assert.ok(Math.abs(c.letterY-(c.y+c.height*PLATE_IMAGE.y))<1e-8);
   assert.ok(Math.abs(c.letterWidth/c.letterHeight-80/62)<1e-8);
   assert.ok(c.width>=last);last=c.width;
  }
  const focused=victoryCamera(width,height,victoryState(.69));
  assert.equal(focused.letterX,width/2);assert.ok(Math.abs(focused.letterY-height*.42)<1e-8);
  // No discontinuity when camera movement ends and word reveal begins.
  assert.deepEqual(focused,victoryCamera(width,height,victoryState(.70)));
 }
});
test('celebration fills the viewport and keeps the trophy visible before its close-up',()=>{
 for(const [w,h] of [[1280,720],[1920,1080],[1440,900],[390,844],[319,884]])for(const p of [0,.15,.3,.46]){
  const c=victoryCamera(w,h,victoryState(p));
  assert.ok(c.x<=1e-8&&c.y<=1e-8);
  assert.ok(c.x+c.width>=w-1e-8&&c.y+c.height>=h-1e-8);
  assert.ok(c.letterX>0&&c.letterX<w&&c.letterY>0&&c.letterY<h);
 }
});
test('scroll and camera reverse exactly, independently of elapsed time',()=>{
 const states=[0,.2,.4,.6,.8,1];
 assert.deepEqual(states.map(victoryState),[...states].reverse().map(victoryState).reverse());
 assert.deepEqual(states.map(p=>victoryCamera(1440,900,victoryState(p))),[...states].reverse().map(p=>victoryCamera(1440,900,victoryState(p))).reverse());
 assert.deepEqual(victoryState(-10),victoryState(0));assert.deepEqual(victoryState(10),victoryState(1));
});
test('the active scene uses one photograph across both viewport sizes',()=>{
 const manifest=JSON.parse(fs.readFileSync(new URL('../design/victory-video/manifest.json',import.meta.url),'utf8'));
 assert.equal(manifest.sources.length,1);assert.deepEqual(manifest.asset.size,[1672,941]);
 const bytes=fs.readFileSync(new URL('../public/artwork/'+manifest.asset.file,import.meta.url));
 assert.equal(bytes.toString('ascii',8,12),'WEBP');assert.equal(bytes.length,manifest.asset.bytes);
 const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const scene=html.slice(html.indexOf('<section id="celebracion"'),html.indexOf('<section id="evento"'));
 assert.equal((scene.match(/class="victory-photo"/g)||[]).length,1);assert.ok(!scene.includes('<video'));assert.ok(!scene.includes('light-trail'));
});

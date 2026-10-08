import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {washingState} from '../src/sportswashing-state.js';

test('the passport enters continuously after the explanation, and reverses with scroll',()=>{
 assert.equal(washingState(.8).phase,'definition');
 assert.equal(washingState(.8).handoff,0);
 assert.equal(washingState(.9).handoff,0);
 assert.ok(washingState(.95).handoff>0&&washingState(.95).handoff<1);
 assert.equal(washingState(1).handoff,1);
 assert.equal(washingState(1).handoffCopy,1);
 let previous=0;
 for(let i=0;i<=1000;i++){
  const current=washingState(i/1000);
  assert.ok(current.handoff>=previous);
  assert.ok(current.handoff-previous<.017);
  previous=current.handoff;
 }
 const positions=[0,.2,.43,.65,.84,.9,.95,1];
 assert.deepEqual(positions.map(washingState),positions.toReversed().map(washingState).toReversed());
 assert.deepEqual(washingState(-1),washingState(0));
 assert.deepEqual(washingState(2),washingState(1));
});

test('the second section explains sportswashing and leads directly to the existing passport',()=>{
 const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const sections=[...html.matchAll(/<section id="([^"]+)"/g)].map(match=>match[1]);
 assert.deepEqual(sections.slice(0,3),['inicio','contexto','evento']);
 assert.ok(!html.includes('id="celebracion"'));
 assert.ok(!/newspaper|magazine-world|victory-photo|the-times|news-gallery/.test(html));
 assert.ok(html.includes('washing-definition')&&html.includes('vulneraciones de derechos humanos'));
 assert.ok(html.includes('href="#evento"'));
 const scene=fs.readFileSync(new URL('../src/scene.js',import.meta.url),'utf8');
 const main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
 assert.ok(!scene.includes('event-news-passport'));
 assert.ok(!/victory-image|news-gallery|newspaper/.test(main));
 assert.ok(scene.includes('models/pasaporte.glb'));
});

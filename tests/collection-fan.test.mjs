import test from 'node:test';
import assert from 'node:assert/strict';
import {fanCard} from '../src/collection-fan.js';

test('the overlapping hand selects each card in order at the centre',()=>{
 for(let current=0;current<6;current++){
  const cards=Array.from({length:6},(_,i)=>fanCard(i,current,6)),front=cards[current];
  assert.equal(front.opacity,1);assert.equal(front.blur,0);
  assert.equal(front.y,0);assert.equal(front.scale,1);
  assert.equal(front.x,0);assert.equal(front.angle,0);
  for(let i=1;i<cards.length;i++){
   assert.ok(cards[i].x>cards[i-1].x);
   assert.ok(cards[i].angle>cards[i-1].angle);
   assert.equal(cards[i].x-cards[i-1].x,8);
  }
  for(const [index,card] of cards.entries()){
   assert.equal(card.opacity,1);
   assert.equal(card.scale,1);assert.equal(card.blur,0);
   if(index!==current)assert.ok(front.z>card.z);
  }
 }
 assert.deepEqual(fanCard(0,-1,6),fanCard(0,0,6));
 assert.deepEqual(fanCard(5,6,6),fanCard(5,5,6));
});
test('every card moves continuously and reverses with scroll',()=>{
 for(let index=0;index<6;index++){
  for(let p=.002;p<=5;p+=.002){
   const a=fanCard(index,p-.002,6),b=fanCard(index,p,6);
   for(const property of ['angle','x','y','scale','blur'])assert.ok(Math.abs(a[property]-b[property])<.6);
   assert.equal(b.opacity,1);
  }
 }
 const positions=Array.from({length:101},(_,i)=>i/20);
 assert.deepEqual(positions.map(p=>fanCard(3,p,6)),[...positions].reverse().map(p=>fanCard(3,p,6)).reverse());
});

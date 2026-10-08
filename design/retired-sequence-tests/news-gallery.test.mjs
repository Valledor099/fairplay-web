import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newsGalleryState,magazineLayout,publicationGeometry,STORY_DISTANCE,INFORMATION_AT} from '../src/news-gallery-state.js';
const at=distance=>newsGalleryState(distance/STORY_DISTANCE);
const centered=(i,w=1280,h=720)=>magazineLayout(at(10.6+i*8.1/4),w,h);

test('the original mural occupies the exact viewport before retreat, without a replacement',()=>{
 for(const [w,h] of [[1280,720],[390,844]]){
  const initial=magazineLayout(newsGalleryState(INFORMATION_AT),w,h),lead=initial.pages[0];
  assert.equal(at(8.2).victory,1);assert.equal(initial.gaze.opacity,0);
  assert.ok(Math.abs(initial.scale*initial.leadScale-1)<1e-10);
  assert.ok(Math.abs(lead.left)<1e-10&&Math.abs(lead.top)<1e-10);
  assert.ok(Math.abs(lead.width-1)<1e-10&&Math.abs(lead.height-1)<1e-10);
 }
});
test('retreat reveals the masthead around the same lead at a readable scale',()=>{
 const close=magazineLayout(at(9),1280,720),mid=magazineLayout(at(9.8),1280,720),open=centered(0);
 assert.ok(close.scale>mid.scale&&mid.scale>open.scale);assert.equal(open.scale,1);
 assert.ok(open.pages[0].width>.8);assert.ok(open.pages[0].top>0);
 // The full-width masthead takes precedence; the large lead continues below it.
 assert.ok(open.pages[0].top*720>=open.paperWidth*.94*450/3758+80);
 assert.ok(mid.pages[0].left>close.pages[0].left);assert.equal(at(10.6).camera,0);
});
test('the large portrait sheet uses the available width rather than fitting its height',()=>{
 const desktop=centered(1);assert.ok(desktop.paperWidth>1100);assert.ok(desktop.paperHeight>desktop.paperWidth);
 assert.ok(desktop.pages[1].width*1280>300);
 assert.ok(centered(1,390,844).paperWidth>350);
});
test('fourteen permanently blurred briefs do not overlap the five stories',()=>{
 for(const width of [390,1280]){
  const geometry=publicationGeometry(width),rects=[...geometry.articles,...geometry.backgrounds];
  assert.equal(geometry.articles.length,5);assert.equal(geometry.backgrounds.length,14);
  for(const r of rects){assert.ok(r.left>=0&&r.left+r.width<=1);assert.ok(r.top>=0&&r.top+r.height<=geometry.height)}
  for(let i=0;i<rects.length;i++)for(let j=i+1;j<rects.length;j++){
   const a=rects[i],b=rects[j];
   assert.ok(a.left+a.width<=b.left||b.left+b.width<=a.left||a.top+a.height<=b.top||b.top+b.height<=a.top);
  }
 }
});
test('the circle moves between column centers and follows the page vertically',()=>{
 const right=centered(1),left=centered(2),middle=centered(3);
 assert.ok(right.gaze.x>left.gaze.x&&middle.gaze.x>left.gaze.x);
 assert.ok(middle.y<left.y);assert.equal(right.x,left.x);assert.equal(left.x,middle.x);
 assert.ok(left.gaze.y<right.gaze.y&&middle.gaze.y>left.gaze.y);
 for(const layout of [right,left,middle]){assert.ok(layout.gaze.y>.4&&layout.gaze.y<.6);assert.ok(layout.gaze.radius>=300);assert.equal(layout.gaze.opacity,1)}
 const css=fs.readFileSync(new URL('../src/newspaper-portrait.css',import.meta.url),'utf8');
 assert.ok(css.includes('radial-gradient(circle var(--reading-radius'));assert.ok(css.includes('filter:blur(2.3px)'));
});
test('focus changes smoothly as the circle passes between stories',()=>{
 const center=10.6+2*8.1/4;
 const incoming=[-1.4,-.8,-.3,0].map(delta=>magazineLayout(at(center+delta),1280).pages[2]);
 for(let i=1;i<incoming.length;i++)assert.ok(incoming[i].focus>incoming[i-1].focus);
 assert.equal(incoming.at(-1).focus,1);assert.ok(magazineLayout(at(center+.8),1280).pages[2].focus<1);
 assert.equal(centered(2).pages.filter(p=>p.readable).length,1);
});
test('selected news stories fit vertically in desktop and mobile reading views',()=>{
 for(const [w,h] of [[1280,720],[390,844]])for(let i=1;i<5;i++){
  const layout=centered(i,w,h),page=layout.pages[i];
  assert.ok(page.top>=0&&page.top+page.height<=1);assert.ok(page.readable&&page.visible);
  assert.equal(layout.pages.filter(p=>p.readable).length,1);
 }
});
test('the final article becomes a zoom registered to the passport before the 3D handoff',()=>{
 const end=centered(4),after=magazineLayout(at(21.5),1280,720);
 assert.equal(at(18.7).camera,4);assert.ok(end.pages[4].readable);
 assert.ok(after.scale>end.scale);assert.equal(at(23).eventHint,1);
 for(const [w,h] of [[1280,720],[390,844]]){
  const preview={left:.5,top:.25,width:.35,height:.5},registered=magazineLayout(at(21.5),w,h,preview);
  for(const field of ['left','top','width','height'])assert.ok(Math.abs(registered.photo[field]-preview[field])<1e-10);
  assert.equal(at(21.5).handoff,0);assert.equal(at(22.8).handoff,1);assert.equal(at(22.8).paperOpacity,0);
  const middle=at(22.1);assert.ok(middle.handoff>0&&middle.handoff<1);assert.equal(middle.eventZoom,1);
 }
});
test('retreat, vertical reading and circular focus reverse deterministically',()=>{
 const positions=Array.from({length:231},(_,i)=>i/230);
 assert.deepEqual(positions.map(newsGalleryState),[...positions].reverse().map(newsGalleryState).reverse());
 for(const width of [390,1280])assert.deepEqual(positions.map(p=>magazineLayout(newsGalleryState(p),width)),[...positions].reverse().map(p=>magazineLayout(newsGalleryState(p),width)).reverse());
 assert.deepEqual(newsGalleryState(-1),newsGalleryState(0));assert.deepEqual(newsGalleryState(2),newsGalleryState(1));
});
test('the original composition remains the lead, followed by sourced cases and the event',()=>{
 const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
 for(const name of ['saudi-f1','six-kings','argentina-1978']){
  const bytes=fs.readFileSync(new URL('../public/artwork/news/'+name+'.webp',import.meta.url));assert.equal(bytes.toString('ascii',8,12),'WEBP');
  assert.ok(html.includes('./artwork/news/'+name+'.webp'));
 }
 assert.equal((html.match(/data-news-case/g)||[]).length,3);assert.equal((html.match(/data-background-story/g)||[]).length,14);
 assert.equal((html.match(/class="sportswashing-panel"/g)||[]).length,1);assert.ok(!html.includes('class="newspaper-printed-story newspaper-sport-summary"'));
 assert.ok(html.includes('class="newspaper-background-news" aria-hidden="true" inert'));
 assert.ok(html.includes('Cuando la gloria limpia una imagen.'));assert.ok(html.includes('No toda inversión deportiva es sportswashing'));
 assert.ok(!html.includes('class="censorship-frame"'));assert.ok(html.includes('./artwork/news/the-times-masthead.svg'));
 assert.ok(html.indexOf('data-news-case')<html.indexOf('id="printed-event-title"'));assert.ok(html.includes('Club Arquitectura'));
 assert.ok(html.indexOf('id="printed-event-title"')<html.indexOf('<section id="evento"'));
 assert.ok(!html.includes('id="otras-historias"'));
 const article=html.slice(html.indexOf('<article class="newspaper-printed-story newspaper-event-invitation"'),html.indexOf('</article>',html.indexOf('id="printed-event-title"')));
 for(const part of ['event-news-kicker','event-news-deck','event-news-byline','event-news-body','event-news-passport'])assert.ok(article.includes(part));
 assert.ok(!html.toLowerCase().includes('fecha y horario a confirmar'));
 assert.ok(!/<a(?:\s|>)/.test(article)&&!article.includes('<button'));
 const js=fs.readFileSync(new URL('../src/news-gallery.js',import.meta.url),'utf8');
 assert.ok(js.includes('const pages=[frame,...cases,invitation]'));assert.ok(!js.includes('world.before(frame)'));
});

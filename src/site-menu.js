export function initSiteMenu(){
 const menu=document.querySelector('.site-menu'),toggle=menu.querySelector('summary');
 const close=()=>{menu.open=false};
 const outside=event=>{if(!menu.contains(event.target))close()};
 const select=event=>{if(event.target.closest('a')){close();toggle.focus({preventScroll:true})}};
 const escape=event=>{if(event.key==='Escape'&&menu.open){event.preventDefault();close();toggle.focus({preventScroll:true})}};
 document.addEventListener('pointerdown',outside);
 document.addEventListener('keydown',escape);
 menu.addEventListener('click',select);
 addEventListener('popstate',close);addEventListener('hashchange',close);
 return {dispose(){document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);menu.removeEventListener('click',select);removeEventListener('popstate',close);removeEventListener('hashchange',close)}};
}

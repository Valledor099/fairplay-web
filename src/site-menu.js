export function setActiveSection(section){
 const current=['entradas','revision','confirmacion'].includes(section)?'tickets':section;
 document.querySelectorAll('[data-nav]').forEach(link=>{
  if(link.dataset.nav===current)link.setAttribute('aria-current','location');
  else link.removeAttribute('aria-current');
 });
}
export function initSiteMenu(){
 const menu=document.querySelector('.site-menu'),toggle=menu.querySelector('summary');
 const close=()=>{menu.open=false};
 const outside=event=>{if(!menu.contains(event.target))close()};
 const select=event=>{if(event.target.closest('a'))close()};
 const escape=event=>{if(event.key==='Escape'&&menu.open){event.preventDefault();close();toggle.focus({preventScroll:true})}};
 document.addEventListener('pointerdown',outside);
 document.addEventListener('keydown',escape);
 menu.addEventListener('click',select);
 addEventListener('popstate',close);addEventListener('hashchange',close);
 setActiveSection(location.hash.slice(1)||'inicio');
 return {dispose(){document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);menu.removeEventListener('click',select);removeEventListener('popstate',close);removeEventListener('hashchange',close)}};
}

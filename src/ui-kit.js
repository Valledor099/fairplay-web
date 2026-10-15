import './site-styles.js';
import './ui-kit.css';
import {bookingSteps,cancellationDialogContent,keepDialogFocus} from './booking-components.js';
import {initialBooking,contactErrors} from './booking-model.js';
import {EVENT,visitDetails} from './event-config.js';

const css=getComputedStyle(document.documentElement);
const value=name=>css.getPropertyValue(name).trim();
const colors=[
 ['Noche','--noche','Fondo principal'],['Carbón','--carbon','Neutro de la marca'],
 ['Pizarra','--pizarra','Neutro de la marca'],['Salvia','--salvia','Acción primaria'],
 ['Papel','--papel','Texto principal'],['Superficie','--ui-surface-raised','Bloques y diálogo'],
 ['Texto de apoyo','--ui-text-muted','Ayuda y metadatos'],['Error','--ui-error','Mensaje y borde del campo']
];
document.querySelector('#kit-palette').innerHTML=colors.map(([name,token,role])=>`<article class="kit-swatch"><div class="kit-swatch-color" style="--swatch:${value(token)}"></div><div class="kit-swatch-meta"><strong>${name}</strong><code>${token} · ${value(token)}</code><span>${role}</span></div></article>`).join('');
document.querySelector('#space-scale').innerHTML=[1,2,3,4,6,8,12].map(n=>`<div><i aria-hidden="true" style="--size:var(--ui-space-${n})"></i><span>${value('--ui-space-'+n)}</span></div>`).join('');

function luminance(hex){
 const channels=hex.replace('#','').match(/../g).slice(0,3).map(part=>parseInt(part,16)/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);
 return channels[0]*.2126+channels[1]*.7152+channels[2]*.0722;
}
const pairs=[['Papel sobre noche','--papel','--noche'],['Noche sobre salvia','--noche','--salvia'],['Error sobre superficie','--ui-error','--ui-surface-raised']];
document.querySelector('#contrast-checks').innerHTML=pairs.map(([label,fg,bg])=>{
 const a=luminance(value(fg)),b=luminance(value(bg)),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
 return `<p><strong>${ratio.toFixed(2)}:1</strong>${label}<br>${ratio>=4.5?'Supera 4,5:1 para texto normal':'Requiere revisar el contraste'}</p>`;
}).join('');

const tokens={};
const tokenNames=[...colors.map(([,name])=>name),'--carbon','--pizarra','--ui-surface','--ui-text','--ui-action','--ui-action-hover','--ui-focus','--ui-border','--font-display','--font-body','--ui-control-height','--ui-radius',...[1,2,3,4,6,8,12].map(n=>'--ui-space-'+n)];
for(const token of tokenNames)tokens[token]=value(token);
document.querySelector('#download-tokens').addEventListener('click',()=>{
 const url=URL.createObjectURL(new Blob([JSON.stringify({project:'Fair Play',version:'2026-10-15',tokens},null,2)],{type:'application/json'}));
 const anchor=document.createElement('a');anchor.href=url;anchor.download='fairplay-ui-tokens.json';document.body.append(anchor);
 try{anchor.click();document.querySelector('#tokens-status').textContent='Se solicitó la descarga de fairplay-ui-tokens.json';}
 finally{anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
});
document.querySelector('#show-focus').addEventListener('click',()=>{
 document.querySelector('#focus-target').focus();
 document.querySelector('#focus-status').textContent='El foco está en «Recibir foco». Presioná Tab para avanzar.';
});
document.querySelector('#focus-target').addEventListener('click',()=>{document.querySelector('#focus-status').textContent='Acción de muestra completada'});

let state=initialBooking();
const form=document.querySelector('#kit-form');
const counter=()=>{
 document.querySelector('#kit-quantity').textContent=state.quantity;
 document.querySelector('[data-kit-quantity="-1"]').disabled=state.quantity===1;
 document.querySelector('[data-kit-quantity="1"]').disabled=state.quantity===6;
};
document.querySelectorAll('[data-kit-quantity]').forEach(button=>button.addEventListener('click',()=>{state.quantity=Math.max(1,Math.min(6,state.quantity+Number(button.dataset.kitQuantity)));counter()}));
form.addEventListener('submit',event=>{
 event.preventDefault();const data=new FormData(form);
 state={...state,name:String(data.get('name')||''),email:String(data.get('email')||'')};
 const errors=contactErrors(state);
 for(const key of ['name','email']){document.querySelector('#kit-'+key).setAttribute('aria-invalid',String(Boolean(errors[key])));document.querySelector('#kit-'+key+'-error').textContent=errors[key]}
 document.querySelector('#form-status').textContent=errors.name||errors.email?'':`Datos válidos para ${state.quantity} entrada${state.quantity>1?'s':''}. Esta muestra no generó una solicitud.`;
 if(errors.name||errors.email)document.querySelector('#kit-'+(errors.name?'name':'email')).focus();
});
form.addEventListener('reset',()=>{
 state=initialBooking();counter();
 for(const key of ['name','email']){document.querySelector('#kit-'+key).setAttribute('aria-invalid','false');document.querySelector('#kit-'+key+'-error').textContent=''}
 document.querySelector('#form-status').textContent='Muestra limpia';
});
let step=0;
function showStep(){document.querySelector('#step-demo').innerHTML=bookingSteps(step);document.querySelector('#step-back').disabled=step===0;document.querySelector('#step-next').disabled=step===2}
document.querySelector('#step-back').addEventListener('click',()=>{step=Math.max(0,step-1);showStep()});
document.querySelector('#step-next').addEventListener('click',()=>{step=Math.min(2,step+1);showStep()});showStep();
document.querySelector('#open-dialog').addEventListener('click',()=>{
 const dialog=document.createElement('dialog');dialog.className='booking-dialog';
 dialog.setAttribute('aria-labelledby','cancel-title');dialog.setAttribute('aria-describedby','cancel-description');dialog.innerHTML=cancellationDialogContent();
 keepDialogFocus(dialog);
 dialog.addEventListener('close',()=>{
  document.querySelector('#dialog-status').textContent=dialog.returnValue==='cancel'?'Borrado confirmado en la muestra. La reserva real no se modificó.':'Seguiste con la solicitud de muestra';
  dialog.remove();document.querySelector('#open-dialog').focus({preventScroll:true});
 },{once:true});document.body.append(dialog);dialog.showModal();
});
document.querySelector('#kit-event-date').textContent=EVENT.label;
document.querySelector('#kit-event-hours').textContent=visitDetails().openingHours;
document.querySelector('#kit-event-venue').textContent=EVENT.venue;
document.querySelector('#kit-event-address').textContent=visitDetails().address;
const navLinks=[...document.querySelectorAll('.kit-nav a')];
function markCurrent(id){for(const link of navLinks){if(link.hash==='#'+id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')}}
const observer=new IntersectionObserver(entries=>{
 const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
 if(visible.length)markCurrent(visible[0].target.id);
},{rootMargin:'-90px 0px -55% 0px',threshold:0});
document.querySelectorAll('.kit-section').forEach(section=>observer.observe(section));
for(const link of navLinks)link.addEventListener('click',()=>markCurrent(link.hash.slice(1)));

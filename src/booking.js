import QRCode from 'qrcode';
import {initialBooking,selectionError,contactErrors,qrPayload} from './booking-model.js';
import {EVENT,visitDetails} from './event-config.js';
const escape=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const bookingRoutes=['#entradas','#revision','#confirmacion'];

export function initBooking({navigate}){
 let state=initialBooking(),errors={},selection='',code='',qr='',request=0,editFocus='';
 const container=document.querySelector('#reservation-content');
 const notice=()=>'<p class="notice">Esta es una demostración: no se reserva un lugar ni se envía un correo. El QR no tiene validez de ingreso.</p>';
 function steps(current){
  return `<nav class="booking-progress" aria-label="Pasos para obtener entradas"><p>Paso ${current+1} de 3</p><ol>${['Datos y cantidad','Revisión','Entrada'].map((label,i)=>`<li${i===current?' aria-current="step"':''}${i<current?' class="is-complete"':''}><span aria-hidden="true">${i<current?'✓':i+1}</span>${label}${i<current?'<span class="sr-only">, completado</span>':''}</li>`).join('')}</ol></nav>`;
 }
 function focusTitle(){container.querySelector('h1')?.focus({preventScroll:true})}
 function screen(current,content){container.innerHTML=`<section class="reservation-card"><p class="booking-kind">Solicitud de demostración</p>${steps(current)}${content}</section>`;focusTitle()}
 function form(){
  screen(0,`<h1 tabindex="-1">Obtené tus entradas</h1><p>La entrada es gratuita. Elegí la cantidad y completá tus datos.</p>
   <div class="booking-event"><time datetime="${EVENT.date}">${EVENT.label}</time><span>${escape(visitDetails().openingHours)} · ${EVENT.venue}</span><p>${escape(visitDetails().address)}</p><p>No necesitás elegir un turno.</p></div>${notice()}
   <form id="booking-form" novalidate>
    <div class="quantity-field"><div><p id="quantity-label" tabindex="-1">Cantidad de entradas</p><small id="quantity-hint">De 1 a 6 personas en total, incluyéndote</small></div><div class="counter" role="group" aria-labelledby="quantity-label" aria-describedby="quantity-hint selection-error">
     <button type="button" data-quantity="-1" aria-label="Quitar una entrada" ${state.quantity===1?'disabled':''}>−</button><output id="booking-quantity" aria-live="polite">${state.quantity}</output><button type="button" data-quantity="1" aria-label="Agregar una entrada" ${state.quantity===6?'disabled':''}>+</button></div></div>
    <p id="selection-error" class="field-error" role="alert">${selection}</p>
    <fieldset><legend>Datos de contacto</legend><p class="hint required-hint">El nombre y el correo son obligatorios. El apoyo para la visita es opcional.</p>
     <div class="field"><label for="guest-name">Nombre y apellido</label><input id="guest-name" name="name" autocomplete="name" value="${escape(state.name)}" required aria-invalid="${Boolean(errors.name)}" aria-describedby="name-error"><p id="name-error" class="field-error" role="alert">${errors.name||''}</p></div>
     <div class="field"><label for="guest-email">Correo electrónico</label><input id="guest-email" name="email" type="email" inputmode="email" autocomplete="email" autocapitalize="none" spellcheck="false" value="${escape(state.email)}" required aria-invalid="${Boolean(errors.email)}" aria-describedby="email-hint email-error"><p id="email-hint" class="hint">Usá el formato nombre@dominio.com</p><p id="email-error" class="field-error" role="alert">${errors.email||''}</p></div>
     <div class="field"><label for="guest-accessibility">Apoyo para la visita <span>(opcional)</span></label><textarea id="guest-accessibility" name="accessibility" aria-describedby="accessibility-hint">${escape(state.accessibility)}</textarea><p class="hint" id="accessibility-hint">Por ejemplo, acceso sin escalones. En esta demostración el pedido no se envía al equipo.</p></div>
    </fieldset>
    <div class="booking-total"><span>${state.quantity} entrada${state.quantity>1?'s':''}</span><strong>Gratis</strong></div>
    <div class="reservation-actions"><button type="button" class="button secondary" data-home>Volver al evento</button><button type="submit" class="button">Revisar datos <span aria-hidden="true">→</span></button></div>
   </form>`);
  if(editFocus){container.querySelector(editFocus)?.focus();editFocus=''}
 }
 function summary(){
  screen(1,`<h1 tabindex="-1">Revisá tus datos</h1><p>Podés editar la cantidad o los datos antes de confirmar.</p>${notice()}
   <dl class="review-data"><div><dt>Día del evento</dt><dd>${EVENT.label}</dd></div><div><dt>Acceso</dt><dd>${escape(visitDetails().openingHours)}</dd></div><div><dt>Sede</dt><dd>${EVENT.venue}<br>${escape(visitDetails().address)}</dd></div><div><dt>Cantidad</dt><dd>${state.quantity} entrada${state.quantity>1?'s':''}<button type="button" class="review-edit" data-edit-field="quantity">Cambiar cantidad</button></dd></div><div><dt>Nombre</dt><dd>${escape(state.name)}</dd></div><div><dt>Correo electrónico</dt><dd>${escape(state.email)}<button type="button" class="review-edit" data-edit-field="email">Corregir correo</button></dd></div><div><dt>Apoyo para la visita</dt><dd>${escape(state.accessibility)||'Sin pedido de apoyo'}</dd></div><div><dt>Total</dt><dd>Gratis</dd></div></dl>
   <div class="reservation-actions"><button class="button secondary" data-edit><span aria-hidden="true">←</span> Editar datos</button><button class="button" data-confirm>Confirmar y generar QR</button></div><button class="booking-text-button" data-cancel>Cancelar solicitud</button>`);
 }
 async function confirmation(){
  const attempt=++request;
  screen(2,'<h1 tabindex="-1">Preparando tu QR</h1><p role="status">Estamos generando el código de demostración. Esperá un momento.</p>');
  container.querySelector('.reservation-card').setAttribute('aria-busy','true');
  try{
   if(!qr){
    const nextCode='FP-DEMO-'+crypto.randomUUID().slice(0,8).toUpperCase();
    const nextQr=await QRCode.toDataURL(qrPayload(state,nextCode),{width:600,margin:3,errorCorrectionLevel:'M',color:{dark:'#051014',light:'#fcfcfc'}});
    if(attempt!==request||location.hash!=='#confirmacion')return;
    code=nextCode;qr=nextQr;
   }
   if(attempt!==request||location.hash!=='#confirmacion')return;
   screen(2,`<h1 tabindex="-1">Tu QR de prueba está listo</h1>${notice()}
    <p>${EVENT.label}<br>${escape(visitDetails().openingHours)} · ${EVENT.venue}<br>${escape(visitDetails().address)}<br>${state.quantity} entrada${state.quantity>1?'s':''} gratuita${state.quantity>1?'s':''}</p>
    <figure class="qr-proof"><img class="qr" src="${qr}" width="220" height="220" alt="Código QR de prueba de Fair Play, sin validez de ingreso"><figcaption>QR de prueba · Sin validez de ingreso</figcaption></figure><p class="ticket-code">${code}</p>
    <div class="arrival"><h2>Cómo usarías tu entrada</h2><p>En la versión real, guardarías el QR para presentarlo en la acreditación y recibir tu pasaporte físico. Los sellos se obtienen al completar las tres estaciones del evento.</p><p>Podés descargar este QR para probar el recorrido. Si cerrás o recargás esta página, los datos y el QR se pierden.</p></div>
    <div class="reservation-actions"><button class="button" data-download>Descargar QR <span aria-hidden="true">↓</span></button><button class="button secondary" data-finish>Volver al inicio</button></div>
    <p class="download-status" role="status" aria-live="polite"></p><p class="download-help">Buscá el archivo ${code}.png en Descargas. Si no aparece, podés abrir el QR y guardarlo desde el navegador.</p><a class="booking-text-button" href="${qr}" target="_blank" rel="noopener">Abrir QR para guardarlo <span class="sr-only">en una pestaña nueva</span></a>`);
   container.querySelector('.reservation-card').classList.add('confirmation');
  }catch{
   if(attempt!==request||location.hash!=='#confirmacion')return;
   screen(2,`<h1 tabindex="-1">No pudimos generar tu QR</h1><p role="alert">Tus datos siguen disponibles. Podés volver a intentar o revisarlos antes de continuar.</p><div class="reservation-actions"><button class="button" data-retry>Volver a intentar</button><button class="button secondary" data-edit>Revisar datos</button></div><button class="booking-text-button" data-cancel>Cancelar solicitud</button>`);
  }
 }
 function storeForm(){const form=container.querySelector('#booking-form');if(form){const data=new FormData(form);for(const key of ['name','email','accessibility']){const value=String(data.get(key)||'');state[key]=key==='accessibility'?value:value.trim()}}}
 function updateSelection(){
  container.querySelector('#booking-quantity').textContent=state.quantity;
  container.querySelector('.booking-total span').textContent=state.quantity+' entrada'+(state.quantity>1?'s':'');
  container.querySelector('[data-quantity="-1"]').disabled=state.quantity===1;
  container.querySelector('[data-quantity="1"]').disabled=state.quantity===6;
  selection=selectionError(state);container.querySelector('#selection-error').textContent=selection;
 }
 function cancel(){
  const dialog=document.createElement('dialog');dialog.className='booking-dialog';
  dialog.setAttribute('aria-labelledby','cancel-title');dialog.setAttribute('aria-describedby','cancel-description');
  dialog.innerHTML='<h2 id="cancel-title">¿Querés cancelar la solicitud?</h2><p id="cancel-description">Se borrarán la cantidad y los datos que ingresaste en esta demostración.</p><form method="dialog" class="reservation-actions"><button class="button" value="continue" autofocus>Seguir con la solicitud</button><button class="button secondary" value="cancel">Borrar y volver al evento</button></form>';
  const origin=container.querySelector('[data-cancel]');
  dialog.addEventListener('close',()=>{const discard=dialog.returnValue==='cancel';dialog.remove();if(discard){state=initialBooking();errors={};selection='';code=qr='';navigate('#tickets')}else origin?.focus()},{once:true});
  container.append(dialog);dialog.showModal();
 }
 function download(){
  const message=container.querySelector('.download-status');
  try{
   const anchor=document.createElement('a');anchor.href=qr;anchor.download=code+'.png';
   container.append(anchor);try{anchor.click()}finally{anchor.remove()}
   message.textContent='Se solicitó la descarga. Si el archivo no aparece en Descargas, volvé a descargarlo o abrí el QR para guardarlo.';
  }catch{message.textContent='No pudimos iniciar la descarga. Tu QR sigue disponible: volvé a descargarlo o abrilo para guardarlo.'}
  container.querySelector('[data-download]').innerHTML='Volver a descargar <span aria-hidden="true">↓</span>';
 }
 const submit=event=>{
  if(event.target.id!=='booking-form')return;
  event.preventDefault();storeForm();selection=selectionError(state);errors=contactErrors(state);
  container.querySelector('#selection-error').textContent=selection;
  for(const key of ['name','email']){container.querySelector('#'+key+'-error').textContent=errors[key];container.querySelector('#guest-'+key).setAttribute('aria-invalid',String(Boolean(errors[key])))}
  if(selection){container.querySelector('[data-quantity="1"]')?.focus();return}
  if(errors.name||errors.email){container.querySelector('#guest-'+(errors.name?'name':'email')).focus();return}
  state.name=state.name.trim();state.email=state.email.trim();navigate('#revision');
 };
 const click=event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.dataset.quantity){state.quantity=Math.max(1,Math.min(6,state.quantity+Number(button.dataset.quantity)));updateSelection()}
  else if(button.hasAttribute('data-home')){storeForm();navigate('#tickets')}
  else if(button.hasAttribute('data-edit-field')){editFocus=button.dataset.editField==='email'?'#guest-email':'#quantity-label';navigate('#entradas')}
  else if(button.hasAttribute('data-edit'))navigate('#entradas');
  else if(button.hasAttribute('data-confirm')){button.disabled=true;navigate('#confirmacion')}
  else if(button.hasAttribute('data-retry'))confirmation();
  else if(button.hasAttribute('data-download'))download();
  else if(button.hasAttribute('data-finish'))navigate('#inicio');
  else if(button.hasAttribute('data-cancel'))cancel();
 };
 container.addEventListener('submit',submit);container.addEventListener('click',click);
 return {save:storeForm,show(hash){
  if(!bookingRoutes.includes(hash))return false;
  if(hash!=='#entradas'&&(selectionError(state)||Object.values(contactErrors(state)).some(Boolean))){navigate('#entradas');return true}
  ++request;
  if(hash==='#entradas'){code=qr='';form()}
  else if(hash==='#revision'){code=qr='';summary()}
  else confirmation();
  return true;
 },dispose(){++request;container.removeEventListener('submit',submit);container.removeEventListener('click',click)}};
}

// Contenido compartido por la reserva y su biblioteca de componentes.
export function bookingSteps(current){
 return `<nav class="booking-progress" aria-label="Pasos para obtener entradas"><p>Paso ${current+1} de 3</p><ol>${['Datos y cantidad','Revisión','Entrada'].map((label,i)=>`<li${i===current?' aria-current="step"':''}${i<current?' class="is-complete"':''}><span aria-hidden="true">${i<current?'✓':i+1}</span>${label}${i<current?'<span class="sr-only">, completado</span>':''}</li>`).join('')}</ol></nav>`;
}

export function cancellationDialogContent(){
 return '<h2 id="cancel-title">¿Querés borrar la solicitud?</h2><p id="cancel-description">Se borrarán la cantidad y los datos que ingresaste en esta demostración.</p><form method="dialog" class="reservation-actions"><button class="button secondary" value="continue" autofocus>Seguir con la solicitud</button><button class="button" value="cancel">Borrar solicitud</button></form>';
}

export function keepDialogFocus(dialog){
 dialog.addEventListener('keydown',event=>{
  if(event.key!=='Tab')return;
  const controls=[...dialog.querySelectorAll('button:not([disabled])')];
  const first=controls[0],last=controls.at(-1);
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
 });
}

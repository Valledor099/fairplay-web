export const EVENT=Object.freeze({
 date:'2026-12-12',label:'Sábado 12 de diciembre de 2026',
 startsAt:'2026-12-12T08:00:00-03:00',endsAt:'2026-12-13T00:00:00-03:00',
 access:'Todo el día',venue:'Club Arquitectura, CABA',
 address:'Av. Francisco Beiró 2116, CABA',openingHours:'Desde las 8:00 h, sin turnos'
});

export function visitDetails(event=EVENT){
 return {address:event.address?.trim()||'Dirección exacta por confirmar',
  openingHours:event.openingHours?.trim()||'Horario de apertura y cierre por confirmar'};
}

export function eventCountdown(now=Date.now()){
 const start=Date.parse(EVENT.startsAt),end=Date.parse(EVENT.endsAt);
 const phase=now<start?'upcoming':now<end?'today':'finished';
 const seconds=Math.max(0,Math.ceil((start-now)/1000));
 return {phase,days:Math.floor(seconds/86400),hours:Math.floor(seconds/3600)%24,
  minutes:Math.floor(seconds/60)%60,seconds:seconds%60};
}

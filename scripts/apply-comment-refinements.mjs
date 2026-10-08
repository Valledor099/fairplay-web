import fs from 'node:fs/promises';
const url=new URL('../index.html',import.meta.url);let html=await fs.readFile(url,'utf8');
html=html.replace('<div class="washing-mechanism-media"><img src="./artwork/context/trophy-base-closeup.webp" width="1440" height="960"','<div class="washing-mechanism-media"><img src="./artwork/hero-football-man-hidden-v2.webp" width="1659" height="948"')
 .replace(/\s*<p class="washing-mechanism-note">[\s\S]*?<\/p>/,'')
 .replace(/^\s*<div class="washing-footer">.*<\/div>\r?\n/gm,'')
 .replace(/\s*<p class="washing-cases-hint">[\s\S]*?<\/p>/,'')
 .replace(/<a href="#evento">Descubrí tu pasaporte[\s\S]*?<\/a>/,'')
 .replace('<p>Somos Fair Play.<br>Deporte, poder y otras miradas.</p>','')
 .replace(/(<div class="collection-caption"[^>]*><h3>[\s\S]*?<\/h3>)[\s\S]*?(<\/div>)/g,'$1$2');
html=html.replaceAll('<span class="washing-case-arrow" aria-hidden="true">↗</span>','<span class="washing-case-arrow" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none"><path d="M10 38 38 10M10 10h28v28" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>');
const papers=Array.from({length:5},(_,i)=>`<span class="ticket-paper" style="--fold:${(i-2)*3}deg"><span class="ticket-paper-brand">FP</span><span class="ticket-paper-name">FAIR PLAY</span><span class="ticket-paper-type">ENTRADA</span><span class="ticket-paper-stub">${String(i+1).padStart(2,'0')}</span></span>`).join('');
html=html.replace('<a href="#entradas" class="button">Obtener entrada <span aria-hidden="true">↗</span></a>',`<div class="ticket-cta"><div class="ticket-burst" aria-hidden="true">${papers}</div><a href="#entradas" class="button ticket-cta-button"><span class="ticket-cta-label">Obtener entrada</span><span class="ticket-cta-arrow" aria-hidden="true">↗</span></a></div>`);
await fs.writeFile(url,html);console.log('Nine browser comments applied to markup.');

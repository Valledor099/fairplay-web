import {EVENT} from './event-config.js';
export function initialBooking(){return {quantity:1,name:'',email:'',accessibility:''}}
export function selectionError(s){return !Number.isInteger(s.quantity)||s.quantity<1||s.quantity>6?'Podés reservar entre 1 y 6 entradas.':''}
export function contactErrors(s){return {name:s.name.trim().length>=2?'':'Ingresá tu nombre y apellido.',email:/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email.trim())?'':'Ingresá un correo válido.'}}
export function qrPayload(s,code){return JSON.stringify({type:'FAIRPLAY-DEMO',code,date:EVENT.date,access:'all-day',quantity:s.quantity,validForAdmission:false})}

export const sportswashingCases={
 'saudi-f1':{title:'F1 en Arabia Saudita',poster:'artwork/news/saudi-f1.webp',videoId:'7gToLn7Ywjc',start:6,end:36,credit:'Video: Mercedes-AMG F1 / Jeddah, 2021',posterCredit:'Foto: FIA',video:'https://www.youtube.com/watch?v=7gToLn7Ywjc',source:'https://www.amnesty.org/en/latest/news/2021/12/saudi-arabia-grand-prix-must-not-deflect-attention-from-dismal-human-rights-record/'},
 'six-kings':{title:'Six Kings Slam',poster:'artwork/news/six-kings.webp',videoId:'hIevJXBFkcU',start:8,end:38,credit:'Video: DAZN Sport / Final, 2024',posterCredit:'Foto: Fayez Nureldine / AFP / Getty Images',video:'https://www.youtube.com/watch?v=hIevJXBFkcU',source:'https://as.com/tenis/mas_tenis/que-es-el-sportwashing-y-por-que-se-acusa-a-arabia-saudi-de-llevarlo-a-cabo-n/'},
 'argentina-1978':{title:'Argentina 1978',poster:'artwork/news/argentina-1978.webp',videoId:'qtLwUrgy2Cs',start:10,end:40,credit:'Video: Televisión Pública / Mundial 78',posterCredit:'Foto: El Gráfico / Wikimedia Commons',video:'https://www.youtube.com/watch?v=qtLwUrgy2Cs',source:'https://www.comisionporlamemoria.org/project/mundial-78/'},
};

export function previewPosition({x,y,width,height,bounds,compact=false}){
 const left=compact?12:Math.min(Math.max(12,bounds.width*.52),Math.max(12,bounds.width-width-18));
 const right=Math.max(left,bounds.width-width-18);
 return {
  x:Math.max(left,Math.min(right,x-bounds.left-width*.4)),
  y:Math.max(95,Math.min(bounds.height-height-70,y-bounds.top-height*.5)),
 };
}

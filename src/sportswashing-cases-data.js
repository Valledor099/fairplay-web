export const sportswashingCases={
 'saudi-f1':{title:'F1 en Arabia Saudita',poster:'artwork/news/saudi-f1.webp',posterCredit:'Foto: FIA',source:'https://www.amnesty.org/en/latest/news/2021/12/saudi-arabia-grand-prix-must-not-deflect-attention-from-dismal-human-rights-record/'},
 'six-kings':{title:'Six Kings Slam',poster:'artwork/news/six-kings.webp',posterCredit:'Foto: Fayez Nureldine / AFP / Getty Images',source:'https://as.com/tenis/mas_tenis/que-es-el-sportwashing-y-por-que-se-acusa-a-arabia-saudi-de-llevarlo-a-cabo-n/'},
 'argentina-1978':{title:'Argentina 1978',poster:'artwork/news/argentina-1978.webp',posterCredit:'Foto: El Gráfico / Wikimedia Commons',source:'https://www.comisionporlamemoria.org/project/mundial-78/'},
};

export function previewPosition({x,y,width,height,bounds,compact=false}){
 const left=compact?12:Math.min(Math.max(12,bounds.width*.52),Math.max(12,bounds.width-width-18));
 const right=Math.max(left,bounds.width-width-18);
 return {
  x:Math.max(left,Math.min(right,x-bounds.left-width*.4)),
  y:Math.max(95,Math.min(bounds.height-height-70,y-bounds.top-height*.5)),
 };
}

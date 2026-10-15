"""Exporta el UI kit como láminas SVG autónomas, con texto y con curvas."""
from pathlib import Path
import sys, re, json, base64, shutil, zipfile, math
from html import escape
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT.parents[1] / 'tmp/svg-runtime'))
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

OUT = ROOT / 'design/ui-kit-svg'
for required in ['ui-kit-export-camiseta.png','ui-kit-export-qr.svg']:
    if not (ROOT/'evidence'/required).exists():
        raise FileNotFoundError('Ejecutar primero node scripts/prepare-ui-kit-svg.mjs: '+required)
for folder in ['', 'con_texto', 'textos', 'fuentes']:
    (OUT / folder).mkdir(parents=True, exist_ok=True)
BG, PANEL, PAPER, SAGE, MUTED, ERROR, BORDER = '#051014', '#0c2228', '#fcfcfc', '#708d81', '#c4d1c8', '#f2b7a8', '#40544a'
FONTS = {}
for key, source, family, weight in [
    ('body', 'manrope-4.woff2', 'Manrope', 400), ('medium', 'manrope-4.woff2', 'Manrope', 600),
    ('bold', 'manrope-4.woff2', 'Manrope', 700), ('display', 'barlow-condensed-2.woff2', 'Barlow Condensed', 700),
    ('heavy', 'barlow-condensed-3.woff2', 'Barlow Condensed', 800)]:
    font = TTFont(ROOT / 'public/fonts' / source)
    if 'fvar' in font:
        font = instantiateVariableFont(font, {'wght': weight}, inplace=False)
    font.flavor = None
    style = {400:'Regular',600:'SemiBold',700:'Bold',800:'ExtraBold'}[weight]
    for platform, encoding, language in [(3,1,1033),(1,0,0)]:
        for ident, text in [(1,family),(2,style),(4,family+' '+style),(6,family.replace(' ','')+'-'+style)]:
            font['name'].setName(text, ident, platform, encoding, language)
    font.save(OUT / 'fuentes' / (family.replace(' ','')+'-'+style+'.ttf'))
    FONTS[key] = {'font':font,'glyphs':font.getGlyphSet(),'cmap':font.getBestCmap(),'family':family,'weight':weight}
for name in ['manrope-OFL.txt','barlow-condensed-OFL.txt']:
    license_text=(ROOT/'public/fonts'/name).read_text(encoding='utf-8')
    (OUT/'fuentes'/name).write_text('\n'.join(line.rstrip() for line in license_text.splitlines())+'\n',encoding='utf-8')

def width(text, size=22, font='body'):
    f=FONTS[font]; scale=size/f['font']['head'].unitsPerEm
    return sum(f['font']['hmtx'][f['cmap'].get(ord(c),'.notdef')][0] for c in text)*scale

def wrap(text, max_width, size=22, font='body'):
    lines=[]
    for paragraph in text.split('\n'):
        line=''
        for word in paragraph.split():
            if line and width(line+' '+word,size,font)>max_width:
                lines.append(line);line=word
            else: line=(line+' '+word).strip()
        lines.append(line)
    return lines

MISSING=set()
def outline(text,x,y,size,font):
    f=FONTS[font]; scale=size/f['font']['head'].unitsPerEm
    pen=SVGPathPen(f['glyphs'],ntos=lambda n:format(n,'.2f').rstrip('0').rstrip('.') if n else '0')
    cursor=x
    for c in text:
        name=f['cmap'].get(ord(c))
        if name is None: MISSING.add(c);name='.notdef'
        f['glyphs'][name].draw(TransformPen(pen,(scale,0,0,-scale,cursor,y)))
        cursor+=f['font']['hmtx'][name][0]*scale
    return pen.getCommands()

class Board:
    def __init__(self,number,title,subtitle,height=1180):
        self.number=number;self.title=title;self.h=height;self.nodes=[];self.texts=[];self.bounds=[]
        self.rect(0,0,1600,height,BG)
        logo=ET.parse(ROOT/'public/artwork/symbol-light.svg').getroot()
        inner=''.join(ET.tostring(child,encoding='unicode') for child in logo)
        self.nodes.append(('raw',f'<svg x="72" y="31" width="44" height="36" viewBox="{logo.attrib["viewBox"]}">{inner}</svg>'))
        self.text('FAIR PLAY',137,65,26,'heavy')
        self.text('UI kit / Web / Figma',330,65,18,color=MUTED)
        self.text(f'{number:02d} / 12',1410,65,20,'medium',MUTED)
        self.line(72,95,1528,95)
        self.text(title,72,180,64,'display')
        self.para(subtitle,72,227,1400,22,color=MUTED)
    def start(self,name): self.nodes.append(('raw',f'<g id="{escape(name,quote=True)}"><title>{escape(name)}</title>'))
    def end(self):self.nodes.append(('raw','</g>'))
    def rect(self,x,y,w,h,fill=PANEL,stroke=None,r=0,opacity=1):
        self.nodes.append(('raw',f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" opacity="{opacity}"'+(f' stroke="{stroke}"' if stroke else '')+'/>'))
        self.bounds.append((x,y,w,h))
    def line(self,x,y,x2,y2,color=BORDER):self.nodes.append(('raw',f'<path d="M{x} {y}H{x2}" stroke="{color}"/>' if y==y2 else f'<path d="M{x} {y}L{x2} {y2}" stroke="{color}"/>'))
    def circle(self,x,y,r,fill=PANEL,stroke=BORDER):self.nodes.append(('raw',f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{stroke}"/>'))
    def text(self,s,x,y,size=22,font='body',color=PAPER):
        self.nodes.append(('text',(s,x,y,size,font,color)));self.texts.append(s)
        self.bounds.append((x,y-size,width(s,size,font),size*1.3))
    def para(self,s,x,y,w,size=22,font='body',color=PAPER,leading=None):
        for line in wrap(s,w,size,font):
            self.text(line,x,y,size,font,color);y+=leading or size*1.55
        return y
    def label(self,s,x,y):self.text(s,x,y,18,'medium',MUTED)
    def note(self,title,body,x,y,w=690):
        self.line(x,y,x+w,y);self.text(title,x,y+45,30,'display');return self.para(body,x,y+84,w,21,color=MUTED)
    def source(self,s):
        self.line(72,self.h-90,1528,self.h-90)
        self.text(s,72,self.h-49,17,color=MUTED)
        self.text('15 de octubre de 2026',1290,self.h-49,17,color=MUTED)
    def button(self,label,x,y,w=260,style='primary',state='default'):
        self.start('Boton-'+label+'-'+state)
        fill=SAGE if style=='primary' else BG
        if state=='hover':fill='#96b5a6' if style=='primary' else '#24352f'
        if state=='disabled':fill='#374b44'
        if state=='focus':self.rect(x-5,y-5,w+10,66,BG,MUTED,6)
        self.rect(x,y,w,56,fill,SAGE if style=='primary' else BORDER,4)
        self.text(label,x+(w-width(label,18,'medium'))/2,y+35,18,'medium',BG if style=='primary' else PAPER)
        self.end()
    def field(self,label,x,y,w=600,value='',hint='',state='default',height=58):
        self.start('Campo-'+label+'-'+state);self.text(label,x,y,20,'medium')
        if state=='focus':self.rect(x-5,y+15,w+10,height+10,BG,MUTED,6)
        self.rect(x,y+20,w,height,PANEL,ERROR if state=='error' else BORDER,4)
        self.text(value or ' ',x+18,y+57,22,color='#81918b' if state=='disabled' else PAPER)
        if hint:self.para(hint,x,y+height+52,w,17,color=ERROR if state=='error' else MUTED)
        self.end()
    def steps(self,x,y,w=1320,active=0):
        self.start('Indicador-paso-'+str(active+1));self.label(f'Paso {active+1} de 3',x,y)
        for i,label in enumerate(['Datos y cantidad','Revisión','Entrada']):
            xx=x+i*w/3;current=i==active
            self.circle(xx+17,y+47,17,MUTED if current else PANEL,SAGE)
            self.text(str(i+1),xx+11,y+54,18,'medium',BG if current else MUTED)
            self.text(label,xx+46,y+54,20,'bold' if current else 'body',PAPER if current else MUTED)
            self.line(xx,y+84,xx+w/3-25,y+84,MUTED if current else BORDER)
        self.end()
    def image(self,file,x,y,w,h):
        path=ROOT/'public/artwork'/file
        if path.suffix=='.webp':path=ROOT/'evidence/ui-kit-export-camiseta.png'
        mime='image/png'
        data=base64.b64encode(path.read_bytes()).decode()
        self.nodes.append(('raw',f'<image x="{x}" y="{y}" width="{w}" height="{h}" preserveAspectRatio="xMidYMid slice" xlink:href="data:{mime};base64,{data}"/>'))
        self.bounds.append((x,y,w,h))
    def save(self,slug):
        for curves,folder in [(True,OUT),(False,OUT/'con_texto')]:
            parts=[f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1600" height="{self.h}" viewBox="0 0 1600 {self.h}"><title>{escape(self.title)}</title><desc>UI kit Fair Play. Parnofiello, capítulos 3 y 8. Formas agrupadas; fotografías originales incrustadas.</desc>']
            for kind,data in self.nodes:
                if kind=='raw':parts.append(data);continue
                s,x,y,size,font,color=data;f=FONTS[font]
                if curves:parts.append(f'<g id="Texto-{len(parts)}" aria-label="{escape(s,quote=True)}"><title>{escape(s)}</title><path fill="{color}" d="{outline(s,x,y,size,font)}"/></g>')
                else:parts.append(f'<text x="{x}" y="{y}" font-family="{f["family"]}" font-weight="{f["weight"]}" font-size="{size}" fill="{color}" xml:space="preserve">{escape(s)}</text>')
            parts.append('</svg>');target=folder/(f'{self.number:02d}-'+slug+'.svg');target.write_text('\n'.join(parts),encoding='utf-8');ET.parse(target)
        (OUT/'textos'/(f'{self.number:02d}-'+slug+'.txt')).write_text('\n'.join(s.rstrip() for s in self.texts)+'\n',encoding='utf-8')
        for x,y,w,h in self.bounds:
            if x<-.1 or y<-.1 or x+w>1600.5 or y+h>self.h+.5:
                raise ValueError(f'Elemento fuera de lámina {self.number}: {(x,y,w,h)}')

b=Board(1,'El mismo juego / Un lenguaje común','Biblioteca de interfaz de Fair Play, organizada para importar en Figma',1100)
b.text('Mirá detrás',72,405,126,'heavy');b.text('del juego',72,535,126,'heavy')
b.para('Colores, tipografías, componentes, estados y contenido. El sistema conserva la identidad de la web y vincula las reglas de escritura con cada componente.',77,625,790,26,color=MUTED)
for i,(title,body) in enumerate([
 ('Fundamentos','Paleta, contraste, tipografía y espacio'),('Componentes','Acciones, campos, navegación y mensajes'),
 ('Plantillas','Datos, revisión, QR y composiciones'),('Contenido','Voz, escritura y correcciones del libro')]):
    x=1000;y=325+i*145;b.text(title,x,y,30,'display');b.para(body,x,y+35,470,20,color=MUTED)
b.note('Cómo usar el paquete','Los SVG principales tienen texto convertido a curvas. La carpeta con_texto conserva elementos de texto; fuentes contiene las familias reales y sus licencias.',72,845,1456)
b.source('Fuente: web existente y extracto local de Diseño de contenidos, capítulos 3 y 8');b.save('portada-y-mapa')

b=Board(2,'Colores y contraste','Paleta original de Fair Play y roles semánticos tomados de la web',1310)
palette=[('Noche',BG,'Fondo principal'),('Carbón','#2e2f2f','Neutro de marca'),('Pizarra','#828a95','Neutro de marca'),('Salvia',SAGE,'Acción primaria'),('Papel',PAPER,'Texto principal'),('Superficie',PANEL,'Bloques y diálogo'),('Texto de apoyo',MUTED,'Ayuda y metadatos'),('Error',ERROR,'Mensaje y borde')]
for i,(name,color,role) in enumerate(palette):
    x=72+(i%4)*372;y=315+(i//4)*260;b.start('Color-'+name);b.rect(x,y,340,130,color,BORDER,4);b.text(name,x,y+171,26,'display');b.text(color.upper(),x,y+205,19,'medium',MUTED);b.text(role,x,y+237,17,color=MUTED);b.end()
def lum(h):
    vals=[int(h[i:i+2],16)/255 for i in [1,3,5]];vals=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in vals];return sum(v*c for v,c in zip(vals,[.2126,.7152,.0722]))
for i,(fg,bg,label) in enumerate([(PAPER,BG,'Papel sobre noche'),(BG,SAGE,'Noche sobre salvia'),(ERROR,PANEL,'Error sobre superficie')]):
    x=72+i*496;a,c=lum(fg),lum(bg);ratio=(max(a,c)+.05)/(min(a,c)+.05)
    b.rect(x,900,464,160,PANEL);b.text(f'{ratio:.2f}:1',x+24,963,43,'display');b.text(label,x+24,1006,20,color=MUTED)
b.para('Cada estado se identifica también con texto o bordes. Las proporciones verifican estos pares específicos; no certifican toda la accesibilidad del sitio.',72,1120,1420,20,color=MUTED)
b.source('Cap. 3 · Formularios y mensajes de error. La paleta es una decisión de Fair Play');b.save('colores-y-contraste')

b=Board(3,'Tipografía y espacio','Las familias activas de la web: Barlow Condensed para impacto y Manrope para lectura',1600)
b.label('Barlow Condensed · 700 / 800',72,330);b.text('MIRÁ DETRÁS DEL JUEGO',72,445,105,'heavy')
b.label('Manrope · 400 / 500 / 600 / 700',72,540);b.text('La claridad también es identidad',72,610,40,'bold')
b.para('El pasaporte es físico y lo recibís en el evento. Completá las 3 estaciones para reunir tus sellos y retirar la camiseta en el Vestuario.',72,673,1020,26)
for y,size,role in [(800,32,'Subtítulo'),(865,24,'Texto de lectura'),(925,20,'Etiqueta de campo'),(982,17,'Ayuda y metadatos')]:
    b.text(role,72,y,size,'medium' if size<32 else 'display');b.text(f'{size} px',1050,y,20,color=MUTED)
b.line(72,1030,1528,1030);b.text('Escala de espacio',72,1080,32,'display')
for i,n in enumerate([4,8,12,16,24,32,48]):
    x=72+i*150;b.rect(x,1190-n,n,n,SAGE);b.text(str(n)+' px',x,1230,18,color=MUTED)
b.note('Criterio de contenido','Mayúscula inicial en controles. Títulos y etiquetas sin punto final. Las mayúsculas expresivas de marca y títulos editoriales se conservan.',72,1280,1456)
b.source('Cap. 3 · Botones y librería de componentes. Cap. 8 · Puntuación');b.save('tipografia-y-espacio')

b=Board(4,'Acciones y estados','Enlaces para navegar; botones para actuar. La etiqueta anticipa el resultado',1240)
for i,(state,title) in enumerate([('default','Reposo'),('hover','Al pasar el cursor'),('focus','Foco de teclado'),('disabled','No disponible')]):
    x=72+i*372;b.label(title,x,330);b.button('Revisar datos' if state!='disabled' else 'Generando QR…',x,370,330,state=state);b.button('Editar datos',x,460,330,style='secondary',state=state)
b.text('Enlace con apariencia primaria',72,635,30,'display');b.button('Obtener entradas',72,680,330)
b.text('Enlace secundario',820,635,30,'display');b.text('Ver recompensas',820,718,23,'medium',MUTED);b.line(820,731,1025,731,MUTED)
b.note('Una acción por etiqueta','Usá infinitivo y objeto cuando aclare la acción: Revisar datos, Descargar QR, Borrar solicitud. Evitá Sí, No u OK como única etiqueta.',72,820)
b.note('Una jerarquía por grupo','Destacá la acción principal. La alternativa usa tratamiento secundario. Los controles se presentan con altura y foco visibles.',820,820)
b.para('Obtener entradas abre el formulario. Ver entradas lleva a la sección informativa. Descargar QR solicita el archivo: no afirma que el navegador ya lo guardó.',72,1075,1440,21,color=MUTED)
b.source('Cap. 3 · Botones y barra de navegación superior');b.save('acciones-y-estados')

b=Board(5,'Campos y selectores','Etiquetas visibles, ayuda junto al campo y errores específicos',1500)
for i,(state,value,hint,title) in enumerate([
 ('default','','Usá el formato nombre@dominio.com','Reposo'),('focus','ana@example.com','Usá el formato nombre@dominio.com','Foco'),
 ('complete','ana@example.com','Ejemplo de dato completo','Completo'),('error','sin-formato','Revisá el correo. Usá el formato nombre@dominio.com.','Error'),
 ('disabled','Generando QR…','Control no disponible durante la acción','No disponible'),('default','','Por ejemplo, acceso sin escalones. El pedido de demostración no se envía.','Área de texto')]):
    x=72+(i%2)*748;y=330+(i//2)*265;b.label(title,x,y);b.field('Apoyo para la visita (opcional)' if i==5 else 'Correo electrónico',x,y+44,680,value,hint,state,90 if i==5 else 58)
b.text('Cantidad de entradas',72,1175,28,'display');b.text('De 1 a 6 personas en total, incluyéndote',72,1217,20,color=MUTED)
for i,n in enumerate([1,3,6]):
    x=820+i*230;b.rect(x,1130,52,52,PANEL,BORDER);b.text('−',x+18,1165,25,color=MUTED if n==1 else PAPER);b.text(str(n),x+85,1165,24,'medium');b.rect(x+130,1130,52,52,PANEL,BORDER);b.text('+',x+147,1165,25,color=MUTED if n==6 else PAPER)
b.para('No reemplazar etiquetas con ejemplos. No usar el color como única señal del error. El foco vuelve al primer campo que necesita corrección.',72,1310,1420,21,color=MUTED)
b.source('Cap. 3 · Formularios y mensajes de error');b.save('campos-y-selectores')

b=Board(6,'Navegación y progreso','Nombres estables y un indicador para las etapas lógicas de la solicitud',1340)
b.rect(72,310,1456,94,PANEL,BORDER);b.text('FAIR PLAY',100,367,29,'heavy')
for i,label in enumerate(['Inicio','El evento','Recompensas','Entradas']):
    x=680+i*200;b.text(label,x,363,20,'medium',PAPER if i==3 else MUTED)
b.line(1280,378,1365,378,MUTED)
for active in range(3):b.steps(100,495+active*190,1360,active)
b.note('La sección actual se reconoce','La web combina subrayado y estado accesible. En móvil mantiene la etiqueta Menú junto al ícono; los destinos siguen nombrados.',72,1070,1456)
b.source('Cap. 3 · Stepper y barras de navegación');b.save('navegacion-y-progreso')

b=Board(7,'Mensajes y diálogos','El contenido cambia según la situación y permite decidir cómo continuar',1530)
for i,(label,title,body,color) in enumerate([
 ('Información persistente','Solicitud de demostración','Esta es una demostración: no se reserva un lugar ni se envía un correo. El QR no tiene validez de ingreso.',SAGE),
 ('Error recuperable','No pudimos generar tu QR','Tus datos siguen disponibles. Podés volver a intentar o revisarlos antes de continuar.',ERROR),
 ('Resultado','Tu QR de prueba está listo','Podés descargarlo para probar el recorrido. No tiene validez de ingreso.',SAGE)]):
    x=72+i*496;b.rect(x,320,464,315,PANEL);b.rect(x,320,3,315,color);b.label(label,x+24,362);b.para(title,x+24,416,412,30,'display');b.para(body,x+24,493,410,20,color=MUTED)
b.start('Dialogo-borrado');b.rect(310,720,980,424,PANEL,SAGE,4);b.text('¿Querés borrar la solicitud?',350,798,45,'display');b.para('Se borrarán la cantidad y los datos que ingresaste en esta demostración.',350,862,880,23,color=MUTED)
b.button('Seguir con la solicitud',350,1000,430,'secondary',state='focus');b.button('Borrar solicitud',800,1000,430);b.end()
b.note('Jerarquía y foco','Borrar solicitud confirma la decisión y es primario. El foco inicial permanece en Seguir con la solicitud. Tab y Shift+Tab circulan entre ambas opciones; Escape cierra y devuelve el foco al origen.',72,1230,1456)
b.source('Cap. 3 · Diálogos, mensajes de error y notificaciones');b.save('mensajes-y-dialogos')

b=Board(8,'Formulario de entradas','Plantilla de una columna: contexto, cantidad, contacto y acción de revisión',1760)
b.rect(315,305,970,1205,PANEL,BORDER);b.steps(365,350,850,0);b.text('Obtené tus entradas',365,520,46,'display')
b.para('La entrada es gratuita. Elegí la cantidad y completá tus datos.',365,565,850,22,color=MUTED)
b.text('Sábado 12 de diciembre de 2026',365,640,24,'medium');b.text('Desde las 8:00 h, sin turnos · Club Arquitectura, CABA',365,685,20,color=MUTED);b.text('Av. Francisco Beiró 2116, CABA',365,722,20,color=MUTED)
b.rect(365,755,870,98,'#1c3434');b.para('Esta es una demostración: no se reserva un lugar ni se envía un correo. El QR no tiene validez de ingreso.',385,791,825,19,color=MUTED)
b.text('Cantidad de entradas: 1',365,905,26,'display');b.text('De 1 a 6 personas en total, incluyéndote',365,946,18,color=MUTED)
b.field('Nombre y apellido',365,1010,870,'Ana Prueba');b.field('Correo electrónico',365,1137,870,'ana@example.com','Usá el formato nombre@dominio.com')
b.text('Apoyo para la visita (opcional)',365,1310,20,'medium');b.text('Ejemplo: acceso sin escalones',365,1350,19,color=MUTED)
b.button('Volver al evento',365,1412,380,'secondary');b.button('Revisar datos',765,1412,470)
b.para('Los errores se ubican junto al campo correspondiente. Cantidad y datos se conservan al volver desde Revisión. La demostración no envía ni guarda datos.',72,1570,1430,20,color=MUTED)
b.source('Cap. 3 · Formularios, mensajes de error y botones');b.save('plantilla-datos-y-cantidad')

b=Board(9,'Revisión y QR de prueba','Confirmación editable y resultado honesto, sin prometer reservas reales',1660)
for x in [72,820]:b.rect(x,310,708,1050,PANEL,BORDER)
b.text('Revisá tus datos',105,380,43,'display');b.label('Paso 2 de 3 / Revisión',105,427)
rows=[('Día','Sábado 12 de diciembre de 2026'),('Acceso','Desde las 8:00 h, sin turnos'),('Sede','Club Arquitectura, CABA'),('Cantidad','1 entrada / Cambiar cantidad'),('Nombre','Ana Prueba'),('Correo','ana@example.com / Corregir correo'),('Apoyo','Sin pedido de apoyo'),('Total','Gratis')]
for i,(label,content) in enumerate(rows):
    y=495+i*83;b.label(label,105,y);b.para(content,290,y,440,18);b.line(105,y+42,745,y+42)
b.button('Editar datos',105,1210,270,'secondary');b.button('Confirmar y generar QR',395,1210,350)
b.text('Tu QR de prueba está listo',853,380,40,'display');b.label('Paso 3 de 3 / Entrada',853,427)
b.para('No tiene validez de ingreso. No se reservó un lugar ni se envió un correo.',853,485,640,21,color=MUTED)
qr=ROOT/'evidence/ui-kit-export-qr.svg'
if qr.exists():
    root=ET.parse(qr).getroot();inner=''.join(ET.tostring(child,encoding='unicode') for child in root)
    b.nodes.append(('raw',f'<svg x="1030" y="580" width="280" height="280" viewBox="{root.attrib["viewBox"]}">{inner}</svg>'))
b.text('QR de prueba / Sin validez de ingreso',925,916,20,'medium')
b.para('En la versión real, presentarías el QR en la acreditación para recibir el pasaporte físico. Los sellos se obtienen en las 3 estaciones.',853,980,640,21,color=MUTED)
b.button('Descargar QR',853,1180,300);b.button('Volver al inicio',1173,1180,320,'secondary')
b.para('Si cerrás o recargás la página, los datos y el QR se pierden. Si la descarga no aparece, podés abrir el QR para guardarlo.',853,1290,640,18,color=MUTED)
b.note('Vuelta y recuperación','Se conservan los datos al editar. La descarga puede repetirse. El mensaje indica que se solicitó la descarga; no afirma que el archivo ya está guardado.',72,1420,1456)
b.source('Cap. 3 · Diálogos, formularios y mensajes de error');b.save('plantillas-revision-y-qr')

b=Board(10,'Composiciones y adaptación','Producto, planificación de visita y comportamiento en móvil',1550)
b.start('Tarjeta-producto');b.image('products/camiseta-product.webp',72,320,470,626);b.rect(72,946,470,185,PANEL);b.text('Camiseta Fair Play',96,998,35,'display');b.para('Completá las 3 estaciones y reuní tus sellos',96,1042,420,21,color=MUTED);b.end()
b.start('Planificar-visita');b.rect(586,320,570,812,PANEL);b.text('Planificá tu visita',618,386,40,'display')
for i,(label,text) in enumerate([('Cuándo','Sábado 12 de diciembre de 2026\nDesde las 8:00 h, sin turnos'),('Dónde','Club Arquitectura\nAv. Francisco Beiró 2116, CABA'),('Acceso','Entrada gratuita\nDe 1 a 6 personas por solicitud, incluyéndote')]):
    y=460+i*168;b.label(label,618,y);b.para(text,618,y+46,500,22);b.line(618,y+125,1120,y+125)
b.button('Obtener entradas',618,1010,500);b.end()
b.start('Vista-movil');b.rect(1200,320,328,812,PANEL,BORDER,8);b.text('Móvil',1220,372,34,'display');b.para('Una columna para completar y leer',1220,420,280,23,'medium');b.field('Correo electrónico',1220,560,288,'ana@example.com');b.button('Revisar datos',1220,740,288);b.button('Editar datos',1220,822,288,'secondary');b.para('Acciones apiladas cuando el ancho lo requiere',1220,950,280,20,color=MUTED);b.end()
b.note('Reglas de adaptación','El contenido mantiene su orden lógico. Los campos ocupan una columna; las acciones se adaptan al ancho. El foco y los mensajes siguen visibles. Las imágenes conservan su proporción.',72,1220,1456)
b.source('Cap. 3 · Contenido antes que componente y formularios. Las fotografías son originales del proyecto');b.save('composiciones-y-responsive')

b=Board(11,'Voz y escritura','Voseo en las explicaciones; infinitivos en las acciones. Convenciones del proyecto a validar con personas',1540)
rules=[('Acción predecible','Revisar datos','Continuar, OK','Cap. 3 · Botones'),('Vocabulario estable','Entradas, pasaporte, sellos, recompensas','Tickets, pase y voucher para lo mismo','Cap. 3 · Voz y tono'),('Fecha y hora','12 de diciembre de 2026 / 8:00 h','12 de Diciembre / 08:00 hs.','Cap. 8 · Fechas y tiempo'),('Títulos y etiquetas','Correo electrónico','CORREO ELECTRÓNICO.','Cap. 3 · Botones; cap. 8 · Puntuación'),('Extranjerismo necesario','Sportswashing: lavado de imagen a través del deporte','Una palabra inglesa sin explicación','Cap. 8 · Extranjerismos'),('Error útil','Revisá el correo. Usá el formato nombre@dominio.com.','Error 400, algo salió mal','Cap. 3 · Mensajes de error'),('Resultado honesto','Se solicitó la descarga','Archivo guardado sin poder comprobarlo','Cap. 3 · Mensajes de error')]
for i,(title,good,bad,source) in enumerate(rules):
    y=330+i*148;b.line(72,y-20,1528,y-20);b.text(title,72,y+19,27,'display');b.para(good,420,y+17,570,21);b.para('Evitar: '+bad,1030,y+17,480,19,color=MUTED);b.text(source,420,y+92,16,color=MUTED)
b.source('Fuente: Diseño de contenidos, Marisol Parnofiello, capítulos 3 y 8');b.save('voz-y-reglas-de-escritura')

b=Board(12,'Del libro a la interfaz','Desvíos corregidos y límites de la fundamentación: referencias por apartado, sin inventar páginas',1740)
changes=[
 ('Horario visible','08:00 h pasa a 8:00 h. Se conserva el instante técnico del evento.','Cap. 8 · Algunos consejos sobre tiempo'),
 ('Jerarquía del diálogo','Borrar solicitud confirma y se destaca. Seguir con la solicitud mantiene el foco inicial.','Cap. 3 · Diálogos'),
 ('Decisión explícita','¿Querés borrar la solicitud? coincide con Borrar solicitud y explica qué datos se pierden.','Cap. 3 · Diálogos y botones'),
 ('Foco contenido','Tab y Shift+Tab circulan entre las 2 decisiones. Escape cierra y devuelve el foco al origen.','Cap. 3 · Diálogos, accesibilidad'),
 ('Destino predecible','Sumate a la experiencia pasa a Ver entradas para anticipar la sección de destino.','Cap. 3 · Botones y navegación'),
 ('Puntuación de títulos','El brillo puede taparlo todo deja de llevar punto final.','Cap. 8 · Puntuación'),
 ('Pautas junto al componente','La biblioteca se entrega como láminas SVG organizadas para Figma, con estados y criterios de escritura.','Cap. 3 · Librería de componentes')]
for i,(title,body,source) in enumerate(changes):
    y=320+i*151;b.line(72,y-15,1528,y-15);b.text(title,72,y+28,28,'display');b.para(body,435,y+22,1055,22);b.text(source,435,y+100,17,color=MUTED)
b.note('Qué fundamenta el libro','Contenido claro, componentes adecuados, errores útiles, decisiones predecibles y estilo consistente. La voz y el vocabulario siguen pendientes de contrastar con personas.',72,1420)
b.note('Qué define Fair Play','Paleta, fotografías, fuentes, pasaporte 3D y animaciones. La regla de no usar menú hamburguesa en navegación lateral no se extrapola al menú superior.',820,1420)
b.source('Fuente: extracto local de Diseño de contenidos, capítulos 3 y 8. Sin pruebas con participantes');b.save('revision-marisol')

if MISSING:raise ValueError('Glifos ausentes: '+repr(MISSING))
tokens={'project':'Fair Play','format':'SVG','date':'2026-10-15','colors':{name:color for name,color,_ in palette},'spacing':[4,8,12,16,24,32,48],'fonts':['Barlow Condensed','Manrope'],'controlHeight':48}
(OUT/'tokens.json').write_text(json.dumps(tokens,ensure_ascii=False,indent=2),encoding='utf-8')
(OUT/'LEEME.txt').write_text('FAIR PLAY / UI KIT PARA FIGMA\n\n1. Descomprimí el ZIP.\n2. Arrastrá los 12 SVG principales al lienzo de Figma. Tienen texto en curvas para conservar la apariencia.\n3. Cada lámina tiene formas y grupos separados; las fotografías originales están incrustadas.\n4. con_texto contiene las mismas láminas con elementos SVG de texto. Instalá las fuentes incluidas si las vas a usar; Figma puede convertir los textos a vectores al importar.\n5. textos contiene todos los textos para copiar y editar dentro de Figma.\n\nLos SVG no crean componentes, variantes ni auto-layout nativos de Figma. Son una base vectorial organizada para armarlos allí.\nLas fuentes incluyen sus licencias SIL OFL. El QR es de prueba y no tiene validez de ingreso.\nLa web conserva las correcciones del libro; la página del UI kit fue retirada.\n',encoding='utf-8')
ZIP=ROOT.parent/'FairPlay_UI_Kit_SVG.zip'
with zipfile.ZipFile(ZIP,'w',zipfile.ZIP_DEFLATED) as z:
    for file in OUT.rglob('*'):
        if file.is_file():z.write(file,Path('FairPlay_UI_Kit_SVG')/file.relative_to(OUT))
print(json.dumps({'boards':12,'svg_files':24,'output':str(OUT),'zip':str(ZIP),'missingGlyphs':len(MISSING)},ensure_ascii=False))

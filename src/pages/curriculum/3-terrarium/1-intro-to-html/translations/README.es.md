# Terrarium Project Parte 1: Introducción a HTML

![Introducción a HTML](../../../sketchnotes/webdev101-html.png)
> Sketchnote por [Tomomi Imura](https://twitter.com/girlie_mac)

## [Pre-lecture prueba](https://happy-mud-02d95f10f.azurestaticapps.net/quiz/15)

### Introducción:

HTML, o HyperText Markup Language, es el "esqueleto" de la web. Si CSS 'viste' su HTML y JavaScript le da vida, el cuerpo de su aplicación web es su HTML. La sintaxis de HTML incluso refleja esa idea, ya que incluye etiquetas "head", "body" y "footer".

En esta lección, usaremos HTML para diseñar el 'esqueleto' de la interfaz de nuestro terrario virtual. Tendrá un título y tres columnas: una columna derecha e izquierda donde viven las plantas que se pueden arrastrar, y un área central que será el terrario de vidrio real. Al final de esta lección, podrá ver las plantas en las columnas, pero la interfaz se verá un poco extraña; no se preocupe, en la siguiente sección agregará estilos CSS a la interfaz para que se vea mejor.

### Tarea:

En su computadora, cree una carpeta llamada 'terrario' y dentro de ella, un archivo llamado 'index.html'. Puede hacer esto en Visual Studio Code después de crear su carpeta de terrario abriendo una nueva ventana de VS Code, haciendo clic en 'abrir carpeta' y navegando a su nueva carpeta. Haga clic en el botón pequeño 'archivo' en el panel del Explorador y cree el nuevo archivo:

! [explorador en VS Code](images / vs-code-index.png)

> Los archivos index.html indican a un navegador que es el archivo predeterminado en una carpeta; Las URL como `https://anysite.com/test` se pueden construir usando una estructura de carpetas que incluya una carpeta llamada `test` con `index.html` dentro; `Index.html` no tiene que aparecer en una URL.

---

## 1. Las etiquetas DocType y html

La primera línea de un archivo HTML es su doctype. Es un poco sorprendente que necesite tener esta línea en la parte superior del archivo, pero le dice a los navegadores más antiguos que el navegador necesita representar la página en un modo estándar, siguiendo la especificación html actual.

> Consejo: en VS Code, puede colocar el cursor sobre una etiqueta y obtener información sobre su uso en las guías de referencia de MDN.

La segunda línea debe ser la etiqueta de apertura de la etiqueta `<html>`, seguida ahora por su etiqueta de cierre. Estas etiquetas son los elementos raíz de su interfaz.

### Tarea:

Agrega estas líneas en la parte superior de tu archivo `index.html`:


```HTML
<!DOCTYPE html>
<html></html>
```

✅ Hay algunos modos diferentes que se pueden determinar configurando DocType con una cadena de consulta: [Modo Quirks y Modo estándar](https://developer.mozilla.org/docs/Web/HTML/Quirks_Mode_and_Standards_Mode). Estos modos solían admitir navegadores realmente antiguos que no se utilizan normalmente en la actualidad (Netscape Navigator 4 e Internet Explorer 5). Puede ceñirse a la declaración de tipo de documento estándar.

---

## 2. El 'encabezado' del documento

El área 'encabezado' del documento HTML incluye información crucial sobre su página web, también conocida como [metadatos](https://developer.mozilla.org/docs/Web/HTML/Element/meta). En nuestro caso, le decimos al servidor web al que se enviará esta página para que sea renderizada cuatro cosas:

- el título de la página
- metadatos de la página que incluyen:
    - el 'conjunto de caracteres', que indica qué codificación de caracteres se utiliza en la página
    - información del navegador, incluido `x-ua-compatible`, que indica que el navegador IE = edge es compatible
    - información sobre cómo debería comportarse la ventana gráfica cuando se carga. Configurar la ventana gráfica para que tenga una escala inicial de 1 controla el nivel de zoom cuando la página se carga por primera vez.

### Tarea:

Agregue un bloque de 'encabezado' a su documento entre las etiquetas de apertura y cierre `<html>`.

```html
<head>
	<title>Bienvenida a mi terrario virtual</title>
	<meta charset="utf-8" />
	<meta http-equiv="X-UA-Compatible" content="IE=edge" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
```

✅ ¿Qué pasaría si configuras una metaetiqueta de ventana gráfica como esta: `<meta name =" viewport "content =" width = 600 ">`? Obtenga más información sobre [viewport](https://developer.mozilla.org/docs/Web/HTML/Viewport_meta_tag).

---

## 3. El `cuerpo` del documento

### Etiquetas HTML

En HTML, agrega etiquetas a su archivo .html para crear elementos de una página web. Cada etiqueta generalmente tiene una etiqueta de apertura y cierre, como esta: `<p>hola</p>` para indicar un párrafo. Cree su interfaz `<body>` agregando un conjunto de etiquetas dentro del par de etiquetas `<html>`; su marcado ahora se ve así:

### Tarea:

```html
<!DOCTYPE html>
<html>
	<head>
		<title>Bienvenida a mi terrario virtual</title>
		<meta charset="utf-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
	</head>
	<body></body>
</html>
```

Ahora, puede comenzar a construir su página. Normalmente, usa etiquetas `<div>` para crear los elementos separados en una página. Crearemos una serie de elementos `<div>` que contendrán imágenes.

### Imágenes

Una etiqueta html que no necesita una etiqueta de cierre es la etiqueta `<img>`, porque tiene un elemento `src` que contiene toda la información que la página necesita para representar el elemento.

Cree una carpeta en su aplicación llamada `images` y en ella, agregue todas las imágenes en la [carpeta del código fuente](../images); (hay 14 imágenes de plantas).

### Tarea:

Agregue esas imágenes de plantas en dos columnas entre las etiquetas `<body> </body>`:


```html
<div id="page">
	<div id="left-container" class="container">
		<div class="plant-holder">
			<img class="plant" alt="plant" id="plant1" src="./images/plant1.png" />
		</div>
		<div class="plant-holder">
			<img class="plant" alt="plant" id="plant2" src="./images/plant2.png" />
		</div>
		<div class="plant-holder">
			<img class="plant" alt="plant" id="plant3" src="./images/plant3.png" />
		</div>
		<div class="plant-holder">
			<img class="plant" alt="plant" id="plant4" src="./images/plant4.png" />
		</div>
		<div class="plant-holder">
			<img class="plant" alt="plant" id="plant5" src="./images/plant5.png" />
		</div>
		<div class="plant-holder">
			<img class="plant" alt="plant" id="plant6" src="./images/plant6.png" />
		</div>
		<div class="plant-holder">
			<img class="plant" alt="plant" id="plant7" src="./images/plant7.png" />
		</div>
	</div>
	<div id="right-container" class="container">
		<div class="plant-holder">
			<img class="plant" alt="plant" id="plant8" src="./images/plant8.png" />
		</div>
		<div class="plant-holder">
			<img class="plant" alt="plant" id="plant9" src="./images/plant9.png" />
		</div>
		<div class="plant-holder">
			<img class="plant" alt="plant" id="plant10" src="./images/plant10.png" />
		</div>
		<div class="plant-holder">
			<img class="plant" alt="plant" id="plant11" src="./images/plant11.png" />
		</div>
		<div class="plant-holder">
			<img class="plant" alt="plant" id="plant12" src="./images/plant12.png" />
		</div>
		<div class="plant-holder">
			<img class="plant" alt="plant" id="plant13" src="./images/plant13.png" />
		</div>
		<div class="plant-holder">
			<img class="plant" alt="plant" id="plant14" src="./images/plant14.png" />
		</div>
	</div>
</div>
```

> Nota: Spans vs. Divs. Los Divs se consideran elementos de 'bloque' y los Spans están 'en línea'. ¿Qué pasaría si transformaras estos divs en tramos?

Con este marcado, las plantas ahora aparecen en la pantalla. Se ve bastante mal, porque aún no están diseñados con CSS, y lo haremos en la próxima lección.

Cada imagen tiene una etiqueta alt que aparecerá incluso si no puede ver o representar una imagen. Este es un elemento importante a incluir para la accesibilidad. Obtenga más información sobre accesibilidad en lecciones futuras; Por ahora, recuerde que es importante permitir que los lectores de pantalla recorran su aplicación web para que los usuarios con discapacidad visual puedan utilizar su sitio web.

✅ ¿Notaste que cada imagen tiene la misma etiqueta alt? ¿Es esta una buena práctica? ¿Por qué o por qué no? ¿Puedes mejorar este código?

---

## 4. Marcado semántico

En general, es preferible usar 'semántica' al escribir HTML. Qué significa eso? Significa que utiliza etiquetas HTML de la forma en que fueron diseñadas: para representar sus datos; por lo que una etiqueta H1 siempre debe estar presente en una página

Agrega la siguiente línea justo debajo de tu etiqueta de apertura `<body>`:

```html
<h1>Mi terrario</h1>
```

El uso de marcado semántico, como que los encabezados sean `<h1>` y las listas desordenadas se representen como `<ul>`, ayuda a los lectores de pantalla a navegar por una página. En general, los botones deben escribirse como `<button>` y las listas deben ser `<li>`. Si bien es _posible_ usar elementos `<span>` de estilo especial con controladores de clic para simular botones, es mejor que los usuarios con capacidades diferentes usen tecnologías para determinar en qué parte de una página reside un botón e interactuar con él, si el elemento aparece como un botón. Por esta razón, intente utilizar el marcado semántico tanto como sea posible.

✅ Eche un vistazo a un lector de pantalla y [cómo interactúa con una página web](https://www.youtube.com/watch?v=OUDV1gqs9GA). ¿Puedes ver por qué tener un marcado no semántico podría confundir al usuario?

## 5. El terrario

La última parte de esta interfaz implica la creación de marcas que se diseñarán para crear un terrario.

### Tarea:

Agregue este marcado encima de la última etiqueta `</div>`:

```html
<div id="terrarium">
	<div class="jar-top"></div>
	<div class="jar-walls">
		<div class="jar-glossy-long"></div>
		<div class="jar-glossy-short"></div>
	</div>
	<div class="dirt"></div>
	<div class="jar-bottom"></div>
</div>
```

✅ Aunque agregó este marcado a la pantalla, no ve absolutamente nada renderizado. ¿Por qué?

---

🚀 Desafío: hay algunas etiquetas "antiguas" salvajes en HTML con las que todavía es divertido jugar, aunque no debes usar etiquetas obsoletas como [estas etiquetas](https://developer.mozilla.org/docs/Web/HTML/Element) en su marcado. Aún así, ¿puede usar la antigua etiqueta `<marquee>` para hacer que el título h1 se desplace horizontalmente? (si lo hace, no olvide quitarlo después)

## [Post-lecture prueba](https://happy-mud-02d95f10f.azurestaticapps.net/quiz/16)

## Revisión y autoestudio

HTML es el sistema de bloques de construcción 'probado y verdadero' que ha ayudado a convertir la web en lo que es hoy. Aprenda un poco sobre su historia estudiando algunas etiquetas antiguas y nuevas. ¿Puedes averiguar por qué algunas etiquetas quedaron obsoletas y otras se agregaron? ¿Qué etiquetas podrían introducirse en el futuro?

** Tarea: [Practica tu HTML: crea una maqueta de blog](assignment.es.md)
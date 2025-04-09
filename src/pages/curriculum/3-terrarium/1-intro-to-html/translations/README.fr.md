# Projet Terrarium Partie 1 : Introduction au HTML

![Introduction au HTML](../../../sketchnotes/webdev101-html.png)
> Sketchnote par [Tomomi Imura](https://twitter.com/girlie_mac)

## Quiz préalable

[Quiz préalable](https://happy-mud-02d95f10f.azurestaticapps.net/quiz/15?loc=fr)

### Introduction

Le langage HTML (HyperText Markup Language) est le "squelette" du Web. Si le CSS "habille" votre HTML et JavaScript lui donne vie, HTML est le corps de votre application Web. La syntaxe du HTML reflète même cette idée, puisqu'elle comprend des balises "head", "body" et "footer".

Dans cette leçon, nous allons utiliser le HTML pour mettre en page le "squelette" de l'interface de notre terrarium virtuel. Elle comportera un titre et trois colonnes : une colonne de droite et une colonne de gauche où se trouvent les plantes que l'on peut faire glisser, et une zone centrale qui sera le véritable terrarium en verre. À la fin de cette leçon, vous serez en mesure de voir les plantes dans les colonnes, mais l'interface aura un aspect un peu étrange ; ne vous inquiétez pas, dans la section suivante, vous ajouterez des styles CSS à l'interface pour l'améliorer.

### Tâche

Sur votre ordinateur, créez un dossier appelé "terrarium" et, à l'intérieur, un fichier appelé "index.html". Vous pouvez le faire dans Visual Studio Code après avoir créé votre dossier terrarium en ouvrant une nouvelle fenêtre VS Code, en cliquant sur "Ouvrir le dossier" et en naviguant vers votre nouveau dossier. Cliquez sur le petit bouton "file" dans le panneau de l'explorateur et créez le nouveau fichier :

![explorer in VS Code](../images/vs-code-index.png)

Ou alors :

Utilisez ces commandes sur votre terminal git :
* `mkdir terrarium`
* `cd terrarium`
* `touch index.html`
* `code index.html` ou `nano index.html`

> Les fichiers index.html indiquent au navigateur qu'il s'agit du fichier par défaut d'un dossier ; des URL telles que `https://anysite.com/test` peuvent être construites à l'aide d'une structure de dossiers comprenant un dossier appelé `test` avec `index.html` à l'intérieur ; `index.html` ne doit pas nécessairement apparaître dans une URL.

---

## Les balises DocType et html

La première ligne d'un fichier HTML est son doctype. Il est un peu surprenant que cette ligne doive figurer tout en haut du fichier, mais elle indique aux navigateurs plus anciens que le navigateur doit rendre la page en mode standard, conformément à la spécification html actuelle.

> Conseil : dans VS Code, vous pouvez passer la souris sur une balise et obtenir des informations sur son utilisation dans les guides de référence MDN.

La deuxième ligne doit être la balise d'ouverture de la balise `<html>`, suivie tout de suite par sa balise de fermeture `</html>`. Ces balises sont les éléments racine de votre interface.

### Tâche

Ajoutez ces lignes en haut de votre fichier `index.html` :

```HTML
<!DOCTYPE html>
<html></html>
```

✅ Il existe quelques modes différents qui peuvent être déterminés en définissant le DocType avec une chaîne d'interrogation: [Quirks Mode and Standards Mode](https://developer.mozilla.org/docs/Web/HTML/Quirks_Mode_and_Standards_Mode). Ces modes permettaient de prendre en charge des navigateurs très anciens qui ne sont plus utilisés de nos jours (Netscape Navigator 4 et Internet Explorer 5). Vous pouvez vous en tenir à la déclaration doctype standard.

---

## La "tête" du document

La zone "head" du document HTML contient des informations essentielles sur votre page Web, également appelées [métadonnées](https://developer.mozilla.org/docs/Web/HTML/Element/meta). Dans notre cas, nous indiquons au serveur web auquel cette page sera envoyée pour être rendue, ces quatre choses :

-   le titre de la page
-   les métadonnées de la page dont :
    -   le "jeu de caractères", qui indique le codage des caractères utilisé dans la page.
    -   des informations sur le navigateur, notamment `x-ua-compatible` qui indique que le navigateur IE=edge est pris en charge
    -   des informations sur la façon dont la fenêtre d'affichage doit se comporter lorsqu'elle est chargée. Le fait de donner à la fenêtre d'affichage une échelle initiale de 1 permet de contrôler le niveau de zoom lors du premier chargement de la page.

### Tâche

Ajoutez un bloc "head" à votre document, entre les balises d'ouverture et de fermeture `<html>`.

```html
<head>
	<title>Welcome to my Virtual Terrarium</title>
	<meta charset="utf-8" />
	<meta http-equiv="X-UA-Compatible" content="IE=edge" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
```

✅ Que se passerait-il si vous définissiez une métabalise viewport comme ceci : `<meta name="viewport" content="width=600">`? En savoir plus sur le [viewport](https://developer.mozilla.org/docs/Web/HTML/Viewport_meta_tag).

---

## Le "corps" du document

### Balises HTML

En HTML, vous ajoutez des balises à votre fichier .html pour créer les éléments d'une page Web. Chaque balise a généralement une balise d'ouverture et de fermeture, comme ceci : `<p>hello</p>` pour indiquer un paragraphe. Créez le corps de votre interface en ajoutant un ensemble de balises `<body>` à l'intérieur de la paire de balises `<html>` ; votre balisage ressemble maintenant à ceci :

### Tâche

```html
<!DOCTYPE html>
<html>
	<head>
		<title>Welcome to my Virtual Terrarium</title>
		<meta charset="utf-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
	</head>
	<body></body>
</html>
```

Maintenant, vous pouvez commencer à construire votre page. Normalement, vous utilisez les balises `<div>` pour créer les différents éléments d'une page. Nous allons créer une série d'éléments `<div>` qui contiendront des images.

### Images

Une balise html qui n'a pas besoin de balise de fermeture est la balise `<img>`, car elle possède un élément `src` qui contient toutes les informations dont la page a besoin pour rendre l'élément.

Créez un dossier dans votre application appelé `images` et ajoutez-y toutes les images du [dossier de code source](../solution/images) ; (il y a 14 images de plantes).

### Tâche

Ajoutez ces images de plantes dans deux colonnes entre les balises `<body></body>` :

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

> Note: Spans et Divs. Les divs sont considérés comme des éléments de type "bloc", tandis que les spans sont "en ligne". Que se passerait-il si vous transformiez ces divs en spans ?

Avec ce balisage, les plantes apparaissent maintenant à l'écran. L'apparence est assez mauvaise, car elles n'ont pas encore été stylisées à l'aide de CSS, ce que nous ferons dans la prochaine leçon.

Chaque image possède un texte alternatif qui s'affiche même si vous ne pouvez pas voir ou rendre l'image. Il s'agit d'un attribut important à inclure pour l'accessibilité. Vous en saurez plus sur l'accessibilité dans les prochaines leçons ; pour l'instant, souvenez-vous que l'attribut alt fournit des informations alternatives pour une image si, pour une raison ou une autre, un utilisateur ne peut pas la voir (en raison d'une connexion lente, d'une erreur dans l'attribut src ou si l'utilisateur utilise un lecteur d'écran).

✅ Avez-vous remarqué que chaque image a la même balise alt ? Est-ce une bonne pratique ? Pourquoi ou pourquoi pas ? Pouvez-vous améliorer ce code ?

---

## Le balisage sémantique

En général, il est préférable d'utiliser une "sémantique" significative lors de l'écriture du HTML. Qu'est-ce que cela signifie ? Cela signifie que vous utilisez les balises HTML pour représenter le type de données ou d'interaction pour lequel elles ont été conçues. Par exemple, le texte du titre principal d'une page doit utiliser une balise `<h1>`.

### Tâche

Ajoutez la ligne suivante juste en dessous de votre balise d'ouverture `<body>` :

```html
<h1>My Terrarium</h1>
```

L'utilisation de balises sémantiques, telles que des en-têtes `<h1>` et des listes non ordonnées rendues sous la forme de `<ul>`, aide les lecteurs d'écran à naviguer dans une page. En général, les boutons doivent être écrits sous la forme `<button>` et les listes sous la forme `<li>`. S'il est _possible_ d'utiliser des éléments `<span>` spécialement stylisés avec des gestionnaires de clics pour simuler des boutons, il est préférable pour les utilisateurs handicapés d'utiliser des technologies permettant de déterminer où se trouve un bouton sur une page et d'interagir avec lui, si l'élément apparaît comme un bouton. Pour cette raison, essayez d'utiliser le balisage sémantique autant que possible.

✅ Regardez un lecteur d'écran et [comment il interagit avec une page Web](https://www.youtube.com/watch?v=OUDV1gqs9GA). Pouvez-vous comprendre pourquoi un balisage non sémantique peut frustrer l'utilisateur ?

## Le terrarium

La dernière partie de cette interface consiste à créer des balises qui seront stylisées pour créer un terrarium.

### Tâche

Ajoutez cette balise au-dessus de la dernière balise `</div>` :

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

✅ Bien que vous ayez ajouté cette balise à l'écran, vous ne voyez absolument rien rendre. Pourquoi ?

---

## 🚀Défi

Il existe quelques "vieilles" balises sauvages en HTML avec lesquelles il est encore amusant de jouer, même si vous ne devriez pas utiliser des balises obsolètes telles que [ces balises](https://developer.mozilla.org/docs/Web/HTML/Element#Obsolete_and_deprecated_elements) dans votre balisage. Pouvez-vous utiliser l'ancienne balise `<marquee>` pour faire défiler horizontalement le titre h1 ? (si vous le faites, n'oubliez pas de la supprimer ensuite)

## Quiz de validation des connaissances

[Quiz de validation des connaissances](https://happy-mud-02d95f10f.azurestaticapps.net/quiz/16?loc=fr)

## Révision et autoformation

Le HTML est le système de blocs de construction qui a contribué à faire du Web ce qu'il est aujourd'hui. Apprenez-en un peu plus sur son histoire en étudiant certaines balises anciennes et nouvelles. Pouvez-vous comprendre pourquoi certaines balises ont été supprimées et d'autres ajoutées ? Quelles balises pourraient être introduites à l'avenir ?



## Exercice

[Pratiquez votre HTML : Construisez une maquette de blog](assignment.fr.md)

# Projet d'extension de navigateur Partie 1: Tout sur les navigateurs

![Sketchnote sur les navigateurs](../../../sketchnotes/browser.jpg)
> Sketchnote par [Wassim Chegham](https://dev.to/wassimchegham/ever-wondered-what-happens-when-you-type-in-a-url-in-an-address-bar-in-a-browser-3dob)

## Quiz préalable

[Quiz préalable](https://happy-mud-02d95f10f.azurestaticapps.net/quiz/23?loc=fr)

### Introduction

Les extensions de navigateur ajoutent des fonctionnalités supplémentaires à un navigateur. Mais avant d'en créer une, vous devez en savoir un peu plus sur la façon dont les navigateurs fonctionnent.

### À propos du navigateur

Dans cette série de leçons, vous apprendrez à créer une extension de navigateur qui fonctionnera sur les navigateurs Chrome, Firefox et Edge. Dans cette partie, vous découvrirez le fonctionnement des navigateurs et vous échafauderez les éléments de l'extension de navigateur.

Mais qu'est-ce qu'un navigateur exactement? Il s'agit d'une application logicielle qui permet à un utilisateur final d'accéder au contenu d'un serveur et de l'afficher sur des pages web.

✅ Un peu d'histoire: le premier navigateur s'appelait "WorldWideWeb" et a été créé par Sir Timothy Berners-Lee en 1990.

![Les premiers navigateurs](../images/earlybrowsers.jpg)
> Certains des premiers navigateurs, via [Karen McGrane](https://www.slideshare.net/KMcGrane/week-4-ixd-history-personal-computing)

Lorsqu'un utilisateur se connecte à l'internet en utilisant une adresse URL (Uniform Resource Locator), généralement en utilisant le protocole de transfert hypertexte via une adresse `http` ou `https`, le navigateur communique avec un serveur web et va chercher une page web.

À ce stade, le moteur de rendu du navigateur l'affiche sur l'appareil de l'utilisateur, qui peut être un téléphone mobile, un ordinateur de bureau ou un ordinateur portable.

Les navigateurs ont également la capacité de mettre en cache le contenu afin qu'il ne soit pas nécessaire de le récupérer à chaque fois sur le serveur. Ils peuvent enregistrer l'historique de l'activité de navigation d'un utilisateur, stocker des "cookies", qui sont de petits morceaux de données contenant des informations utilisées pour enregistrer l'activité d'un utilisateur, et plus encore. 

Une chose très importante à retenir au sujet des navigateurs est qu'ils ne sont pas tous identiques! Chaque navigateur a ses forces et ses faiblesses, et un développeur web professionnel doit savoir comment faire en sorte que les pages web fonctionnent bien sur plusieurs navigateurs. Cela inclut la gestion des petites fenêtres d'affichage, comme celles des téléphones portables, ainsi que la gestion des utilisateurs hors ligne.

Le site [caniuse.com](https://www.caniuse.com) est un site Web très utile que vous devriez probablement marquer d'un signet dans le navigateur que vous préférez utiliser. Lorsque vous créez des pages Web, il est très utile d'utiliser les listes de technologies prises en charge de caniuse afin d'aider au mieux vos utilisateurs.

✅ Comment pouvez-vous savoir quels sont les navigateurs les plus populaires parmi les utilisateurs de votre site Web? Vérifiez vos analyses - vous pouvez installer divers progiciels d'analyse dans le cadre de votre processus de développement web, et ils vous indiqueront quels sont les navigateurs les plus utilisés par les différents navigateurs populaires.

## Extensions du navigateur

Pourquoi vouloir créer une extension de navigateur? Il s'agit d'un élément pratique à joindre à votre navigateur lorsque vous avez besoin d'un accès rapide à des tâches que vous avez tendance à répéter. Par exemple, si vous avez besoin de vérifier les couleurs des différentes pages Web avec lesquelles vous interagissez, vous pouvez installer une extension de navigateur permettant de choisir les couleurs. Si vous avez du mal à vous souvenir des mots de passe, vous pouvez utiliser une extension de navigateur pour la gestion des mots de passe. 

Les extensions de navigateur sont également agréables à développer. Elles ont tendance à gérer un nombre limité de tâches qu'elles exécutent bien.

✅ Quelles sont vos extensions de navigateur préférées? Quelles sont les tâches qu'elles accomplissent?

### Installation des extensions

Avant de commencer à construire, jetez un coup d'œil au processus de construction et de déploiement d'une extension de navigateur. Bien que chaque navigateur varie un peu dans la façon dont il gère cette tâche, le processus est similaire sur Chrome et Firefox à cet exemple sur Edge:

![screenshot of the Edge browser showing the open edge://extensions page and open settings menu](../images/install-on-edge.png)

En substance, le processus sera le suivant:

- Construisez votre extension en utilisant `npm run build`. 
- Naviguez dans le navigateur jusqu'au panneau des extensions en utilisant le bouton "Paramètres et plus" (l'icône `...`) en haut à droite.
- s'il s'agit d'une nouvelle installation, choisissez `load unpacked` pour charger une nouvelle extension depuis son dossier de construction (dans notre cas, c'est `/dist`) 
- ou, cliquez sur `reload` si vous rechargez l'extension déjà installée.

✅ Ces instructions concernent les extensions que vous construisez vous-même; pour installer des extensions qui ont été publiées dans le magasin d'extension du navigateur associé à chaque navigateur, vous devez vous rendre dans ces [magasins](https://microsoftedge.microsoft.com/addons/Microsoft-Edge-Extensions-Home) et installer l'extension de votre choix.

### Commencer

Vous allez créer une extension de navigateur qui affiche l'empreinte carbone de votre région, en indiquant la consommation d'énergie de votre région et la source de cette énergie. L'extension aura un formulaire qui collecte une clé API afin que vous puissiez accéder à l'API de
l'API de CO2 Signal.

**Vous avez besoin de:**

- [une clé API](https://www.co2signal.com/); saisissez votre adresse électronique dans le champ de cette page et une clé vous sera envoyée.
- le [code pour votre région](http://api.electricitymap.org/v3/zones) correspondant à la [carte de l'électricité](https://www.electricitymap.org/map) (à Boston, par exemple, j'utilise 'US-NEISO').
- le [code de démarrage](../../start). Téléchargez le dossier `start`; vous allez compléter le code dans ce dossier.
- [NPM](https://www.npmjs.com) - NPM est un outil de gestion de paquets; installez-le localement et les paquets listés dans votre fichier `package.json` seront installés pour être utilisés par votre ressource web.

✅ Apprenez-en plus sur la gestion des paquets dans cet [excellent module d'apprentissage](https://docs.microsoft.com/learn/modules/create-nodejs-project-dependencies/?WT.mc_id=academic-13441-cxa)

Prenez une minute pour parcourir la base de code:

dist
    -|manifest.json (les valeurs par défaut sont définies ici)
    -|index.html (balisage HTML frontal ici)
    -|background.js (JS de fond ici)
    -|main.js (JS construit)
src
    -|index.js (votre code JS va ici)

✅ Une fois que vous avez votre clé API et votre code de région à portée de main, rangez-les quelque part dans une note pour une utilisation future.

### Construire le HTML pour l'extension

Cette extension a deux vues. L'une pour recueillir la clé API et le code de région:

![capture d'écran de l'extension terminée ouverte dans un navigateur, affichant un formulaire avec des entrées pour le nom de la région et la clé API](../images/1.png)

Et le second pour afficher la consommation de carbone de la région:

![capture d'écran de l'extension terminée affichant les valeurs d'utilisation du carbone et le pourcentage de combustibles fossiles pour la région US-NEISO](../images/2.png)

Commençons par construire le HTML du formulaire et le styliser avec le CSS.

Dans le dossier `/dist`, vous allez construire un formulaire et une zone de résultat. Dans le fichier `index.html`, remplissez la zone de formulaire délimitée:

```HTML
<form class="form-data" autocomplete="on">
	<div>
		<h2>New? Add your Information</h2>
	</div>
	<div>
		<label for="region">Region Name</label>
		<input type="text" id="region" required class="region-name" />
	</div>
	<div>
		<label for="api">Your API Key from tmrow</label>
		<input type="text" id="api" required class="api-key" />
	</div>
	<button class="search-btn">Submit</button>
</form>	
```
Il s'agit du formulaire où vos informations enregistrées seront saisies et sauvegardées dans le stockage local.

Ensuite, créez la zone de résultats; sous la balise de formulaire finale, ajoutez quelques divs:

```HTML
<div class="result">
	<div class="loading">loading...</div>
	<div class="errors"></div>
	<div class="data"></div>
	<div class="result-container">
		<p><strong>Region: </strong><span class="my-region"></span></p>
		<p><strong>Carbon Usage: </strong><span class="carbon-usage"></span></p>
		<p><strong>Fossil Fuel Percentage: </strong><span class="fossil-fuel"></span></p>
	</div>
	<button class="clear-btn">Change region</button>
</div>
```
À ce stade, vous pouvez essayer une construction. Assurez-vous d'installer les dépendances du paquet de cette extension:

```
npm install
```

Cette commande va utiliser npm, le gestionnaire de paquets Node, pour installer webpack pour le processus de construction de votre extension. Webpack est un bundler qui gère la compilation du code. Vous pouvez voir le résultat de ce processus en regardant dans `/dist/main.js` - vous voyez que le code a été regroupé.

Pour l'instant, l'extension devrait être construite et, si vous la déployez dans Edge en tant qu'extension, vous verrez un formulaire s'afficher proprement.

Félicitations, vous avez franchi les premières étapes de la création d'une extension de navigateur. Dans les leçons suivantes, vous allez la rendre plus fonctionnelle et plus utile.

---

## 🚀 Défi

Jetez un coup d'œil à un magasin d'extensions de navigateur et installez-en une dans votre navigateur. Vous pouvez examiner ses fichiers de manière intéressante. Que découvrez-vous?

## Quiz de validation des connaissances

[Quiz de validation des connaissances](https://happy-mud-02d95f10f.azurestaticapps.net/quiz/24?loc=fr)

## Révision et étude personnelle

Dans cette leçon, vous en avez appris un peu plus sur l'histoire du navigateur Web; profitez-en pour découvrir comment les inventeurs du World Wide Web envisageaient son utilisation en lisant d'autres documents sur son histoire. Voici quelques sites utiles:

[L'histoire des navigateurs Web](https://www.mozilla.org/firefox/browsers/browser-history/)

[L'histoire du Web](https://webfoundation.org/about/vision/history-of-the-web/)

[Un entretien avec Tim Berners-Lee](https://www.theguardian.com/technology/2019/mar/12/tim-berners-lee-on-30-years-of-the-web-if-we-dream-a-little-we-can-get-the-web-we-want)

## Affectation 

[Restylez votre extension](assignment.fr.md)


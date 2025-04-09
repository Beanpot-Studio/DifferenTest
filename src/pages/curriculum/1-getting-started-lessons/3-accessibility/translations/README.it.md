# Creare Pagine Web Accessibili

![Tutto quanto riguarda l'Accessibilità](../../../sketchnotes/webdev101-a11y.png)
> Sketchnote di [Tomomi Imura](https://twitter.com/girlie_mac)

## Quiz Pre-Lezione
[Quiz Pre-Lezione](https://happy-mud-02d95f10f.azurestaticapps.net/quiz/5?loc=it)

> La forza del Web è nella usa universalità. L'accesso garantito a tutti a prescindere dalla disabilità è us aspetto essenziale.
>
> \- Sir Timothy Berners-Lee, Direttore W3C e Inventore del World Wide Web

Questa frase evidenzia perfettamente l'importanza di crerare siti web accessibili. Una applicazione che non può essere acceduta da tutti diventa per definizione esclusivista. Come sviluppatori web si dovrebbe sempre tenere a mente l'accessibilità. Focalizzandosi su questo fin dal principio si sarà sulla buona strada per garantire a chiunque l'accesso alle pagine che si sono create. In questa lezione, si apprenderanno gli strumenti che possono aiutare a rendere le proprie risorse web accessibili e che siano costruite con in mente l'accessibilità.

## Strumenti da usare

### Lettori di schermo

Uno dei più noti strumenti di accessibilità sono i lettori di schermo (screen reader)

I [lettori di schermo](https://www.wikiwand.com/it/Screen_reader) sono strumenti client comunemente usati per persone con menomazioni visive. Poiché dedichiamo tempo a garantire che un browser trasmetta correttamente le informazioni che desideriamo condividere, dobbiamo anche assicurarci che uno screen reader faccia lo stesso.

Nella sua forma più elementare, uno screen reader leggerà una pagina dall'alto verso il basso in modo udibile. Se una pagina è tutta testo, il lettore trasmetterà le informazioni in modo simile a un browser. Naturalmente, le pagine web sono raramente puramente testuali; contengono collegamenti, grafica, colore e altri componenti visivi. È necessario prestare attenzione per garantire che queste informazioni vengano lette correttamente da uno screen reader.

Ogni sviluppatore web dovrebbe acquisire familiarità con uno screen reader. Come evidenziato sopra, è il client che gli utenti dello sviluppatore  utilizzeranno. Allo stesso modo in cui si ha familiarità con il funzionamento di un browser, si dovrebbe imparare come funziona uno screen reader. Fortunatamente, gli screen reader sono integrati nella maggior parte dei sistemi operativi.

Alcuni browser hanno anche strumenti incorporati ed estensioni che possono leggere il testo ad alta voce o persino fornire alcune funzionalità di navigazione di base, come [questi strumenti orientati all'accessibilità del browser Edge](https://support.microsoft.com/help/4000734/microsoft-edge-accessibility-features) . Anche questi sono importanti strumenti di accessibilità, ma funzionano in modo molto diverso dagli screen reader e non dovrebbero essere scambiati per strumenti di test per uno screen reader.

✅ Provare un lettore di schermo e un lettore di testo del browser. In Windows, l'[Assistente vocale](https://support.microsoft.com/windows/complete-guide-to-narrator-e4397a0d-ef4f-b386-d8ae-c172f109bdb1) (Narrator) è incluso per impostazione predefinita e anche [JAWS](https://webaim.org/articles/jaws/) e [NVDA](https://www.nvaccess.org/about-nvda/) possono essere installati Su macOS e iOS, [VoiceOver](https://support.apple.com/guide/voiceover/welcome/10) è installato per impostazione predefinita.

### Zoom

Un altro strumento comunemente utilizzato dalle persone con problemi di vista è lo zoom. Il tipo più semplice di zoom è lo zoom statico, controllato tramite `Control + segno più (+)` o diminuendo la risoluzione dello schermo. Questo tipo di zoom provoca il ridimensionamento dell'intera pagina, quindi l'utilizzo [di una progettazione responsive](https://developer.mozilla.org/docs/Learn/CSS/CSS_layout/Responsive_Design) della pagina è importante per fornire una buona esperienza utente a livelli di zoom aumentati.

Un altro tipo di zoom si basa su un software specializzato per ingrandire un'area dello schermo e fare una panoramica, proprio come usare una vera lente di ingrandimento. Su Windows, [Magnifier](https://support.microsoft.com/windows/use-magnifier-to-make-things-on-the-screen-easier-to-see-414948ba-8b1c-d3bd-8615-0e5e32204198) è integrato e   [ZoomText](https://www.freedomscientific.com/training/zoomtext/getting-started/) è un software di ingrandimento di terze parti con più funzionalità e una base di utenti più ampia. Sia macOS che iOS hanno un software di ingrandimento integrato chiamato [Zoom](https://www.apple.com/accessibility/mac/vision/).

### Verificatori di contrasto

I colori sui siti web devono essere scelti con cura per rispondere alle esigenze degli utenti daltonici o delle persone che hanno difficoltà a vedere i colori a basso contrasto.

✅ Provare un sito web che  piace usare per l'utilizzo del colore con un'estensione del browser come [il controllo del colore WCAG](https://microsoftedge.microsoft.com/addons/detail/wcag-color-contrast-check/idahaggnlnekelhgplklhfpchbfdmkjp?hl=en-US). Cosa si è appreso?

### Lo strumento Faro (Lighthouse)

Nell'area degli strumenti per sviluppatori del browser, si troverà lo strumento Lighthouse. Questo strumento è importante per ottenere una prima visione dell'accessibilità (così come altre analisi) di un sito web. Sebbene sia importante non fare affidamento esclusivamente su Lighthouse, un punteggio del 100% è molto utile come riferimento.

✅ Trovare Lighthouse nel pannello degli strumenti per sviluppatori del proprio browser ed eseguire un'analisi su qualsiasi sito. Cosa si è scoperto?

## Progettare per l'accessibilità

L'accessibilità è un argomento relativamente ampio. A supporto, sono disponibili numerose risorse.

- [Accessibile U - Università del Minnesota](https://accessibility.umn.edu/your-role/web-developers)

Sebbene non si sarà in grado di coprire ogni aspetto della creazione di siti accessibili, di seguito sono riportati alcuni dei principi fondamentali che si vorranno 	implementare. Progettare una pagina accessibile dall'inizio è **sempre** più facile che tornare a una pagina esistente per renderla accessibile.

## Buoni principi di visualizzazione

### Tavolozze di colori sicuri

Le persone vedono il mondo in modi diversi, e questo include i colori. Quando si seleziona una combinazione di colori per il proprio sito, ci si dovrebbe assicurare che sia accessibile a tutti. Un ottimo [strumento per generare tavolozze di colori è Color Safe](http://colorsafe.co/).

✅ Identificare un sito web che è molto problematico nel suo uso del colore. Perché?

### Usa l'HTML corretto

Con CSS e JavaScript è possibile far sembrare qualunque elemento come un qualsiasi tipo di controllo. `<span>` potrebbe essere usato per creare un  `<button>`, e `<b>` potrebbe diventare un collegamento ipertestuale. Sebbene questo possa essere considerato più facile da definire, non trasmette nulla a uno screen reader. Occorre usare l'HTML appropriato quando si creano i controlli su una pagina. Se si vuole un collegamento ipertestuale usare `<a>`. L'utilizzo dell'HTML corretto per il controllo corretto è chiamato fare uso dell'HTML semantico.

✅ Portarsi su qualsiasi sito web e controllare se i progettisti e gli sviluppatori stanno usando l'HTML correttamente. Si riesce a trovare un pulsante che dovrebbe essere un collegamento? Suggerimento: fare clic con il tasto destro e scegliere "Visualizza sorgente pagina" nel browser per esaminare il codice relativo.

### Creare una gerarchia descrittiva delle intestazioni

Gli utenti di screen reader [fanno molto affidamento sui titoli](https://webaim.org/projects/screenreadersurvey8/#finding) per trovare informazioni e navigare in una pagina. La scrittura di contenuto di intestazione descrittiva e l'utilizzo di tag di intestazione semantici sono importanti per creare un sito facilmente navigabile per gli utenti di lettori di schermo.

### Usare buoni indizi visivi

CSS offre il controllo completo sull'aspetto di qualsiasi elemento in una pagina. È possibile creare caselle di testo senza un contorno o collegamenti ipertestuali senza una sottolineatura. Sfortunatamente rimuovere questi indizi può rendere più difficile per qualcuno che dipende da loro essere in grado di riconoscere il tipo di controllo.

## L'importanza del testo del collegamento

I collegamenti ipertestuali sono fondamentali per la navigazione sul Web. Di conseguenza, assicurarsi che uno screen reader possa leggere correttamente i collegamenti consente a tutti gli utenti di navigare nel proprio sito.

### Lettori di schermo e collegamenti

Come ci si potrebbe aspettare, gli screen reader leggono il testo del collegamento nello stesso modo in cui leggono qualsiasi altro testo nella pagina. Tenedo presente questo, il testo mostrato di seguito potrebbe sembrare perfettamente accettabile.

> Il pinguino minore, a volte noto come il pinguino delle fate, è il più piccolo pinguino del mondo. [Fare clic qui](https://en.wikipedia.org/wiki/Little_penguin) per ulteriori informazioni.

> Il Il pinguino minore, a volte noto come il pinguino delle fate, è il più piccolo pinguino del mondo. Visitare https://en.wikipedia.org/wiki/Little_penguin per ulteriori informazioni.

> **NOTA** Come si leggerà di seguito, non si dovrebbero **mai** creare collegamenti che assomigliano all'esempio precedente

Si ricordi che gli screen reader sono un'interfaccia diversa dai browser con un diverso insieme di funzionalità.

### Il problema con l'utilizzo dell'URL

I lettori di schermo leggono il testo. Se nel testo viene visualizzato un URL, lo screen reader leggerà l'URL. In generale, l'URL non trasmette informazioni significative e può sembrare al suono fastidioso. Si potrebbe averlo riscontrato se il proprio telefono ha mai letto in modo udibile un messaggio di testo con un URL.

### Il problema con "clicca qui"

I lettori di schermo hanno anche la capacità di leggere solo i collegamenti ipertestuali su una pagina, molto nello stesso modo in cui una persona vedente scorrerebbe una pagina per cercare collegamenti. Se il testo del link è sempre "clicca qui", tutto ciò che l'utente sentirà sarà "clicca qui, clicca qui, clicca qui, clicca qui, clicca qui, ..." Tutti i collegamenti sono ora indistinguibili l'uno dall'altro.

### Buon testo del collegamento

Un buon testo del collegamento descrive brevemente cosa c'è dall'altra parte del collegamento. Nell'esempio sopra che parla di piccoli pinguini, il collegamento è alla pagina di Wikipedia sulla specie. La frase *piccoli pinguini* renderebbe il testo del collegamento perfetto in quanto chiarisce ciò che qualcuno imparerà se fa clic sul collegamento: piccoli pinguini.

> Il [pinguino minore](https://www.wikiwand.com/it/Eudyptula_minor), a volte noto come il pinguino delle fate, è il più piccolo pinguino del mondo.

✅ Navigare sul Web per alcuni minuti per trovare pagine che utilizzano oscure strategie di collegamento. Confrontarle con altri siti con collegamenti migliori. Cosa si è appreso?

#### Note sui motori di ricerca

Come bonus aggiuntivo per garantire che il proprio sito sia accessibile a tutti, si dovranno aiutare anche i motori di ricerca a navigare nel sito. I motori di ricerca utilizzano il testo del collegamento per apprendere gli argomenti delle pagine. Quindi usare un buon testo per i link aiuta tutti!

### ARIA

Si Immagini la pagina seguente:

| Prodotto         | Descrizione        | Ordine        |
| ---------------- | ------------------ | ------------- |
| Widget           | [Descrizione]('#') | [Ordine]('#') |
| DMX Super Widget | [Descrizione]('#') | [Ordine]('#') |

In questo esempio, la duplicazione del testo della descrizione e dell'ordine ha senso per qualcuno che utilizza un browser. Tuttavia, qualcuno che utilizza uno screen reader ascolterebbe solo le parole *descrizione* e *ordine* ripetute senza contesto.

Per supportare questi tipi di scenari, HTML supporta una serie di attributi noti come [ARIA (Accessible Rich Internet Applications)](https://developer.mozilla.org/docs/Web/Accessibility/ARIA). Questi attributi consentono di fornire informazioni aggiuntive agli screen reader.

> **NOTA**: come molti aspetti dell'HTML, il supporto del browser e dello screen reader può variare. Tuttavia, la maggior parte dei client principali supporta gli attributi ARIA.

E' possibile utilizzare `aria-label` per descrivere il collegamento quando il formato della pagina non lo consente. La descrizione del widget potrebbe essere impostata come

```html
<a href="#" aria-label="Widget description">description</a>
```

✅ In generale, l'uso del markup semantico come descritto sopra sostituisce l'uso di ARIA, ma a volte non esiste un equivalente semantico per diversi widget HTML. Un buon esempio è una struttura ad albero. Non esiste un equivalente HTML per una struttura ad albero, quindi si identifica il generico  `<div>` per questo elemento con un ruolo e valori aria appropriati. La [documentazione MDN su ARIA](https://developer.mozilla.org/docs/Web/Accessibility/ARIA) contiene ulteriori utili informazioni.

```html
<h2 id="tree-label">File Viewer</h2>
<div role="tree" aria-labelledby="tree-label">
  <div role="treeitem" aria-expanded="false" tabindex="0">Uploads</div>
</div>
```

## Immagini

Inutile dire che gli screen reader non sono in grado di leggere automaticamente il contenuto di un'immagine. Assicurarsi che le immagini siano accessibili non richiede molto lavoro: è ciò di cui tratta l'attributo `alt` . Tutte le immagini significative dovrebbero avere un `alt` per descrivere cosa sono. Le immagini che sono puramente decorative dovrebbero avere il loro attributo `alt` impostato su una stringa vuota: `alt = ""`. Ciò impedisce ai lettori di schermo di annunciare inutilmente l'immagine decorativa.

✅ Come ci si potrebbe aspettare, anche i motori di ricerca non sono in grado di capire cosa c'è in un'immagine. Anch'essi usano il testo alternativo. Quindi, ancora una volta, assicurandosi che la propria pagina sia accessibile fornisce bonus aggiuntivi!

## La tastiera

Alcuni utenti non sono in grado di utilizzare un mouse o un trackpad, affidandosi invece alle interazioni della tastiera per passare da un elemento all'altro. È importante che il proprio sito web presenti i contenuti in ordine logico in modo che un utente usando la tastiera possa accedere a ogni elemento interattivo mentre si sposta nel flusso di un documento. Se si creano le proprie pagine web con markup semantico e si utilizza CSS per definire lo stile del layout visivo, il proprio sito dovrebbe essere navigabile da tastiera, ma è importante testare manualmente questo aspetto. Per saperne di più su ulteriori informazioni sulle [strategie di navigazione da tastiera](https://webaim.org/techniques/keyboard/).

✅ Andare su qualsiasi sito web e provare a navigarlo utilizzando solo la tastiera. Cos'è che funziona e cos'è che non funziona? Perché?

## Riepilogo

Un Web accessibile ad alcuni non è un vero "world-wide web". Il modo migliore per garantire che i siti che si creano siano accessibili è incorporare le migliori pratiche di accessibilità sin dall'inizio. Sebbene siano necessari passaggi aggiuntivi, incorporare queste abilità nel flusso di lavoro ora significa che tutte le pagine che si creeranno  saranno accessibili.

---

## 🚀 Sfida

Prendere questo HTML e riscriverlo per essere il più accessibile possibile, date le strategie che sono state apprese.

```html
<!DOCTYPE html>
<html>
  <head>
    <title>
      Example
    </title>
    <link href='../assets/style.css' rel='stylesheet' type='text/css'>
  </head>
  <body>
    <div class="site-header">
      <p class="site-title">Turtle Ipsum</p>
      <p class="site-subtitle">The World's Premier Turtle Fan Club</p>
    </div>
    <div class="main-nav">
      <p class="nav-header">Resources</p>
      <div class="nav-list">
        <p class="nav-item nav-item-bull"><a href="https://www.youtube.com/watch?v=CMNry4PE93Y">"I like turtles"</a></p>
        <p class="nav-item nav-item-bull"><a href="https://en.wikipedia.org/wiki/Turtle">Basic Turtle Info</a></p>
        <p class="nav-item nav-item-bull"><a href="https://en.wikipedia.org/wiki/Turtles_(chocolate)">Chocolate Turtles</a></p>
      </div>
    </div>
    <div class="main-content">
      <div>
        <p class="page-title">Welcome to Turtle Ipsum.
            <a href="">Click here</a> to learn more.
        </p>
        <p class="article-text">
          Turtle ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum
        </p>
      </div>
    </div>
    <div class="footer">
      <div class="footer-section">
        <span class="button">Sign up for turtle news</span>
      </div><div class="footer-section">
        <p class="nav-header footer-title">
          Internal Pages
        </p>
        <div class="nav-list">
          <p class="nav-item nav-item-bull"><a href="../">Index</a></p>
          <p class="nav-item nav-item-bull"><a href="../semantic">Semantic Example</a></p>
        </div>
      </div>
      <p class="footer-copyright">&copy; 2016 Instrument</span>
    </div>
  </body>
</html>
```

## Quiz post-lezione
[Quiz post-lezione](https://happy-mud-02d95f10f.azurestaticapps.net/quiz/6?loc=it)

## Revisione e auto apprendimento

Molti governi hanno leggi riguardanti i requisiti di accessibilità. Consultare le leggi sull'accessibilità del proprio paese d'origine. Cosa è coperto e cosa no? Un esempio è [questo sito web del governo inglese](https://accessibility.blog.gov.uk/).

## Assegnazione

[Analizzare un sito web non accessibile](assignment.it.md)

Crediti: [Turtle Ipsum](https://github.com/Instrument/semantic-html-sample) da Instrument
# Criando  Webpages Acessíveis

![Tudo sobre acessibilidade](../../../sketchnotes/webdev101-a11y.png)
> Sketchnote por [Tomomi Imura](https://twitter.com/girlie_mac)

## Quiz Pré-Aula 
[Pre-lecture quiz](https://happy-mud-02d95f10f.azurestaticapps.net/quiz/5)

> O poder da Web está em sua universalidade. O acesso de todos, independentemente de deficiências, é um aspecto essencial. 
>
> \- Senhor Timothy Berners-Lee, Diretor da W3C e inventor da World Wide Web

Esta citação destaca perfeitamente a importância de criar sites acessíveis. Um aplicativo que não pode ser acessado por todos é, por definição, excludente. Como pessoas desenvolvedoras da web, devemos sempre ter a acessibilidade em mente. Tendo esse foco desde o início, você estará no caminho certo para garantir que todos possam acessar as páginas que você cria. Nesta lição, você aprenderá sobre as ferramentas que podem te ajudar a garantir que seus programas da web sejam acessíveis e como construir tendo a acessibilidade em mente.

## Ferramentas para uso

### Leitores de Tela

Uma das ferramentas de acessibilidade mais conhecidas são os leitores de tela.

[Leitores de Tela](https://pt.wikipedia.org/wiki/Leitor_de_tela) são clientes comumente usados por pessoas com deficiência visual. Como gastamos tempo garantindo que um navegador transmita adequadamente as informações que desejamos compartilhar, também devemos garantir que um leitor de tela faça o mesmo.

Basicamente, um leitor de tela lê uma página de cima para baixo de forma audível. Se sua página for totalmente de texto, o leitor transmitirá as informações de maneira semelhante a um navegador. Claro, as páginas da web raramente são puramente texto; elas conterão links, gráficos, cores e outros componentes visuais. Deve-se ter cuidado para garantir que essas informações sejam lidas corretamente por um leitor de tela.

Toda pessoa desenvolvedora da web deve se familiarizar com um leitor de tela. Conforme destacado acima, é o cliente que seus usuários utilizarão. Da mesma forma que você está se familiarizando com o funcionamento de um navegador, deve aprender como funciona um leitor de tela. Felizmente, os leitores de tela são integrados à maioria dos sistemas operacionais.

Alguns navegadores também possuem ferramentas e extensões integradas que podem ler texto em voz alta ou até mesmo fornecer alguns recursos básicos de navegação, como [essas ferramentas do navegador Edge com foco em acessibilidade](https://support.microsoft.com/help/4000734/microsoft-edge-accessibility-features). Essas também são ferramentas de acessibilidade importantes, mas funcionam de maneira muito diferente dos leitores de tela e não devem ser confundidas com ferramentas de teste de leitores de tela.

✅ Experimente um leitor de tela e um leitor de texto do navegador. No Windows [Narrator](https://support.microsoft.com/windows/complete-guide-to-narrator-e4397a0d-ef4f-b386-d8ae-c172f109bdb1) é includso por padrão. [JAWS](https://webaim.org/articles/jaws/) e [NVDA](https://www.nvaccess.org/about-nvda/) também podem ser instalados. No macOS e iOS, [VoiceOver](https://support.apple.com/guide/voiceover/welcome/10) vem instalado por padrão.

### Zoom

Outra ferramenta normalmente usada por pessoas com deficiência visual é o zoom. O tipo mais básico de zoom é o zoom estático, controlado por `Ctrl + sinal de mais (+)` ou diminuindo a resolução da tela. Este tipo de zoom faz com que a página inteira seja redimensionada, portanto, usar [design responsivo](https://developer.mozilla.org/docs/Learn/CSS/CSS_layout/Responsive_Design) é importante para fornecer uma boa experiência do usuário em níveis de zoom aumentados.

Outro tipo de zoom depende de um software especializado para ampliar uma área da tela e panoramizar, de maneira muito parecida com o uso de uma lente de aumento real. No Windows, [Magnifier](https://support.microsoft.com/windows/use-magnifier-to-make-things-on-the-screen-easier-to-see-414948ba-8b1c-d3bd-8615-0e5e32204198) vem de fábrica, e o [ZoomText](https://www.freedomscientific.com/training/zoomtext/getting-started/) é um software de ampliação de terceiros com mais recursos e uma base de usuários maior. Tanto o macOS quanto o iOS têm um software de ampliação integrado chamado [Zoom](https://www.apple.com/accessibility/mac/vision/).

### Verificadores de contraste

As cores nos sites precisam ser cuidadosamente escolhidas para atender às necessidades de usuários daltônicos ou pessoas que têm dificuldade em ver cores de baixo contraste.

✅ Teste um site que você goste de usar com uma extensão de navegador para verificar o contraste das cores, como por exemplo o [WCAG's color checker](https://microsoftedge.microsoft.com/addons/detail/wcag-color-contrast-check/idahaggnlnekelhgplklhfpchbfdmkjp?hl=en-US). O que você aprendeu?

### Lighthouse

Na área de ferramenta do desenvolvedor do seu navegador, você encontrará a ferramenta Lighthouse. Esta ferramenta é importante para obter uma primeira visão da acessibilidade (bem como outras análises) de um site. Embora seja importante não depender exclusivamente do Lighthouse, uma pontuação de 100% é muito útil como base.

✅ Encontre o Lighthouse no painel Dev Tools do seu navegador e execute uma análise em qualquer site. o que você descobriu?

## Criando Designs para acessibilidade

Acessibilidade é um tópico relativamente amplo. Para te ajudar, existem vários recursos disponíveis.

- [Accessible U - University of Minnesota](https://accessibility.umn.edu/your-role/web-developers)

Embora não possamos cobrir todos os aspectos da criação de sites acessíveis, a seguir estão alguns dos princípios básicos que você deseja implementar. Projetar uma página acessível desde o início é **sempre** mais fácil do que voltar a uma página existente para torná-la acessível.

## Boas práticas de display

### Paletas de cores seguras

As pessoas veem o mundo de maneiras diferentes, e isso inclui cores. Ao selecionar um esquema de cores para o seu site, você deve garantir que ele seja acessível a todos. Uma ótima [ferramenta para gerar paletas de cores é Color Safe](http://colorsafe.co/).

✅ Identifique um site que seja muito problemático no uso de cores. Porque esse site é problemático?

### Use o HTML correto

Com CSS e JavaScript é possível fazer com que qualquer elemento se pareça com qualquer tipo de controle. `<span>` poderia ser usado para criar um `<button>`, e `<b>` poderia se tornar um hiperlink. Embora isso possa ser considerado mais fácil de estilizar, não transmite nada para um leitor de tela. Use o HTML apropriado ao criar controles em uma página. Se você quiser um hiperlink, use `<a>`. Usar o HTML certo para o controle certo é chamado de usar HTML semântico.

✅ Vá a qualquer site e veja se os designers e desenvolvedores estão usando HTML corretamente. Você consegue encontrar um botão que deveria ser um link? Dica: clique com o botão direito e escolha 'Exibir código-fonte da página' em seu navegador para ver o código subjacente.

### Crie uma hierarquia descritiva de títulos

Pessoas usuárias de leitores de tela [dependem muito de títulos](https://webaim.org/projects/screenreadersurvey8/#finding) para encontrar informações e navegar por uma página. Escrever conteúdo de título descritivo e usar tags de título semântico são importantes para criar um site facilmente navegável para usuários de leitores de tela.

### Use boas dicas visuais

CSS oferece controle completo sobre a aparência de qualquer elemento em uma página. Você pode criar caixas de texto sem contorno ou hiperlinks sem sublinhado. Infelizmente, remover esses sinais pode tornar mais difícil para alguém que depende deles ser capaz de reconhecer o tipo de controle.

## A importância do texto do link

Os hiperlinks são essenciais para navegar na web. Como resultado, garantir que um leitor de tela possa ler os links corretamente permite que todos os usuários naveguem em seu site sem problemas.

### Leitores de tela e links

Como seria de se esperar, os leitores de tela lêem o texto do link da mesma forma que leriam qualquer outro texto na página. Com isso em mente, o texto demonstrado abaixo pode parecer perfeitamente aceitável.

> O pequeno pinguim, também conhecido como pinguim fada, é o menor pinguim do mundo. [Clique aqui](https://en.wikipedia.org/wiki/Little_penguin)  para mais informações.

> O pequeno pinguim, também conhecido como pinguim fada, é o menor pinguim do mundo. Visite https://en.wikipedia.org/wiki/Little_penguin para mais informações.

> **NOTA** Como você está prestes a ler, **nunca** deve-se criar links que se pareçam com o acima.

Lembre-se de que os leitores de tela são uma interface diferente de navegadores com um conjunto diferente de recursos.

### O problema de usar o URL

Leitores de tela leem o texto. Se um URL aparecer no texto, o leitor de tela lerá o URL. De modo geral, a URL não transmite informações significativas e pode parecer irritante. Você pode ter experimentado isso se o seu telefone já leu de forma audível uma mensagem de texto com um URL.

### O problema com "clique aqui"

Os leitores de tela também têm a capacidade de ler apenas os hiperlinks em uma página, da mesma forma que uma pessoa com visão examinaria uma página em busca de links. Se o texto do link for sempre "clique aqui", tudo o que o usuário ouvirá é "clique aqui, clique aqui, clique aqui, clique aqui, clique aqui, ..." Todos os links agora são indistinguíveis uns dos outros.

### Bom texto de link 

Um bom texto de link descreve resumidamente o que está do outro lado do link. No exemplo acima, falando sobre pequenos pinguins, o link é para a página da Wikipedia sobre a espécie. A frase *pequenos pinguins* seria um texto de link perfeito, pois deixa claro o que alguém encontrará se clicar no link - pequenos pinguins.

> O [pequeno pinguim](https://en.wikipedia.org/wiki/Little_penguin), às vezes conhecido como pinguim fada, é o menor pinguim do mundo.

✅ Navegue na web por alguns minutos para encontrar páginas que usam estratégias de links obscuras. Compare-os com outros sites com links melhores. O que voce aprende?

#### Notas sobre Mecanismos de Pesquisa

Como um bônus adicional por garantir que seu site seja acessível a todes, você também ajudará os mecanismos de pesquisa a navegar em seu site. Os mecanismos de pesquisa usam o texto do link para aprender quais são os tópicos das páginas. Portanto, usar um bom texto de link ajuda a todos!

### ARIA

Imagine a seguinte página:

| Produto      | Descrição        | Pedido        |
| ------------ | ---------------- | ------------- |
| Widget       | [Descrição]('#') | [Pedido]('#') |
| Super widget | [Descrição]('#') | [Pedido]('#') |

Neste exemplo, duplicar o texto de descrição e ordem faz sentido para alguém que usa um navegador. No entanto, alguém usando um leitor de tela ouviria apenas as palavras *descrição* e *pedido* repetidas sem contexto.

Para oferecer suporte a esses tipos de cenários, o HTML oferece suporte a um conjunto de atributos conhecido como [Accessible Rich Internet Applications (ARIA)](https://developer.mozilla.org/docs/Web/Accessibility/ARIA). Esses atributos permitem fornecer informações adicionais aos leitores de tela.

> **NOTA**:  Como muitos aspectos do HTML, o suporte ao navegador e ao leitor de tela pode variar. No entanto, a maioria dos clientes principais oferece suporte a atributos ARIA.

Você pode usar `aria-label` para descrever o link quando o formato da página não permitir. A descrição do widget pode ser definida como

``` html
<a href="#" aria-label="descrição do widget">descrição</a>
```

✅ Em geral, o uso da marcação semântica conforme descrito acima substitui o uso de ARIA, mas às vezes não há equivalente semântico para vários widgets HTML. Um bom exemplo é uma Tree. Não há HTML equivalente para uma Tree, então você identifica o `<div>` genérica para este elemento com um papel apropriado e valores de aria. A [documentação MDN sobre ARIA](https://developer.mozilla.org/docs/Web/Accessibility/ARIA) contém mais informações úteis.

```html
<h2 id="tree-label">Visualizador de arquivos</h2>
<div role="tree" aria-labelledby="tree-label">
  <div role="treeitem" aria-expanded="false" tabindex="0">Uploads</div>
</div>
```

## Imagens

Nem é preciso dizer que os leitores de tela não conseguem ler automaticamente o que há em uma imagem. Garantir que as imagens sejam acessíveis não dá muito trabalho - é disso que se trata o atributo `alt`. Todas as imagens significativas devem ter um `alt` para descrever o que são.
Imagens que são puramente decorativas devem ter seu atributo `alt` definido como uma string vazia:` alt = "" `. Isso evita que os leitores de tela anunciem desnecessariamente a imagem decorativa.

✅ Como você pode esperar, os mecanismos de pesquisa também não conseguem entender o que está em uma imagem. Eles também usam texto alternativo. Portanto, mais uma vez, garantir que sua página esteja acessível fornece bônus adicionais!

## O teclado

Alguns usuários não conseguem usar um mouse ou trackpad, em vez disso, contam com as interações do teclado para passar de um elemento para o próximo. É importante que o seu site apresente o seu conteúdo em ordem lógica para que um usuário do teclado possa acessar cada elemento interativo à medida que avança em um documento. Se você construir suas páginas da web com marcação semântica e usar CSS para estilizar seu layout visual, seu site deve ser navegável pelo teclado, mas é importante testar esse aspecto manualmente. Aprenda mais sobre [ v](https://webaim.org/techniques/keyboard/).

✅ Vá a qualquer site da web e tente navegar por ele usando apenas o teclado. O que funciona, o que não funciona? Porque?

## Resumo

Uma web acessível a alguns não é uma verdadeira 'rede mundial'. A melhor maneira de garantir que os sites que você cria sejam acessíveis é incorporar as práticas recomendadas de acessibilidade desde o início. Embora haja etapas extras envolvidas, incorporar essas habilidades em seu fluxo de trabalho agora significará que todas as páginas que você criar estarão acessíveis.
---

## 🚀 Desafio

Pegue este HTML e reescreva-o para ser o mais acessível possível, de acordo com as estratégias que você aprendeu.

```html
<!DOCTYPE html>
<html>
  <head>
    <title>
      Examplo
    </title>
    <link href='../assets/style.css' rel='stylesheet' type='text/css'>
  </head>
  <body>
    <div class="site-header">
      <p class="site-title">Tartaruga Ipsum</p>
      <p class="site-subtitle">O Fan Club Premier Mundial de tartarugas</p>
    </div>
    <div class="main-nav">
      <p class="nav-header">Recursos</p>
      <div class="nav-list">
        <p class="nav-item nav-item-bull"><a href="https://www.youtube.com/watch?v=CMNry4PE93Y">"Eu gosto de tartarugas"</a></p>
        <p class="nav-item nav-item-bull"><a href="https://en.wikipedia.org/wiki/Turtle">Informações básicas sobre tartarugas</a></p>
        <p class="nav-item nav-item-bull"><a href="https://en.wikipedia.org/wiki/Turtles_(chocolate)">Tartarugas Chocolate</a></p>
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

## Quiz Pós-Aula
[Quiz Pós-Aula](https://happy-mud-02d95f10f.azurestaticapps.net/quiz/6)

## Revisão e autoestudo

Muitos governos têm leis relacionadas aos requisitos de acessibilidade. Leia sobre as leis de acessibilidade do seu país. O que é coberto e o que não é? Um exemplo é [esse site de govermo](https://accessibility.blog.gov.uk/).

## Lição de casa
 
[Analise um site não acessível](assignment.pt.md)

Créditos: [Turtle Ipsum](https://github.com/Instrument/semantic-html-sample) por Instrument

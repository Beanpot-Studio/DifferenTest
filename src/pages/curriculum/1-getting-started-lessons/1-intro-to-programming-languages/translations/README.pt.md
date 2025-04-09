# Introdução a Linguagens de Programação e Ferramentas

Essa lição trata dos básicos de linguagens de programação. Os tópicos tratados aqui se aplicam na maioria das linguagens de programação modernas. Na sessão 'Ferramentas', você vai aprender sobre softwares úteis que ajudarão como uma pessoa desenvolvedora.

![Introdução a Programação](../../../sketchnotes/webdev101-programming.png)

> Sketchnote por [Tomomi Imura](https://twitter.com/girlie_mac)

## Quiz Pré-Lição

[Quiz Pré-Lição](https://happy-mud-02d95f10f.azurestaticapps.net/quiz/1)

## Introdução

Nessa lição, vamos falar sobre:

- O que é Programação?
- Tipos de linguagens de programação
- Elementos básicos de um programa
- Ferramentas e softwares utéis para a pessoa desenvolvedora

## O que é Programação?

Programação (também conhecida como codificação) é o processo de escrever instruções em um dispositivo, como um computador ou dispositivo móvel. Escrevemos essas instruções com uma linguagem de programação, que é então interpretada pelo dispositivo. Esses conjuntos de instruções podem ser chamados de vários nomes, mas _programa_, _programa de computador_, _aplicativo (app_ e _executável_) são alguns nomes populares.

Um _programa_ pode ser qualquer coisa escrita com código; sites, jogos e aplicativos de celular são programas. Embora seja possível criar um programa sem escrever código, a lógica subjacente é interpretada para o dispositivo e essa lógica provavelmente foi escrita com o código. Um programa que está * executando* ou *executando código* está executando instruções. O dispositivo com o qual você está lendo esta lição está executando um programa para exibi-la em sua tela.

✅ Faça uma pequena pesquisa: quem é considerado a primeira pessoa programadora de computador do mundo?

## Linguagens de Programação

Linguagens de programação têm um propósito principal: Serem usadas por pessoas desenvolvedoras para criar instruções para enviar a um dispositivo. Os dispositivos só podem entender binários (1s e 0s) e, para *a maioria* das pessoas desenvolvedoras, essa não é uma maneira muito eficiente de se comunicar. As linguagens de programação são um veículo de comunicação entre humanos e computadores.

As linguagens de programação vêm em formatos diferentes e podem servir a propósitos diferentes. Por exemplo, JavaScript é usado principalmente para aplicativos da web, enquanto Bash é usado principalmente para sistemas operacionais.

*Linguagens de baixo nível* normalmente requerem menos etapas do que *linguagens de alto nível* para um dispositivo interpretar as instruções. No entanto, o que torna as linguagens de alto nível populares é sua legibilidade e suporte. JavaScript é considerado uma linguagem de alto nível.

O código a seguir ilustra a diferença entre uma linguagem de alto nível com JavaScript e uma linguagem de baixo nível com código ARM assembly.

```javascript
let number = 10;
let n1 = 0,
  n2 = 1,
  nextTerm;

for (let i = 1; i <= number; i++) {
  console.log(n1);
  nextTerm = n1 + n2;
  n1 = n2;
  n2 = nextTerm;
}
```

```c
 area ascen,code,readonly
 entry
 code32
 adr r0,thumb+1
 bx r0
 code16
thumb
 mov r0,#00
 sub r0,r0,#01
 mov r1,#01
 mov r4,#10
 ldr r2,=0x40000000
back add r0,r1
 str r0,[r2]
 add r2,#04
 mov r3,r0
 mov r0,r1
 mov r1,r3
 sub r4,#01
 cmp r4,#00
 bne back
 end
```

Acredite ou não, *ambos estão fazendo a mesma coisa*: imprimir uma sequência de Fibonacci de até 10.

✅ A sequência de Fibonacci [definida](https://en.wikipedia.org/wiki/Fibonacci_number) como um conjunto de números em que cada número é a soma dos dois anteriores, começando em 0 e 1.

## Elementos de um programa

Uma única instrução em um programa é chamada de _declaração_ e geralmente terá um caractere ou espaçamento de linha que marca onde a instrução termina, ou _acaba_. Como um programa termina varia com cada idioma.


A maioria dos programas depende do uso de dados de um usuário ou de outro lugar, onde as declarações podem se basear em dados para realizar as instruções. Os dados podem alterar o comportamento de um programa, portanto, as linguagens de programação vêm com uma maneira de armazenar dados temporariamente que podem ser usados ​​posteriormente. Esses dados são chamados de _variáveis_. Variáveis ​​são statements que instruem um dispositivo a salvar dados em sua memória. As variáveis ​​nos programas são semelhantes às da álgebra, onde têm um nome exclusivo e seu valor pode mudar com o tempo.


Há uma chance de que algumas instruções não sejam executadas por um dispositivo. Isso geralmente ocorre de propósito, quando escrito pela pessoa desenvolvedora, ou por acidente, quando ocorre um erro inesperado. Esse tipo de controle de um aplicativo o torna mais robusto e sustentável. Normalmente, essas mudanças no controle acontecem quando certas decisões são cumpridas. Uma declaração comum em linguagens de programação modernas para controlar como um programa é executado é a declaração `if..else`.


✅ Você aprenderá mais sobre esse tipo de declaração nas lições seguintes


## Ferramentas

[![Ferramentas](https://img.youtube.com/vi/bynF1E0Hq98/0.jpg)](https://youtube.com/watch?v=bynF1E0Hq98 "Ferramentas")

Nesta seção, você aprenderá sobre alguns softwares que podem ser muito úteis ao iniciar sua jornada de desenvolvimento profissional.


Um **ambiente de desenvolvimento** é um conjunto exclusivo de ferramentas e recursos que uma pessoa desenvolvedora usará com frequência ao escrever software. Algumas dessas ferramentas foram personalizadas para as necessidades específicas de uma pessoa desenvolvedora e podem mudar com o tempo se as prioridades de trabalho ou projetos pessoais forem alterados, ou quando usar uma linguagem de programação diferente. Os ambientes de desenvolvimento são tão exclusivos quanto as pessoas desenvolvedoras que os utilizam.


### Editores

Uma das ferramentas mais importantes para o desenvolvimento de software é o editor. Os editores são onde você escreve seu código e, às vezes, onde o executará.

Também contamos com os editores por alguns motivos adicionais:


- _Debugging_ Descobrir bugs e erros ao passar pelo código, linha por linha. Alguns editores têm recursos de depuração ou podem ser personalizados e adicionados para linguagens de programação específicas.
- _Destaque da sintaxe_ Adiciona cores e formatação de texto ao código, tornando-o mais fácil de ler. A maioria dos editores permite destaque de sintaxe personalizada.
- _Extensões e integrações_ Adições especializadas para pessoas desenvolvedoras, por pessoas desenvolvedoras, para acesso a ferramentas adicionais que não são incorporadas ao editor de base. Por exemplo, muitas vezes precisamos de uma maneira de documentar nosso código e explicar como ele funciona, nesse caso, instalaremos uma extensão de verificação ortográfica para verificar erros de digitação. A maioria dessas adições se destina ao uso em um editor específico, e a maioria dos editores vem com uma maneira de pesquisar as extensões disponíveis.
- _Personalização_ A maioria dos editores é extremamente personalizável e cada pessoa desenvolvedora terá seu ambiente de desenvolvimento exclusivo que atende às suas necessidades. Muitos também permitem que você crie suas próprias extensões.


#### Editores Populares e Extensões para Desenvolvimento de Web

- [Visual Studio Code](https://code.visualstudio.com/)
  - [Code Spell Checker - verificador ortográfico de código ](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)
  - [Live Share - Compartilhamento ao vivo](https://marketplace.visualstudio.com/items?itemName=MS-vsliveshare.vsliveshare-pack)
  - [Prettier - Formatador de Código](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Atom](https://atom.io/)
  - [spell-check - verificador ortográfico](https://atom.io/packages/spell-check)
  - [teletype](https://atom.io/packages/teletype)
  - [atom-beautify](https://atom.io/packages/atom-beautify)

### Navegadores

Outra ferramenta crucial é o navegador. As pessoas desenvolvedoras da web contam com o navegador para observar como seu código é executado na internet, isso também é usado para visualizar elementos visuais de uma página da web que são escritos no editor, como HTML.

Muitos navegadores vêm com _ferramentas para desenvolvimento_ (DevTools) que contêm um conjunto de recursos e informações úteis que ajudam a coletar e capturar percepções importantes sobre seus aplicativos. Por exemplo: se uma página da web contém erros, às vezes é útil saber quando eles ocorreram. DevTools em um navegador pode ser configurado para capturar essas informações. 


#### Navegadores Populares e DevTools

- [Edge](https://docs.microsoft.com/microsoft-edge/devtools-guide-chromium?WT.mc_id=academic-13441-cxa)
- [Chrome](https://developers.google.com/web/tools/chrome-devtools/)
- [Firefox](https://developer.mozilla.org/docs/Tools)

### Ferramentas da Linha de Comando

Algumas pessoas desenvolvedoras preferem uma visualização menos gráfica para suas tarefas diárias e contam com a linha de comando para fazer isso. O desenvolvimento de código requer uma quantidade significativa de digitação e algumas pessoas desenvolvedoras preferem não interromper seu fluxo no teclado e usam atalhos de teclado para alternar entre as janelas da área de trabalho, trabalhar em arquivos diferentes e usar ferramentas. 
A maioria das tarefas pode ser concluída com um mouse, mas um benefício de usar a linha de comando é que muito pode ser feito com ferramentas de linha de comando sem a necessidade de alternar entre o mouse e o teclado. Outro benefício da linha de comando é que ela é configurável ​​e você pode salvar sua configuração personalizada, alterá-la posteriormente e também importá-la para novas máquinas de desenvolvimento. Como os ambientes de desenvolvimento são tão exclusivos para cada pessoa desenvolvedora, algumas evitam o uso da linha de comando e outras dependem dela inteiramente e existem também aquelas que preferem uma combinação dos dois.


### Opções Populares de Linhas de Comando

As opções da linha de comando variam de acordo com o sistema operacional que você usa.


_💻 = já vem pré-instalado no sistema operacional._

#### Windows

- [Powershell](https://docs.microsoft.com/powershell/scripting/overview?view=powershell-7?WT.mc_id=academic-13441-cxa) 💻
- [Command Line](https://docs.microsoft.com/windows-server/administration/windows-commands/windows-commands?WT.mc_id=academic-13441-cxa) (also known as CMD) 💻
- [Windows Terminal](https://docs.microsoft.com/windows/terminal/?WT.mc_id=academic-13441-cxa)
- [mintty](https://mintty.github.io/)

#### MacOS

- [Terminal](https://support.apple.com/guide/terminal/open-or-quit-terminal-apd5265185d-f365-44cb-8b09-71a064a42125/mac) 💻
- [iTerm](https://iterm2.com/)
- [Powershell](https://docs.microsoft.com/powershell/scripting/install/installing-powershell-core-on-macos?view=powershell-7?WT.mc_id=academic-13441-cxa)

#### Linux

- [Bash](https://www.gnu.org/software/bash/manual/html_node/index.html) 💻
- [KDE Konsole](https://docs.kde.org/trunk5/en/konsole/konsole/index.html)
- [Powershell](https://docs.microsoft.com/powershell/scripting/install/installing-powershell-core-on-linux?view=powershell-7?WT.mc_id=academic-13441-cxa)

#### Ferramentas Populares para Linha de Comando

- [Git](https://git-scm.com/) (💻 na maioria dos sistemas operacionais)
- [NPM](https://www.npmjs.com/)
- [Yarn](https://classic.yarnpkg.com/en/docs/cli/)

### Documentação

Quando uma pessoa desenvolvedora deseja aprender algo novo, provavelmente recorrerá à documentação para aprender como usá-la. As pessoas desenvolvedoras geralmente contam com a documentação para orientá-las sobre como usar ferramentas e linguagens de maneira adequada e também para obter um conhecimento mais profundo de como funciona.

#### Documentações Populares para Desenvolvimento de Web

- [Mozilla Developer Network (MDN)](https://developer.mozilla.org/docs/Web), do Mozilla, editores do [Firefox](https://www.mozilla.org/firefox/)
- [Frontend Masters](https://frontendmasters.com/learn/)
- [Web.dev](https://web.dev), do Google, editores do [Chrome](https://www.google.com/chrome/)
- [Documentos de desenvolvedor da própria Microsoft](https://docs.microsoft.com/microsoft-edge/#microsoft-edge-for-developers), para [Microsoft Edge](https://www.microsoft.com/edge)

✅ Faça uma pesquisa: agora que você conhece os fundamentos do ambiente de desenvolvimento da web, compare-o com o ambiente de um web designer.


---

## 🚀 Desafio

Compare algumas linguagens de programação. Quais são algumas das características únicas de JavaScript vs. Java? E COBOL x Go?



## Quiz Pós-Aula

[Quiz Pós-Aula](https://happy-mud-02d95f10f.azurestaticapps.net/quiz/2)

## Revisão & Autoestudo

Estude um pouco sobre as diferentes linguagens de programação à disposição. Tente escrever uma linha em uma delas e depois refaça em outras duas. O que você aprende?


## Lição de casa

[Lendo Documentação](assignment.pt.md)

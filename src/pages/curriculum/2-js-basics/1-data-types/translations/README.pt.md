# Noções básicas de JavaScript: Tipos de dados

![Noções básicas de JavaScript: Tipos de dados](../../../sketchnotes/webdev101-js-datatypes.png)
> Sketchnote por [Tomomi Imura](https://twitter.com/girlie_mac)

## Quiz Pré-Aula
[Quiz Pré-Aula](https://happy-mud-02d95f10f.azurestaticapps.net/quiz/7)

Esta lição cobre o básico do JavaScript, a linguagem que fornece interatividade na web.

[![Variáveis](https://img.youtube.com/vi/u_aLTZHsclg/0.jpg)](https://youtube.com/watch?v=u_aLTZHsclg "Variáveis")

[![Data Types](https://img.youtube.com/vi/ylaZV-UKTe4/0.jpg)](https://youtube.com/watch?v=ylaZV-UKTe4 "Data Types")


Vamos começar com variáveis e os tipos de dados que as preenchem!

## Variáveis

Variáveis armazenam valores que podem ser usados e alterados em todo o código.

A criação e **declaração** de uma variável tem a seguinte sintaxe **[palavra-chave] [nome]**. É composto de duas partes:

- **Palavra-chave**. Palavras-chave podem ser `let` ou` var`.  

> Nota, a palavra-chave `let` foi introduzida no ES6 e dá a sua variável o chamado _block scope_ ou escopos do bloco. É recomendado que você use `let` sobre `var`. Abordaremos os escopos do bloco mais detalhadamente em partes futuras.
- **O nome da variável**, este é um nome que você escolhe.

### Tarefa - trabalhando com variáveis

1. **Declare uma variável**. Vamos declarar uma variável usando a palavra-chave `let`:

    ```javascript
    let minhaVariavel;
    ```

   `minhaVariavel` agora foi declarada usando a palavra-chave`let`. Atualmente não tem um valor.

1. **Atribua um valor**. Armazene um valor em uma variável com o operador `=`, seguido pelo valor esperado.
    ```javascript
    minhaVariavel = 123;
    ```

   > Nota: o uso de `=` nesta lição significa que fazemos uso de um "operador de atribuição", usado para definir um valor para uma variável. Não denota igualdade.

   `minhaVariavel` agora foi *inicializada* com o valor 123.

1. **Refatorar**. Substitua seu código pela seguinte instrução.

    ```javascript
    let minhaVariavel = 123;
    ```

    O acima é chamado de _inicialização explícita_ quando uma variável é declarada e recebe um valor ao mesmo tempo.

1. **Altere o valor da variável**. Altere o valor da variável da seguinte maneira:

   ```javascript
   minhaVariavel = 321;
   ```

   Uma vez que uma variável é declarada, você pode alterar seu valor em qualquer ponto do seu código com o operador `=` e o novo valor.

   ✅ Tente isso! Você pode escrever JavaScript diretamente no seu navegador. Abra uma janela do navegador e navegue até Ferramentas do desenvolvedor. No console, você encontrará um prompt; digite `let myVariable = 123`, pressione return e, em seguida, digite` myVariable`. O que acontece? Observe que você aprenderá mais sobre esses conceitos nas lições subsequentes.

## Constantes

A declaração e a inicialização de uma constante seguem os mesmos conceitos de uma variável, com exceção da palavra-chave `const`. Normalmente, as constantes são declaradas com todas as letras maiúsculas.

```javascript
const MY_VARIABLE = 123;
```

As constantes são semelhantes às variáveis, com duas exceções: 

- **Deve ter um valor**. As constantes devem ser inicializadas ou ocorrerá um erro ao executar o código.
- **A referência não pode ser alterada**. A referência de uma constante não pode ser alterada depois de inicializada, ou ocorrerá um erro ao executar o código. Vejamos dois exemplos:
   - **Valor simples**. O seguinte NÃO é permitido:
   
      ```javascript
      const PI = 3;
      PI = 4; // NÃO é permitido
      ```
 
   - **A referência do objeto está protegida**. O seguinte NÃO é permitido.
   
      ```javascript
      const obj = { a: 3 };
      obj = { b: 5 } // NÃO é permitido
      ```

    - **O valor do objeto não está protegido**. O seguinte é permitido:
    
      ```javascript
      const obj = { a: 3 };
      obj.a = 5;  // permitido
      ```

      Acima você está alterando o valor do objeto, mas não a referência em si, o que o torna permitido.

   > Nota, um `const` significa que a referência está protegida contra reatribuição. O valor não é _imutável_ e pode mudar, especialmente se for uma construção complexa como um objeto.

## Tipos de Dados

As variáveis podem armazenar muitos tipos diferentes de valores, como números e texto. Esses vários tipos de valores são conhecidos como **tipo de dados**. Os tipos de dados são uma parte importante do desenvolvimento de software porque ajudam as pessoas desenvolvedoras a tomar decisões sobre como o código deve ser escrito e como o software deve ser executado. Além disso, alguns tipos de dados têm recursos exclusivos que ajudam a transformar ou extrair informações adicionais em um valor.

✅ Os tipos de dados também são chamados de primitivos de dados JavaScript, pois são os tipos de dados de nível mais baixo fornecidos pela linguagem. Existem 6 tipos de dados primitivos: string, number, bigint, boolean, undefined, e symbol. Reserve um minuto para visualizar o que cada uma dessas primitivas pode representar. O que é uma `zebra`? Que tal `0`? `true`?

### Números (Numbers)

Na seção anterior, o valor de `myVariable` era um tipo de dado numérico.

`let myVariable = 123;`

As variáveis podem armazenar todos os tipos de números, incluindo decimais ou números negativos. Os números também podem ser usados com operadores aritméticos, abordados na [próxima seção](#Operadores-aritméticos).

### Operadores aritméticos

Existem vários tipos de operadores para usar ao executar funções aritméticas, e alguns estão listados aqui:

| Símbolo | Descrição                                                | Examplo                             |
| ------- | -------------------------------------------------------- | ----------------------------------- |
| `+`     | **Adição**: Calcula a soma de dois números               | `1 + 2 //a resposta esperada é 3`   |
| `-`     | **Subitração**: Calcula a diferença de dois números      | `1 - 2 //a resposta esperada é -1`  |
| `*`     | **Multiplicação**: Calcula o produto de dois números     | `1 * 2 //a resposta esperada é 2`   |
| `/`     | **Divisão**: Calcula o quociente de dois números         | `1 / 2 //a resposta esperada é 0.5` |
| `%`     | **Restante**: Calcula o resto da divisão de dois números | `1 % 2 //a resposta esperada é 1`   |

✅ Tente isso! Tente uma operação aritmética no console do seu navegador. Os resultados surpreendem você?

### Strings

Strings são conjuntos de caracteres que residem entre aspas simples ou duplas.

- `'Isso é uma string'`
- `"Isso também é uma string"`
- `let myString = 'Este é um valor de string armazenado em uma variável';`

Lembre-se de usar aspas ao escrever uma string, caso contrário, o JavaScript assumirá que é um nome de variável.

### Formatando Strings

Strings são textuais e requerem formatação de vez em quando.

Para **concatenar** duas ou mais strings, ou juntá-las, use o operador `+`.

```javascript
let myString1 = "Olá";
let myString2 = "Mundo";

myString1 + myString2 + "!"; //OláMundo!
myString1 + " " + myString2 + "!"; //Olá Mundo!
myString1 + ", " + myString2 + "!"; //Olá, Mundo!

```

✅ Por que `1 + 1 = 2` em JavaScript, mas` '1' + '1' = 11? `Pense nisso. Que tal `'1' + 1`?

**Template literals (Literais de modelo)** são outra maneira de formatar strings, exceto em vez de aspas, o crase é usado. Qualquer coisa que não seja texto simples deve ser colocado dentro dos espaços reservados `$ {}`. Isso inclui todas as variáveis que podem ser strings.

```javascript
let myString1 = "Olá";
let myString2 = "Mundo";

`${myString1} ${myString2}!` //Olá Mundo!
`${myString1}, ${myString2}!` //Olá, Mundo!
```

Você pode atingir seus objetivos de formatação com qualquer um dos métodos, mas os Template literals respeitarão todos os espaços e quebras de linha.

✅ Quando você usaria um literal de modelo em vez de uma string simples?

### Booleanos

Os booleanos podem ter apenas dois valores: `true` ou` false`. Os booleanos podem ajudar a tomar decisões sobre quais linhas de código devem ser executadas quando certas condições são atendidas. Em muitos casos, [operadores](#Operadores-aritméticos) auxiliam na configuração do valor de um booleano e você freqüentemente notará e escreverá variáveis sendo inicializadas ou seus valores sendo atualizados com um operador.

- `let myTrueBool = true`
- `let myFalseBool = false`

✅ Uma variável pode ser considerada 'true' se for avaliada como um booleano `true`. Curiosamente, em JavaScript, [todos os valores são verdadeiros, a menos que definidos como falsos](https://developer.mozilla.org/docs/Glossary/Truthy).

---

## 🚀 Desafio

JavaScript é notório por suas maneiras surpreendentes de lidar com tipos de dados ocasionalmente. Pesquise sobre essas 'pegadinhas'. Por exemplo: a diferenciação de maiúsculas e minúsculas pode afetar! Tente isto em seu console: `let age = 1; deixe Idade = 2; age == Age` (resolve `false` - por quê?). Que outras dicas você pode encontrar?

## Quiz Pós-Aula
[Quiz Pós-Aula](https://happy-mud-02d95f10f.azurestaticapps.net/quiz/8)

## Revisão e autoestudo

Dê uma olhada [nessa lista de exercícios de JavaScript](https://css-tricks.com/snippets/javascript/) e tente resolver um exercício. O que você aprendeu?

## Tarefa

[Prática de Tipos de Dados](assignment.pt.md)

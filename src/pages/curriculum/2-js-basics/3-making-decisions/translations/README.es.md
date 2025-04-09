# Conceptos básicos de JavaScript: tomar decisiones


![JavaScript Basics - Making decisions](../../../sketchnotes/webdev101-js-decisions.png)
> Sketchnote por [Tomomi Imura](https://twitter.com/girlie_mac)

## [Pre-lecture prueba](https://happy-mud-02d95f10f.azurestaticapps.net/quiz/11)

Tomar decisiones y controlar el orden en que se ejecuta su código hace que su código sea reutilizable y robusto. Esta sección cubre la sintaxis para controlar el flujo de datos en JavaScript y su importancia cuando se usa con tipos de datos booleanos.

[![tomar decisiones](https://img.youtube.com/vi/P0TrLOz15zk/0.jpg)](https://youtube.com/watch?v=P0TrLOz15zk "tomar decisiones")

## Un breve resumen sobre los valores booleanos

Los booleanos pueden tener solo dos valores: `true` o` false`. Los booleanos ayudan a tomar decisiones sobre qué líneas de código deben ejecutarse cuando se cumplen ciertas condiciones.

Establezca su booleano en verdadero o falso de esta manera:


`let myTrueBool = true`
`let myFalseBool = false`

✅ Los booleanos llevan el nombre del matemático, filósofo y lógico inglés George Boole. (1815–1864).

## Operadores de comparación y valores booleanos

Los operadores se utilizan para evaluar las condiciones haciendo comparaciones que crearán un valor booleano. La siguiente es una lista de operadores que se utilizan con frecuencia.

| Símbolo | Descripción                                                                                                                                                                  | Ejemplo            |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `<`     | **Mayor que**: compara dos valores y devuelve el tipo de datos booleano `true` si el valor del lado derecho es mayor que el del izquierdo                                    | `5 < 6 // true`    |
| `<=`    | **Mayor o igual que**: compara dos valores y devuelve el tipo de datos booleano `true` si el valor del lado derecho es mayor o igual que el del lado izquierdo               | `5 <= 6 // true`   |
| `>`     | **Menor que**: compara dos valores y devuelve el tipo de datos booleano `true` si el valor del lado izquierdo es mayor que el del derecho                                    | `5 > 6 // false`   |
| `=>`    | **Menor o igual que**: compara dos valores y devuelve el tipo de datos booleano `true` si el valor del lado izquierdo es mayor o igual que el del lado derecho               | `5 => 6 // false`  |
| `===`   | **Igualdad estricta**: compara dos valores y devuelve el tipo de datos booleano `true` si los valores de la derecha y la izquierda son iguales Y son del mismo tipo de datos | `5 === 6 // false` |
| `!==`   | **Desigualdad**: compara dos valores y devuelve el valor booleano opuesto de lo que devolvería un operador de igualdad estricta                                              | `5 !== 6 // true`  |

✅ Compruebe sus conocimientos escribiendo algunas comparaciones en la consola de su navegador. ¿Te sorprende algún dato devuelto?

## Declaración If

La sentencia if ejecutará código entre sus bloques si la condición es verdadera.

```javascript
if (condition){
    //La condición era verdadera. Se ejecutará el código de este bloque.
}
```

Los operadores lógicos se utilizan a menudo para formar la condición.

```javascript
let currentMoney;
let laptopPrice;

if (currentMoney >= laptopPrice){
    //La condición era verdadera. Se ejecutará el código de este bloque.
    console.log("Getting a new laptop!");
}
```

## IF..Else Declaración

La declaración `else` ejecutará el código entre sus bloques cuando la condición sea falsa. Es opcional con una declaración `if`.


```javascript
let currentMoney;
let laptopPrice;

if (currentMoney >= laptopPrice){
    //La condición era verdadera. Se ejecutará el código de este bloque.
    console.log("Getting a new laptop!");
}
else{
    //La condición era verdadera. Se ejecutará el código de este bloque.
    console.log("Can't afford a new laptop, yet!");
}
```

✅ Pruebe su comprensión de este código y del siguiente código ejecutándolo en una consola de navegador. Cambie los valores de las variables currentMoney y laptopPrice para cambiar el `console.log()` devuelto.

## Operadores lógicos y booleanos

Las decisiones pueden requerir más de una comparación y se pueden unir con operadores lógicos para producir un valor booleano.

| Símbolo | Descripción                                                                                                  | Ejemplo                                                                           |
| ------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| `&&`    | **AND lógico**: compara dos expresiones booleanas. Devuelve verdadero **solo** si ambos lados son verdaderos | `(5 > 6) && (5 < 6 ) //Un lado es falso, el otro es verdadero. Devuelve falso`    |
| `||`    | **OR lógico**: compara dos expresiones booleanas. Devuelve verdadero si al menos un lado es verdadero        | `(5 > 6) || (5 < 6) //Un lado es falso, el otro es verdadero. Devuelve verdadero` |
| `!`     | **NOT lógico**: Devuelve el valor opuesto de una expresión booleana                                          | `!(5 > 6) // 5 no es mayor que 6, pero "!" devolverá verdadero`                   |

## Condiciones y decisiones con operadores lógicos

Los operadores lógicos se pueden utilizar para formar condiciones en sentencias if..else.

```javascript
let currentMoney;
let laptopPrice;
let laptopDiscountPrice = laptopPrice - (laptopPrice * .20) //Precio del portátil al 20% de descuento

if (currentMoney >= laptopPrice || currentMoney >= laptopDiscountPrice){
    //La condición era verdadera. Se ejecutará el código de este bloque.
    console.log("Getting a new laptop!");
}
else {
    //La condición era verdadera. Se ejecutará el código de este bloque.
    console.log("Can't afford a new laptop, yet!");
}
```

### Operador de negación

Hasta ahora has visto cómo si puedes usar una instrucción `if...else` para crear lógica condicional. Cualquier cosa que entre en un `if` debe evaluarse como verdadero / falso. Utilizando el operador `!` Puede _negar_ la expresión. Se vería así:


```javascript
if (!condition) {
  // se ejecuta si la condición es falsa
} else {
  // se ejecuta si la condición es verdadera
}
```

### Expresiones ternarias

`If...else` no es la única forma de expresar la lógica de decisión. También puede usar algo llamado operador ternario. La sintaxis tiene el siguiente aspecto:

```javascript
let variable = condition ? <return this if true> : <return this if false>`
```

A continuación se muestra un ejemplo más tangible:

```javascript
let firstNumber = 20;
let secondNumber = 10
let biggestNumber = firstNumber > secondNumber ? firstNumber: secondNumber;
```

✅ Tómese un minuto para leer este código varias veces. ¿Entiende cómo trabajan estos operadores?

Lo anterior establece que
- si `firstNumber` es mayor que `secondNumber`
- luego asigne `firstNumber` a `biggestNumber`
- de lo contrario, asigne `secondNumber`.
  
La expresión ternaria es solo una forma compacta de escribir el siguiente código:

```javascript
let biggestNumber;
if (firstNumber > secondNumber) {
  biggestNumber = firstNumber;
} else {
  biggestNumber = secondNumber;
}
```

🚀 Desafío: cree un programa que se escriba primero con operadores lógicos y luego vuelva a escribirlo utilizando una expresión ternaria. ¿Cuál es tu sintaxis preferida?

## [Post-lecture prueba](https://happy-mud-02d95f10f.azurestaticapps.net/quiz/12)

## Revisión y autoestudio

Más información sobre los muchos operadores disponibles para el usuario [en MDN](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators).

**Asignación**: [Operadores](assignment.es.md)


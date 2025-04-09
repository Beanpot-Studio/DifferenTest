# Conceptos básicos de JavaScript: matrices y bucles

![JavaScript Basics - Arrays](../../../sketchnotes/webdev101-js-arrays.png)
> Sketchnote por [Tomomi Imura](https://twitter.com/girlie_mac)


[![Matrices](https://img.youtube.com/vi/4o64A0IewZ4/0.jpg)](https://youtube.com/watch?v=4o64A0IewZ4 "Matrices")
[![Bucles](https://img.youtube.com/vi/9mDkAALcX9o/0.jpg)](https://www.youtube.com/watch?v=9mDkAALcX9o "Bucles")

## [Pre-lecture prueba](https://happy-mud-02d95f10f.azurestaticapps.net/quiz/13)

Esta lección cubre los conceptos básicos de JavaScript, el lenguaje que proporciona interactividad en la web. En esta lección, aprenderá sobre matrices y bucles, que se utilizan para manipular datos.

## Matrices

Trabajar con datos es una tarea común para cualquier lenguaje y es una tarea mucho más fácil cuando los datos están organizados en un formato estructural, como matrices. Con las matrices, los datos se almacenan en una estructura similar a una lista. Uno de los principales beneficios de las matrices es que puede almacenar diferentes tipos de datos en una matriz.

✅ ¡Las matrices están a nuestro alrededor! ¿Puede pensar en un ejemplo de la vida real de una matriz, como una matriz de paneles solares?

La sintaxis de una matriz es un par de corchetes.

```javascript
let myArray = [];
```

Esta es una matriz vacía, pero las matrices se pueden declarar ya pobladas con datos. Varios valores en una matriz están separados por una coma.

```javascript
let iceCreamFlavors = ["Chocolate", "Strawberry", "Vanilla", "Pistachio", "Rocky Road"];
```

A los valores de la matriz se les asigna un valor único llamado **índice**, un número entero que se asigna en función de su distancia desde el principio de la matriz. En el ejemplo anterior, el valor de cadena "Chocolate" tiene un índice de 0 y el índice de "Rocky Road" es 4. Utilice el índice entre corchetes para recuperar, cambiar o insertar valores de matriz.

✅ ¿Le sorprende que las matrices comiencen en el índice cero? En algunos lenguajes de programación, los índices comienzan en 1. Hay una historia interesante en torno a esto, que puedes [leer en Wikipedia](https://en.wikipedia.org/wiki/Zero-based_numbering).

```javascript
let iceCreamFlavors = ["Chocolate", "Strawberry", "Vanilla", "Pistachio", "Rocky Road"];
iceCreamFlavors[2]; //"Vanilla"
```

Puede aprovechar el índice para cambiar un valor, como este:

```javascript
iceCreamFlavors[4] = "Butter Pecan"; //Se cambió "Rocky Road" a "Butter Pecan"
```

Y puede insertar un nuevo valor en un índice dado como este:

```javascript
iceCreamFlavors[5] = "Cookie Dough"; //Añadida "Cookie Dough"
```

✅ Una forma más común de enviar valores a una matriz es mediante el uso de operadores de matriz como array.push()

Para saber cuántos elementos hay en una matriz, use la propiedad `length`.

```javascript
let iceCreamFlavors = ["Chocolate", "Strawberry", "Vanilla", "Pistachio", "Rocky Road"];
iceCreamFlavors.length; //5
```

✅ ¡Inténtalo tú mismo! Utilice la consola de su navegador para crear y manipular una matriz de su propia creación.

## Bucles

Los bucles permiten tareas repetitivas o **iterativas** y pueden ahorrar mucho tiempo y código. Cada iteración puede variar en sus variables, valores y condiciones. Hay diferentes tipos de bucles en JavaScript y tienen pequeñas diferencias, pero esencialmente hacen lo mismo: bucles sobre datos.

### En bucle

El ciclo `for` requiere 3 partes para iterar:
     - `counter` Una variable que normalmente se inicializa con un número que cuenta el número de iteraciones.
     - `condition` Expresión que usa operadores de comparación para hacer que el bucle se detenga cuando `true`
     - `iteration-expression` Se ejecuta al final de cada iteración, generalmente se usa para cambiar el valor del contador

  
```javascript
// Contando hasta 10
for (let i = 0; i < 10; i++) {
  console.log(i);
}
```

✅ Ejecute este código en una consola de navegador. ¿Qué sucede cuando realiza pequeños cambios en el contador, la condición o la expresión de iteración? ¿Puedes hacer que corra al revés, creando una cuenta regresiva?

### Bucle while

A diferencia de la sintaxis para el ciclo `for`, los ciclos `while` solo requieren una condición que detendrá el ciclo cuando sea `true`. Las condiciones en los bucles suelen depender de otros valores, como contadores, y deben gestionarse durante el bucle. Los valores iniciales para los contadores deben crearse fuera del ciclo, y cualquier expresión que cumpla una condición, incluido el cambio del contador, debe mantenerse dentro del ciclo.

```javascript
//Contando hasta 10
let i = 0;
while (i < 10) {
 console.log(i);
 i++;
}
```

✅ ¿Por qué elegiría un bucle for frente a un bucle while? 17K espectadores tenían la misma pregunta sobre StackOverflow, y algunas de las opiniones [podrían ser interesantes para usted](https://stackoverflow.com/questions/39969145/while-loops-vs-for-loops-in-javascript).

## Bucles y matrices

Las matrices se utilizan a menudo con bucles porque la mayoría de las condiciones requieren la longitud de la matriz para detener el bucle, y el índice también puede ser el valor del contador.

```javascript
let iceCreamFlavors = ["Chocolate", "Strawberry", "Vanilla", "Pistachio", "Rocky Road"];

for (let i = 0; i < iceCreamFlavors.length; i++) {
  console.log(iceCreamFlavors[i]);
} //Termina cuando se imprimen todos los sabores
```

✅ Experimente recorriendo una serie de su propia creación en la consola de su navegador.

🚀 Desafío: Hay otras formas de realizar un bucle sobre arreglos además de los bucles for y while. Existen [forEach](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach), [for-of](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/for...of), y [map](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/map). Vuelva a escribir su bucle de matriz utilizando una de estas técnicas.

## [Post-lecture prueba](https://happy-mud-02d95f10f.azurestaticapps.net/quiz/14)

## Revisión y autoestudio

Las matrices en JavaScript tienen muchos métodos adjuntos, extremadamente útiles para la manipulación de datos. [Lea sobre estos métodos](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) y pruebe algunos de ellos (como push, pop, slice y splice) en una matriz de su creación.

**Asignación**: [Bucle de una matriz](assignment.es.md)

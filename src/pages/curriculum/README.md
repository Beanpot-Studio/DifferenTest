# Web Development for Beginners - A Curriculum

<style>
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 2rem 0;
    font-size: 0.9rem;
  }
  
  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
  }
  
  th {
    background-color: #f8fafc;
    font-weight: 600;
    color: #1e293b;
  }
  
  tr:nth-child(even) {
    background-color: #f8fafc;
  }
  
  tr:hover {
    background-color: #f1f5f9;
  }
  
  td:first-child {
    font-weight: 600;
    color: #1e293b;
  }
  
  a {
    color: #3b82f6;
    text-decoration: none;
  }
  
  a:hover {
    text-decoration: underline;
  }

  /* Code block styling */
  pre {
    background-color: #1e293b;
    color: #e2e8f0;
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin: 1rem 0;
    font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
    font-size: 0.9rem;
    line-height: 1.5;
  }

  code {
    font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
    background-color: #f1f5f9;
    padding: 0.2rem 0.4rem;
    border-radius: 0.25rem;
    color: #1e293b;
    font-size: 0.9em;
  }

  pre code {
    background-color: transparent;
    padding: 0;
    color: inherit;
    font-size: inherit;
  }

  /* Typography styling */
  h3 {
    color: #1e293b;
    font-size: 1.5rem;
    font-weight: 600;
    margin: 2rem 0 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #e2e8f0;
  }

  ul {
    margin: 1rem 0;
    padding-left: 1.5rem;
    list-style-type: disc;
  }

  li {
    margin: 0.5rem 0;
    line-height: 1.6;
    color: #334155;
  }

  li::marker {
    color: #3b82f6;
  }

  em {
    font-style: italic;
    color: #64748b;
    font-weight: 500;
  }

  /* Nested list styling */
  ul ul {
    margin: 0.5rem 0;
    list-style-type: circle;
  }

  ul ul li::marker {
    color: #94a3b8;
  }
</style>

Azure Cloud Advocates at Microsoft are pleased to offer a 12-week, 24-lesson curriculum all about JavaScript, CSS, and HTML basics. Each lesson includes pre- and post-lesson quizzes, written instructions to complete the lesson, a solution, an assignment and more. Our project-based pedagogy allows you to learn while building, a proven way for new skills to 'stick'.

## Lessons

|     |                            Concepts Taught                             | Learning Objectives                                                                                                                 |                                                         Linked Lesson                                                          |
| :-: | :------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------: |
| 01  |           Introduction to Programming and Tools of the Trade           | Learn the basic underpinnings behind most programming languages and about software that helps professional developers do their jobs | [Intro to Programming Languages and Tools of the Trade](/curriculum/1-getting-started-lessons/1-intro-to-programming-languages/) |
| 02  |             Basics of GitHub, includes working with a team             | How to use GitHub in your project, how to collaborate with others on a code base                                                    |                            [Intro to GitHub](/curriculum/1-getting-started-lessons/2-github-basics/)                             |
| 03  |                             Accessibility                              | Learn the basics of web accessibility                                                                                               |                       [Accessibility Fundamentals](/curriculum/1-getting-started-lessons/3-accessibility/)                       |
| 04  |                         JavaScript Data Types                          | The basics of JavaScript data types                                                                                                 |                                       [Data Types](/curriculum/2-js-basics/1-data-types/)                                        |
| 05  |                         Functions and Methods                          | Learn about functions and methods to manage an application's logic flow                                                             |                              [Functions and Methods](/curriculum/2-js-basics/2-functions-methods/)                               |
| 06  |                        Making Decisions with JS                        | Learn how to create conditions in your code using decision-making methods                                                           |                                 [Making Decisions](/curriculum/2-js-basics/3-making-decisions/)                                  |
| 07  |                            Arrays and Loops                            | Work with data using arrays and loops in JavaScript                                                                                 |                                   [Arrays and Loops](/curriculum/2-js-basics/4-arrays-loops/)                                    |
| 08  |                            HTML in Practice                            | Build the HTML to create an online terrarium, focusing on building a layout                                                         |                                 [Introduction to HTML](/curriculum/3-terrarium/1-intro-to-html/)                                 |
| 09  |                            CSS in Practice                             | Build the CSS to style the online terrarium, focusing on the basics of CSS including making the page responsive                     |                                  [Introduction to CSS](/curriculum/3-terrarium/2-intro-to-css/)                                  |
| 10  |                 JavaScript Closures, DOM manipulation                  | Build the JavaScript to make the terrarium function as a drag/drop interface, focusing on closures and DOM manipulation             |                  [JavaScript Closures, DOM manipulation](/curriculum/3-terrarium/3-intro-to-DOM-and-closures/)                   |
| 11  |                          Build a Typing Game                           | Learn how to use keyboard events to drive the logic of your JavaScript app                                                          |                                [Event-Driven Programming](/curriculum/4-typing-game/typing-game/)                                |
| 12  |                         Working with Browsers                          | Learn how browsers work, their history, and how to scaffold the first elements of a browser extension                               |                               [About Browsers](/curriculum/5-browser-extension/1-about-browsers/)                                |
| 13  | Building a form, calling an API and storing variables in local storage | Build the JavaScript elements of your browser extension to call an API using variables stored in local storage                      |                [APIs, Forms, and Local Storage](/curriculum/5-browser-extension/2-forms-browsers-local-storage/)                 |
| 14  |          Background processes in the browser, web performance          | Use the browser's background processes to manage the extension's icon; learn about web performance and some optimizations to make   |             [Background Tasks and Performance](/curriculum/5-browser-extension/3-background-tasks-and-performance/)              |
| 15  |             More Advanced Game Development with JavaScript             | Learn about Inheritance using both Classes and Composition and the Pub/Sub pattern, in preparation for building a game              |                      [Introduction to Advanced Game Development](/curriculum/6-space-game/1-introduction/)                       |
| 16  |                           Drawing to canvas                            | Learn about the Canvas API, used to draw elements to a screen                                                                       |                                [Drawing to Canvas](/curriculum/6-space-game/2-drawing-to-canvas/)                                |
| 17  |                   Moving elements around the screen                    | Discover how elements can gain motion using the cartesian coordinates and the Canvas API                                            |                           [Moving Elements Around](/curriculum/6-space-game/3-moving-elements-around/)                           |
| 18  |                          Collision detection                           | Make elements collide and react to each other using keypresses and provide a cooldown function to ensure performance of the game    |                              [Collision Detection](/curriculum/6-space-game/4-collision-detection/)                              |
| 19  |                             Keeping score                              | Perform math calculations based on the game's status and performance                                                                |                                    [Keeping Score](/curriculum/6-space-game/5-keeping-score/)                                    |
| 20  |                     Ending and restarting the game                     | Learn about ending and restarting the game, including cleaning up assets and resetting variable values                              |                                [The Ending Condition](/curriculum/6-space-game/6-end-condition/)                                 |
| 21  |                 HTML Templates and Routes in a Web App                 | Learn how to create the scaffold of a multipage website's architecture using routing and HTML templates                             |                            [HTML Templates and Routes](/curriculum/7-bank-project/1-template-route/)                             |
| 22  |                  Build a Login and Registration Form                   | Learn about building forms and handing validation routines                                                                          |                                           [Forms](/curriculum/7-bank-project/2-forms/)                                           |
| 23  |                   Methods of Fetching and Using Data                   | How data flows in and out of your app, how to fetch it, store it, and dispose of it                                                 |                                            [Data](/curriculum/7-bank-project/3-data/)                                            |
| 24  |                      Concepts of State Management                      | Learn how your app retains state and how to manage it programmatically                                                              |                                [State Management](/curriculum/7-bank-project/4-state-management/)                                |


**Authors: Jen Looper, Chris Noring, Christopher Harrison, Jasmine Greenaway, Yohan Lasorsa, Floor Drees, and sketchnote artist Tomomi Imura!**

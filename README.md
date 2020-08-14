# jq-memory-game

Simple memory game with cards

Based on [@Jonathan Tarnate](https://codepen.io/jstarnate)

Modifications over the original code:

- Adapted to jquery widget
- Count number of interactions
- Events
- Render by json data

## Dependencies

- jquery
- jQuery UI:
    - jQuery UI widget

## Features

- Options to configure the behavior
- Specify items by json data
- Shuffle cards
- Count the number of interactions
- Event to notify each interaction
- Event to notify completion

## Playground
[JS Fiddle](https://jsfiddle.net/Haztivity/3xnomLuf/3)

## Usage

Install with `npm i jq-memory-game`

### Vanilla ES2015

```html
<div id="game" class="jq-memory-game">
    <div data-jq-memory-game-interactions></div>
</div>
```

```javascript
import * as $ from "jquery";
//choose one of the follow options
//for jquery-ui package
import "jq-memory-game/esm2015/jquery-ui-deps";
//for jquery-ui-dist package
import "jquery-ui-dist/jquery-ui";
import "jq-memory-game";
 const $el = $("#game");
$el.memoryGame({
    data: [
        {
            id: "card 1",
            content: "Carta 1"
        },
        {
            id: "card 2",
            content: "Carta 2"
        },
        {
            id: "card 3",
            content: "Carta 3"
        }
    ]
});
$el.on("memoryGameCardFlipped", (event, memoryGameInstance)=> console.log("completed"));
$el.on("memoryGameCardStart", (event, memoryGameInstance)=> console.log("start"));
$el.on("memoryGameFlip",(event, memoryGameInstance, cardFlipped) => console.log("card flipped", cardFlipped));
$el.on(
    "memoryGameCardsCheck",
    (
        event,
        memoryGameInstance, // instance of the widget
        cardsMatch, // boolean, true if the cards match
        numInteractions, // number of interactions performed
        cardsFlipped // array with the two cards flipped
    ) => console.log("check c
```

**Please note** that depending of the bundler you are using other configurations may be necessary. For example, shimming JQuery and jQuery UI.

## jQuery UI
jQuery UI could be included in the projects in many different ways and with different packages, instead
of force you to use one, we leave up to you how to include it:

### Modularized
Using `npm i jquery-ui` that install the package allowing to import the widgets you want.

We provided a file with the imports of the required dependencies:
```typescript
import "jq-memory-game/esm2015/jquery-ui-deps";
```

### Options
```typescript
{
    // time to wait after flip two cards to restore their positions (if not match)
    timeToWaitBetweenInteractions: 1000,
    // shuffle the cards on game start
    shuffle: true,
    // selectors to find elements
    selector: {
        // element in which to indicate the number of interactions
        interactions: "[data-jq-memory-game-interactions], [jq-memory-game-interactions]"
    },
    // css classes for the elements
    classes: {
        // root element class
        root: "jq-memory-game",
        // added to the game and cards where disabled
        disabled: "jq-memory-game--disabled",
        // added for flipped cards
        flipped: "jq-memory-game__card--flipped",
        // added when the game is completed
        completed: "jq-memory-game--completed",
        // added to the board
        board: "jq-memory-game__board",
        // added if the card match
        match: "jq-memory-game__card--has-match",
        // added to the cards
        card: "jq-memory-game__card",
        // added to the back of the card
        cardBack: "jq-memory-game__card__back",
        // added to the front of the card
        cardFront: "jq-memory-game__card__front"
    },
    // cards to render
    data: [
        // the cards could be specified by string, function or image
        {
            // identifier for the card
            id: "card 1",
            // the front and the back could be specified (or not) as string, image, jquery object or function
            front: "Carta 1",
            back: "Back of the card"
        },
        {
            id: "card 2",
            front: {
                src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Android_P_logo.svg/768px-Android_P_logo.svg.png",
                alt: "Android Operating System Logo"
            }
        },
        {
            id: "card 3",
            front: (memoryGameBoard, item) => $("<span>"+item.id+"</span>")
        }
    ]
}
```

### Events

| Event name    | Detail           | Emit  |
| ------------- | ---------------- | ----- |
| memoryGameStart | Triggered when the game starts or is reset | |
| memoryGameCardFlipped | Triggered every time a single card is flipped | The card flipped |
| memoryGameCardsCheck | Triggered after check if the two cards flipped match | boolean indicating if the cards match, the number of interactions performed by the player, an array with the two cards flipped |
| memoryGameComplete | Triggered when the game is completed |

### Methods

Available methods to invoke:

| Method        | Short description       |
| ------------- | ----------------------- |
| destroy       | Destroy the widget      |
| disable       | Disable the widget      |
| enable        | Enable the widget       |
| flip          | Flip a card by index    |
| reset         | Reset the game |

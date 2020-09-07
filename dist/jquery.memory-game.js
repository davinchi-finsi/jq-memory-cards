/**
 * @license jq-memory-game v1.1.0
 * (c) 2020 Finsi, Inc. Based on @Jonathan Tarnate https://codepen.io/jstarnate
 */

(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
}((function () { 'use strict';

    (function ($) {
        $.widget("ui.memoryGame", {
            NAMESPACE: "memoryGame",
            _$board: null,
            _cards: null,
            _interactions: 0,
            _flipped: [],
            _match: [],
            _completed: false,
            _disableInteraction: false,
            _$interactions: null,
            ON_START: "memoryGameStart",
            ON_CARD_FLIPPED: "memoryGameCardFlipped",
            ON_CARDS_CHECK: "memoryGameCardsCheck",
            ON_COMPLETE: "memoryGameComplete",
            options: {
                timeToWaitBetweenInteractions: 1000,
                shuffle: true,
                selector: {
                    interactions: "[data-jq-memory-game-interactions], [jq-memory-game-interactions]"
                },
                autoPair: true,
                classes: {
                    root: "jq-memory-game",
                    disabled: "jq-memory-game--disabled",
                    flipped: "jq-memory-game__card--flipped",
                    completed: "jq-memory-game--completed",
                    board: "jq-memory-game__board",
                    match: "jq-memory-game__card--has-match",
                    card: "jq-memory-game__card",
                    cardBack: "jq-memory-game__card__back",
                    cardFront: "jq-memory-game__card__front"
                },
                data: []
            },
            _create: function () {
                this.element.addClass(this.options.classes.root);
                this._initialize();
            },
            _renderCard: function (item) {
                var _a, _b;
                var back;
                var front;
                // provide src to render an image
                if (((_a = item === null || item === void 0 ? void 0 : item.front) === null || _a === void 0 ? void 0 : _a.src) != null) {
                    front = "<img src=\"" + item.front.src + "\" alt=\"" + item.front.alt + "\"/>";
                }
                else {
                    // if the property is a function, invoke, otherwise just add the content. Could be a jquery selector
                    front = (typeof item.front) == "function" ? item.front(this, item) : item.front;
                }
                if (((_b = item === null || item === void 0 ? void 0 : item.back) === null || _b === void 0 ? void 0 : _b.src) != null) {
                    back = "<img src=\"" + item.back.src + "\" alt=\"" + item.back.alt + "\"/>";
                }
                else {
                    back = (typeof item.back) == "function" ? item.back(this, item) : item.back;
                }
                var $back = $("<div class=\"" + this.options.classes.cardBack + "\"></div>");
                var $front = $("<div class=\"" + this.options.classes.cardFront + "\"></div>");
                var $card = $("\n                <div class=\"" + this.options.classes.card + "\">\n                </div>\n            ");
                if (back) {
                    $back.append(back);
                }
                if (front) {
                    $front.append(front);
                }
                $card.append($back);
                $card.append($front);
                return $card;
            },
            _generateCards: function () {
                var _this = this;
                // generate the data for the cards
                this._cards = this.options.data.reduce(function (acc, item) {
                    // render the card
                    var $card = _this._renderCard(item);
                    // add the id of the card to be able to retrieve it
                    $card.data("card-id", item.id);
                    acc.push({
                        id: item.id,
                        $card: $card
                    });
                    // when autoPair is true, automatically generate the pair
                    if (_this.options.autoPair) {
                        acc.push({
                            id: item.id,
                            $card: $card.clone()
                        });
                    }
                    return acc;
                }, []);
                // when autoPair false, verify all the cards have their pair (only one)
                if (!this.autoPair) {
                    // group by id
                    var pairs = this._cards.reduce(function (acc, item) {
                        var group = acc[item.id];
                        if (group == null) {
                            group = [];
                            acc[item.id] = group;
                        }
                        group.push(item);
                        return acc;
                    }, {});
                    // each id must have 2 items
                    var errors = [];
                    for (var id in pairs) {
                        var group = pairs[id];
                        if (group.length != 2) {
                            errors.push("- id '" + id + "' has " + group.length + " item/s (exactly 2 items required)");
                        }
                    }
                    if (errors.length > 0) {
                        throw new Error("When the option 'autoPair' = false, all the items (cards) must be specified, 2 items for each id, but an incorrect number of items has been found:\n" +
                            errors.join("\n"));
                    }
                }
            },
            _renderBoard: function () {
                this._$board = $("<div class=\"" + this.options.classes.board + "\"></div>");
                this.element.append(this._$board);
            },
            _initialize: function () {
                this._renderBoard();
                this._generateCards();
                // delegate the click of the cards to the board
                this._$board.delegate("." + this.options.classes.card, "click." + this.NAMESPACE, this._onCardClick.bind(this));
                this.reset();
            },
            _updateInteractions: function (num) {
                this._interactions = num;
                if (this._$interactions) {
                    this._$interactions.text(this._interactions);
                }
            },
            // randomize the cards
            _shuffle: function (array) {
                for (var i = array.length - 1; i > 0; i--) {
                    // Generate random number
                    var j = Math.floor(Math.random() * (i + 1));
                    var temp = array[i];
                    array[i] = array[j];
                    array[j] = temp;
                }
                return array;
            },
            _onCardClick: function (event) {
                var cardIndex = $(event.currentTarget).data("cardIndex");
                this.flip(cardIndex);
            },
            _checkCards: function () {
                var _this = this;
                this._disableInteractions(true);
                this._updateInteractions(this._interactions + 1);
                var _a = this._flipped, cardA = _a[0], cardB = _a[1];
                // check if the two selected cards matches
                if (cardA.id == cardB.id) {
                    cardA.$card.addClass(this.options.classes.match);
                    cardB.$card.addClass(this.options.classes.match);
                    // store the matched cards
                    this._match = this._match.concat(this._flipped);
                }
                else {
                    // if cards doesn't match, reset the position after a specified time
                    setTimeout(function () {
                        cardA.$card.removeClass(_this.options.classes.flipped);
                        cardB.$card.removeClass(_this.options.classes.flipped);
                    }, this.options.timeToWaitBetweenInteractions);
                }
                // emit custom event
                this.element.trigger(this.ON_CARDS_CHECK, [this, cardA.id == cardB.id, this._interactions, this._flipped.slice()]);
                // reset flipped cards
                this._flipped = [];
                // check if all the cards has been paired
                if (this._match.length == this._cards.length) {
                    this.element.addClass(this.options.classes.completed);
                    this._completed = true;
                    this.element.trigger(this.ON_COMPLETE, [this]);
                }
                else {
                    setTimeout(function () {
                        _this._disableInteractions(false);
                    }, this.options.timeToWaitBetweenInteractions);
                }
            },
            // disable interactions with the cards without disabling the component
            _disableInteractions: function (disable) {
                this._disableInteraction = disable;
                if (disable) {
                    this._$cards.addClass(this.options.classes.disabled);
                }
                else {
                    this._$cards.removeClass(this.options.classes.disabled);
                }
            },
            getInteractions: function () {
                return this._interactions;
            },
            // flip a card by iindex
            flip: function (index) {
                if (!this.options.disabled && !this._disableInteraction && !this._completed) {
                    // verify the card for the specified index exists
                    if (index >= 0 && (index - 1) <= this._cards.length) {
                        var cardItem = this._cards[index];
                        var $card = cardItem.$card;
                        $card.addClass(this.options.classes.flipped);
                        this._flipped.push(cardItem);
                        // trigger custom event
                        this.element.trigger(this.ON_CARD_FLIPPED, [this, cardItem]);
                        // when 2 cards are flipped, check if matches
                        if (this._flipped.length >= 2) {
                            this._checkCards();
                        }
                    }
                    else {
                        throw new Error("The required card for index " + index + " does not exist");
                    }
                }
            },
            // reset the game
            reset: function () {
                this._disableInteraction = false;
                this._flipped = [];
                this._match = [];
                this._completed = false;
                this._$interactions = this.element.find(this.options.selector.interactions);
                this.element.removeClass(this.options.classes.completed);
                this._updateInteractions(0);
                if (this.options.shuffle) {
                    this._cards = this._shuffle(this._cards);
                }
                var cards = this._cards.map(function (card, index) {
                    card.$card.data("cardIndex", index);
                    return card.$card;
                });
                this._$board.append(cards);
                this._$cards = this._$board.find("." + this.options.classes.card);
                this._$cards.removeClass([this.options.classes.flipped, this.options.classes.match, this.options.classes.disabled]);
                this.element.trigger(this.ON_START, [this]);
            },
            /**
             * Destroy the component
             */
            destroy: function () {
                this.element.removeClass([
                    this.options.classes.root,
                    this.options.classes.disabled,
                    this.options.classes.completed
                ]);
                this._$options.off("." + this.NAMESPACE);
                this._$board.remove();
                //@ts-ignore
                this._super();
            },
            /**
             * Disable the widget
             */
            disable: function () {
                this.element.addClass(this.options.classes.disabled);
                this._disableInteractions();
                //@ts-ignore
                this._super();
            },
            /**
             * Enable the widget
             */
            enable: function () {
                this.element.removeClass(this.options.classes.disabled);
                this._enableInteractions();
                //@ts-ignore
                this._super();
            }
        });
    })(jQuery);

})));

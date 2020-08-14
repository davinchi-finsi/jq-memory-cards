(function ($) {
    $.widget("ui.memoryGame", {
        NAMESPACE: "memoryGame",
        _$board: null,
        _cards: null,
        _interactions: 0,
        _flipped: [],
        _match: [],
        _completed : false,
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
            let back;
            let front;
            if (item?.front?.src != null) {
                front = `<img src="${item.front.src}" alt="${item.front.alt}"/>`;
            } else {
                front = (typeof item.front) == "function" ? item.front(this, item) : item.front
            }
            if (item?.back?.src != null) {
                back = `<img src="${item.back.src}" alt="${item.back.alt}"/>`;
            } else {
                back = (typeof item.back) == "function" ? item.back(this, item) : item.back;
            }
            const $back = $(`<div class="${this.options.classes.cardBack}"></div>`);
            const $front = $(`<div class="${this.options.classes.cardFront}"></div>`);
            const $card = $(`
                <div class="${this.options.classes.card}">
                </div>
            `);
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
            this._cards = this.options.data.reduce((acc, item) => {
                const $card = this._renderCard(item);
                $card.data("card-id", item.id);
                acc.push({
                    id: item.id,
                    $card
                });
                acc.push({
                    id: item.id,
                    $card: $card.clone()
                });
                return acc;
            }, []);
        },
        _renderBoard: function () {
            this._$board = $(`<div class="${this.options.classes.board}"></div>`);
            this.element.append(this._$board);
        },
        _initialize: function () {
            this._renderBoard();
            this._generateCards();
            this._$board.delegate("." + this.options.classes.card,
                "click." + this.NAMESPACE,
                this._onCardClick.bind(this));
            this.reset();
        },
        _updateInteractions(num) {
            this._interactions = num;
            if (this._$interactions) {
                this._$interactions.text(this._interactions);
            }
        },
        _shuffle: function (array) {
            for (let i = array.length - 1; i > 0; i--) {

                // Generate random number
                const j = Math.floor(Math.random() * (i + 1));

                const temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
            return array;
        },
        _onCardClick: function (event) {
            const cardIndex = $(event.currentTarget).data("cardIndex");
            this.flip(cardIndex);
        },
        _checkCards: function () {
            this._disableInteractions(true);
            this._updateInteractions(this._interactions+1);
            const [cardA, cardB] = this._flipped;
            if (cardA.id == cardB.id) {
                cardA.$card.addClass(this.options.classes.match);
                cardB.$card.addClass(this.options.classes.match);
                this._match = this._match.concat(this._flipped);
            } else {
                setTimeout(() => {
                    cardA.$card.removeClass(this.options.classes.flipped);
                    cardB.$card.removeClass(this.options.classes.flipped);
                }, this.options.timeToWaitBetweenInteractions);
            }
            this.element.trigger(this.ON_CARDS_CHECK, [this, cardA.id == cardB.id, this._interactions, this._flipped.slice()]);
            this._flipped = [];
            if (this._match.length == this._cards.length) {
                this.element.addClass(this.options.classes.completed);
                this._completed = true;
                this.element.trigger(this.ON_COMPLETE, [this]);
            } else {
                setTimeout(() => {
                    this._disableInteractions(false);
                }, this.options.timeToWaitBetweenInteractions);
            }
        },
        _disableInteractions: function (disable) {
            this._disableInteraction = disable;
            if (disable) {
                this._$cards.addClass(this.options.classes.disabled);
            } else {
                this._$cards.removeClass(this.options.classes.disabled);
            }
        },
        getInteractions : function() {
            return this._interactions;
        },
        flip: function (index) {
            if (!this.options.disabled && !this._disableInteraction && !this._completed) {
                if (index >= 0 && (index - 1) <= this._cards.length) {
                    const cardItem = this._cards[index];
                    this.element.trigger(this.ON_CARD_FLIPPED, [this, cardItem]);
                    const $card = cardItem.$card;
                    $card.addClass(this.options.classes.flipped);
                    this._flipped.push(cardItem);
                    if (this._flipped.length >= 2) {
                        this._checkCards();
                    }
                } else {
                    throw new Error("The required card for index " + index + " does not exist");
                }
            }
        },
        reset() {
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
            const cards = this._cards.map((card, index) => {
                card.$card.data("cardIndex", index);
                return card.$card;
            });
            this._$board.append(cards);
            this._$cards = this._$board.find("."+this.options.classes.card);
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

class CharacterCount {
    constructor(context = document) {
        this.context = context;

        this.getElements();
        this.setElements();
        this.setEvents();
    }

    getElements() {
        this.elements = this.context.querySelectorAll('.js-character-count');
    }

    setElements() {
        this.elements.forEach(element => {
            this.setCharacterCountText(element);
        });
    }

    setEvents() {
        this.elements.forEach(element => {
            element.addEventListener('keydown', event => {
                this.setCharacterCountText(event.target);
            });

            element.addEventListener('keyup', event => {
                this.setCharacterCountText(event.target);
            });
        });
    }

    setCharacterCountText(element) {
        const count = parseInt(element.getAttribute('maxlength')) - element.value.length;
        const text = count === 1 ? 'character remaining' : 'characters remaining';

        element.nextElementSibling.innerHTML = `${count} ${text}`;
    }
};

const characterCount = new CharacterCount(document.querySelector('.js-form'));
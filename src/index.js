/**
 * Created by ndyumin on 28.03.2016.
 */
const Rx = require('rx');

const values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];
const deck = [].concat(...['H', 'D', 'C', 'S'].map(suit =>
    values.map(value => ({value: values.indexOf(value), name: value + suit}))));

function swap(arr, i, j) {
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
}

function shuffle(deck) {
    const shuffled = Array.from(deck);
    for (let i = shuffled.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * i);
        swap(shuffled, i, j);
    }
    return shuffled;
}

const render = el => color => text => {
    const cardElement = document.createElement('div');
    cardElement.style.backgroundColor = color;
    cardElement.textContent = text;
    el.appendChild(cardElement);
};
const renderCard = render(document.getElementById('cards'));

const hi$ = Rx.Observable.fromEvent(document.getElementById('hi'), 'click').map(() => 'hi');
const lo$ = Rx.Observable.fromEvent(document.getElementById('lo'), 'click').map(() => 'lo');
const reset$ = Rx.Observable.fromEvent(document.getElementById('reset'), 'click');
const $size = document.getElementById('size');
const size$ = Rx.Observable.fromEvent($size, 'change')
    .map(e => e.target.value)
    .startWith($size.value);

size$.flatMapLatest(size => {
        document.getElementById('cards').innerHTML = '';
        const clicks$ = hi$.merge(lo$);
        const cards$ = Rx.Observable.from(shuffle(deck));

        cards$.first()
            .map(card => card.name)
            .subscribe(renderCard('white'));
        return cards$.take(size)
            .pairwise()
            .map(([x, y]) => [y, x.value < y.value ? 'hi' : 'lo'])
            .zip(clicks$)
            .scan(([left, _msg], msg) => [left - 1, msg], [size - 1])
            .map(([index, [[{name}, x], y]]) => {
                if (x === y) {
                    return index === 0 ? ['win', name] : ['next', name];
                } else {
                    return ['lose', 'game over: ' + name];
                }
            });
    })
    .subscribe(
        ([type, data]) => {
            switch (type) {
                case 'next':
                    renderCard('white')(data);
                    break;
                case 'win':
                    renderCard('#ddffdd')(data);
                    break;
                case 'lose':
                    renderCard('#ffdddd')(data);
                    break;
            }
        }
    );

reset$.subscribe(() => location.reload(false));
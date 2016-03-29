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
        const j =  Math.floor(Math.random() * i);
        swap(shuffled, i, j);
    }
    return shuffled;
}

function render(card) {
    console.log(card.name);
}

const hi$ = Rx.Observable.fromEvent(document.getElementById('hi'), 'click').map(() => 'hi');
const lo$ = Rx.Observable.fromEvent(document.getElementById('lo'), 'click').map(() => 'lo');
const reset$ = Rx.Observable.fromEvent(document.getElementById('reset'), 'click');
const clicks$ = hi$.merge(lo$);
const cards$ = Rx.Observable.from(shuffle(deck));

const seq$ = cards$.take(4)
    .pairwise()
    .map(([x, y]) => [y, x.value < y.value ? 'hi' : 'lo']);

seq$.zip(clicks$)
    .map(([[card, x], y]) => {
        if (x === y) {
            return card;
        } else {
            throw [card.name, 'game over'];
        }
    })
    .subscribe(
        render,
        v => console.warn(v),
        v => console.info('win')
    );

cards$.first().subscribe(render);
reset$.subscribe(() => location.reload(false));
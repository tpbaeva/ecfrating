// Page logic: games are scored in order, each against the rating after the
// previous games, and the per-game changes are summed.

const ownInput = document.getElementById('own-rating');
const gamesList = document.getElementById('games');
const template = document.getElementById('game-template');
const juniorToggle = document.getElementById('junior');
const gamesMonthInput = document.getElementById('games-month');

function parseRating(input) {
  const value = input.value.trim();
  if (!/^\d+$/.test(value)) return null;
  return parseInt(value, 10);
}

function formatChange(x) {
  const s = roundTenth(x).toFixed(1);
  return x > 0 ? '+' + s : s;
}

function addGame() {
  const li = template.content.firstElementChild.cloneNode(true);
  li.querySelector('.remove').addEventListener('click', () => {
    li.remove();
    recalc();
  });
  li.querySelectorAll('.result button').forEach((btn) => {
    btn.addEventListener('click', () => {
      li.querySelectorAll('.result button').forEach((b) =>
        b.setAttribute('aria-checked', String(b === btn)));
      li.dataset.result = btn.dataset.result;
      recalc();
    });
  });
  gamesList.appendChild(li);
  li.querySelector('.opp-rating').focus();
  recalc();
}

function recalc() {
  const own = parseRating(ownInput);
  const games = [];
  const changeEls = [];
  let points = 0;

  gamesList.querySelectorAll('.game').forEach((li, i) => {
    li.querySelector('.game-num').textContent = 'Game ' + (i + 1);
    const opp = parseRating(li.querySelector('.opp-rating'));
    const result = li.dataset.result === undefined ? null : Number(li.dataset.result);
    const changeEl = li.querySelector('.change');
    changeEl.textContent = '–';
    changeEl.className = 'change';

    if (own === null || opp === null || result === null) return;
    games.push([opp, result]);
    changeEls.push(changeEl);
    points += result;
  });

  const counted = games.length;
  const ready = own !== null && counted > 0;
  const { changes, total, k } =
    monthUpdate(own, games, juniorToggle.checked, parseRating(gamesMonthInput));
  changes.forEach((change, i) => {
    changeEls[i].textContent = formatChange(change);
    changeEls[i].className = 'change ' + (change > 0 ? 'up' : change < 0 ? 'down' : '');
  });
  const kNote = k === 20 ? '' : ` (K=${roundTenth(k)})`;
  document.getElementById('score').textContent = ready ? `${points} / ${counted}` : '–';
  document.getElementById('total').textContent = ready ? formatChange(total) + kNote : '–';
  document.getElementById('new-rating').textContent =
    ready ? String(Math.round(newRating(own, roundTenth(total)))) : '–';
}

ownInput.addEventListener('input', recalc);
juniorToggle.addEventListener('change', recalc);
gamesMonthInput.addEventListener('input', recalc);
gamesList.addEventListener('input', recalc);
document.getElementById('add-game').addEventListener('click', addGame);

addGame();
ownInput.focus();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

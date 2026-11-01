// ECF rating update calculation.
// Mirrors get_update() in python/ecf_rating.py; tests/test.html checks they agree.

// [D Min, D Max, D Offset] from python/ecf_table.csv
const ECF_TABLE = [
  [0, 3, 0.0],
  [4, 10, 0.2],
  [11, 17, 0.4],
  [18, 25, 0.6],
  [26, 32, 0.8],
  [33, 39, 1.0],
  [40, 46, 1.2],
  [47, 53, 1.4],
  [54, 61, 1.6],
  [62, 68, 1.8],
  [69, 76, 2.0],
  [77, 83, 2.2],
  [84, 91, 2.4],
  [92, 98, 2.6],
  [99, 106, 2.8],
  [107, 113, 3.0],
  [114, 121, 3.2],
  [122, 129, 3.4],
  [130, 137, 3.6],
  [138, 145, 3.8],
  [146, 153, 4.0],
  [154, 162, 4.2],
  [163, 170, 4.4],
  [171, 179, 4.6],
  [180, 188, 4.8],
  [189, 197, 5.0],
  [198, 206, 5.2],
  [207, 215, 5.4],
  [216, 225, 5.6],
  [226, 235, 5.8],
  [236, 245, 6.0],
  [246, 256, 6.2],
  [257, 267, 6.4],
  [268, 278, 6.6],
  [279, 289, 6.8],
  [290, 302, 7.0],
  [303, 315, 7.2],
  [316, 328, 7.4],
  [329, 344, 7.6],
  [345, 357, 7.8],
  [358, 374, 8.0],
  [375, 391, 8.2],
  [392, 10000, 8.4],
];

// Result points -> base multiplier (win, draw, loss)
const RESULT_BASE = { 1: 1, 0.5: 0, 0: -1 };

function getUpdate(ownRating, opponentRating, result) {
  const diff = opponentRating - ownRating;
  const adiff = Math.abs(diff);
  const row = ECF_TABLE.find(([dMin, dMax]) => dMin <= adiff && adiff <= dMax);
  // stronger opponent: gain the offset; weaker opponent: lose it
  const offset = diff < 0 ? -row[2] : row[2];
  const base = 10 * RESULT_BASE[result];
  return base + offset;
}

// Juniors (under 18) use K=40 when their rating goes up this month;
// K is capped so that K x games never exceeds 700.
function playerK(baseTotal, nGames, junior) {
  let k = junior && baseTotal > 0 ? 40 : 20;
  if (k * nGames > 700) k = 700 / nGames;
  return k;
}

// updates are per-game values at K=20 from getUpdate, all for one month;
// gamesThisMonth (if given) is the player's full count for the K cap.
function totalUpdate(updates, junior, gamesThisMonth = null) {
  const baseTotal = updates.reduce((a, b) => a + b, 0);
  const nGames = Math.max(updates.length, gamesThisMonth || 0);
  const k = playerK(baseTotal, nGames, junior);
  return { total: baseTotal * k / 20, k };
}

function newRating(oldRating, total) {
  return Math.max(100, oldRating + total);
}

// Rounds away float noise from summing 0.2 steps (e.g. 8.600000000000001).
function roundTenth(x) {
  return Math.round(x * 10) / 10;
}

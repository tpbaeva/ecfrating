# ecfrating

Web app to calculate an ECF rating update over one or more games.

Enter your rating, add each game in the month (opponent rating and result),
and see the change per game, the total change and your new rating. Every game
is calculated from your starting rating and the changes are added up.

The calculation follows the ECF K rating algorithm:

- Game change = D Offset (from the Elo table, negative if the opponent is
  lower rated) + 10 for a win / 0 for a draw / -10 for a loss, at K = 20.
- **Junior Rating** (on by default): if the month's total is positive, K = 40,
  which doubles it.
- K is capped so that K x number of games never exceeds 700. The optional
  "Games this month" field gives the player's full count for this cap
  (otherwise the number of games entered is used).
- The junior K=40 is decided from the games entered, assuming the rest of
  the month goes the same way.
- The new rating is never below 100.

Works on phone and desktop; it can be added to the home screen and used offline.

## Files

- `index.html`, `style.css`, `app.js` – the web app
- `ecf.js` – the rating calculation and table (JavaScript port of the Python)
- `manifest.json`, `sw.js`, `icons/` – install-to-home-screen and offline support
- `python/` – reference implementation (`ecf_rating.py`) and the rating table (`ecf_table.csv`)
- `tests/` – checks that the JavaScript and Python give the same results

## Run locally

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Tests

```sh
python3 tests/make_cases.py
```

This checks the table in `ecf.js` matches `python/ecf_table.csv` and regenerates
`tests/cases.js` from the Python implementation. Then open
http://localhost:8000/tests/test.html to check the JavaScript gives the same answers.

## Updating the app

`sw.js` always fetches the latest files from the network and keeps a cached
copy, which is used when offline (or if the network takes over 3 seconds).
If you add or rename files, update the `FILES` list in `sw.js` and bump `CACHE`.

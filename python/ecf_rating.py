#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Thu May 14 15:40:31 2026

@author: tpb
"""

import csv
import math
from pathlib import Path

DEFAULT_TABLE = Path(__file__).parent / 'ecf_table.csv'


def get_update(own_rating, opponent_rating, result, table):

    diff = opponent_rating - own_rating
    adiff = abs(diff)
    offset = next(d_offset for d_min, d_max, d_offset in table
                  if d_min <= adiff <= d_max)
    # stronger opponent: gain the offset; weaker opponent: lose it
    if diff < 0:
        offset = -offset

    result_map = {1 : 1,
                  0.5 : 0,
                  0. : -1,
                  }
    base = 10 * result_map[result]
    update = base + offset
    return update


def get_player_k(base_total, n_games, junior):
    # juniors (under 18) use K=40 when their rating goes up this month
    k = 40 if junior and base_total > 0 else 20
    if k * n_games > 700:
        k = 700 / n_games
    return k


def get_game_changes(own_rating, games, k, table):
    # games are (opponent_rating, result) in the order played; each game is
    # scored against the rating after the previous games (rounded half up to
    # a whole number for the table lookup), and its change is scaled by k
    rating = own_rating
    changes = []
    for opponent_rating, result in games:
        change = get_update(math.floor(rating + 0.5), opponent_rating, result,
                            table) * k / 20
        changes.append(change)
        rating += change
    return changes


def get_month_update(own_rating, games, junior, table, games_this_month=None):
    # games_this_month (if given) is the player's full count for the K cap;
    # juniors get K=40 if the month comes out positive when played at K=40
    n_games = max(len(games), games_this_month or 0)
    k = get_player_k(1, n_games, junior)
    changes = get_game_changes(own_rating, games, k, table)
    if sum(changes) <= 0:
        k = get_player_k(0, n_games, junior)
        changes = get_game_changes(own_rating, games, k, table)
    return changes, k


def get_new_rating(old_rating, total_update):
    return max(100, old_rating + total_update)


def get_table(filename=DEFAULT_TABLE):

    with open(filename, newline='') as f:
        rows = list(csv.reader(f))

    header = rows[1]
    i_min = header.index('D Min')
    i_max = header.index('D Max')
    i_offset = header.index('D Offset')

    table = []
    for row in rows[2:]:
        if not row[i_min].strip():
            continue
        table.append((int(row[i_min]), int(row[i_max]), float(row[i_offset])))

    return table

if __name__ == '__main__':

    table = get_table()
    print(get_update(996, 1472, 0.5, table))
    print(get_update(996, 1518, 1, table))
    #print(get_update(1124, 1274, 0.5, table))

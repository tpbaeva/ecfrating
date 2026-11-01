#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Thu May 14 15:40:31 2026

@author: tpb
"""

import csv
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


def get_total_update(updates, junior, games_this_month=None):
    # updates are per-game values at K=20 from get_update, all for one month;
    # games_this_month (if given) is the player's full count for the K cap
    base_total = sum(updates)
    n_games = max(len(updates), games_this_month or 0)
    k = get_player_k(base_total, n_games, junior)
    return base_total * k / 20


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

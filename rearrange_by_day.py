import json
import dateparser
from collections import OrderedDict
from datetime import datetime
from statistics import mean, median
from math import floor
def sort_fxn(dt):
    time_str = dt[0]
    p = dateparser.parse(str(time_str))
    # print(str(p))
    if p is None:
        print(str(time_str))
    return float(datetime.timestamp(p))
max_num_sounds = 0
max_ts = None
db_list = []
MEDIAN = 31.63172027543478
position_years = {}

with open("annotations.json", "r") as sound_file:
    sound_dict = json.load(sound_file)
    # date_set = set()
    dates = dict()
    for sound in sound_dict.copy().values():
        pos_str = str(sound["latitude"])+","+str(sound["longitude"])
        yr = sound.get("year")
        name = sound.get("name")
        if pos_str in position_years.keys():
            if position_years[pos_str].get(str(yr)) is None:
                position_years[pos_str][str(yr)] = [name]
            else:
                position_years[pos_str][str(yr)].append(name)
            continue
        else:
            position_years[pos_str] = {str(yr): [name]}
        ts = sound.get("human_ts")
        db_ = sound.get("decibels")
        if (ts is None) or (db_ is None):
            # print(sound)
            continue
        avg_db = mean(db_)
        sound["avg_db"] = avg_db
        ratio = avg_db/MEDIAN
        rel_vol = floor(ratio*100)
        bias = 10 if rel_vol >= 100 else -10
        penalty = (ratio**2) * bias
        sound["modified_db"] = floor(rel_vol + penalty)
        db_list .append(sound["modified_db"])
        # h = dateparser.parse(str(ts))
        # if h is None:
        #     print(ts)
        if dates.get(ts) is None:
            dates[ts] = [sound]
        else:
            dates[ts].append(sound)
            if len(dates[ts]) > max_num_sounds:
                max_num_sounds = len(dates[ts])
                max_ts = ts
    # dates.sort(key=lambda dt: dateparser.parse(dt)) 
    with open("unsorted.json", "w") as uns:
        json.dump(obj=dates, fp=uns)
    print(max(db_list))
    print(median(db_list))
    print(min(db_list))
    sorted_dates = OrderedDict()
    for k,v in sorted(dates.items(), key=sort_fxn):
        sorted_dates[k] = v
    with open("grouped.json", "w") as group:
        json.dump(obj=sorted_dates, fp=group)
    with open("yearmap.json", "w") as ymap:
        json.dump(obj=position_years, fp=ymap)
    k = dates.keys()
    # with open("buggy.json", "w") as b:
    #     json.dump(obj=sorted_dates["2018-01-08 08:00:00"], fp=b)
    print(f"Total Unique Dates: {str(len(k))}")
    print(f"Max unique sounds needed: {str(max_num_sounds)}")
    print(f"Happends here: {max_ts}")
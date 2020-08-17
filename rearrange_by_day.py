import json
import dateparser
from collections import OrderedDict
from datetime import datetime
from statistics import mean
def sort_fxn(dt):
    time_str = dt[0]
    p = dateparser.parse(str(time_str))
    # print(str(p))
    if p is None:
        print(str(time_str))
    return float(datetime.timestamp(p))
max_num_sounds = 0
max_ts = None
with open("annotations.json", "r") as sound_file:
    sound_dict = json.load(sound_file)
    # date_set = set()
    dates = dict()
    for sound in sound_dict.copy().values():
        ts = sound.get("human_ts")
        if ts == "2018-01-08 08:00:00":
            print()
            print(sound)
            print()
        db_ = sound.get("decibels")
        if (ts is None) or (db_ is None):
            # print(sound)
            continue
        sound["avg_db"] = mean(db_)
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
    with open("unsorted1.json", "w") as uns:
        json.dump(obj=dates, fp=uns)
    sorted_dates = OrderedDict()
    for k,v in sorted(dates.items(), key=sort_fxn):
        if k == "2018-01-08 08:00:00":
            if v[0].get("decibels") is None:
                print(v[0])
        sorted_dates[k] = v
    with open("grouped1.json", "w") as group:
        json.dump(obj=sorted_dates, fp=group)
    k = dates.keys()
    with open("buggy.json", "w") as b:
        json.dump(obj=sorted_dates["2018-01-08 08:00:00"], fp=b)
    print(f"Total Unique Dates: {str(len(k))}")
    print(f"Max unique sounds needed: {str(max_num_sounds)}")
    print(f"Happends here: {max_ts}")
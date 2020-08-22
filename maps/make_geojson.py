import json, csv

DIS_MAP = {}
with open("age_groups.csv", "r") as f:
    reader = csv.DictReader(f)
    for row in reader:
        state = row['locationdesc']
        if DIS_MAP.get(state) is None:
            DIS_MAP[state] = {
                "young":None,
                "mid": None,
                "old": None,
                "no_cat": None
                }
        response = row['response']
        val = row['data_value']
        if not val:
            continue
        if response == "18-44":
            key = "young"
        elif response == "45-64":
            key = "mid"
        elif response == "65+":
            key = "old"
        else:
            key = "no_cat"
        DIS_MAP[state][key] = float(val)

NEWGEO = {
    "type":"FeatureCollection",
    "features": []
    }
with open("js/state_outlines.json", "r") as j:
    GEOJSON = json.load(j)
    for feature in GEOJSON["features"].copy():
        state = feature["properties"]["NAME"]
        feature["properties"]["HEARINGDATA"] = DIS_MAP.get(state)
        NEWGEO["features"].append(feature)

with open("js/hearing_geojson.js", "w") as n:
    geodata = json.dumps(NEWGEO)
    n.write("const hearingData = "+geodata+";")

with open("js/hearing_geojson.json", "w") as n:
    geodata = json.dumps(NEWGEO)
    n.write(geodata)

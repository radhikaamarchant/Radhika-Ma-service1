import json
with open('src/utils/indianCities.json', 'r') as f:
    data = json.load(f)

with open('src/utils/indianCities.ts', 'w') as f:
    f.write('export const INDIAN_CITIES = [\n')
    for item in data:
        f.write(f'  {{ city: "{item["name"]}", state: "{item["state"]}" }},\n')
    f.write('];\n')

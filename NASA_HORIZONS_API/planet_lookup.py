import requests
import json
from datetime import datetime
import pandas as pd

def get_horizons_data(target, target_name):
    """Fetch single object from Horizons API"""
    url = 'https://ssd.jpl.nasa.gov/api/horizons.api'

    params = {
        'format': 'text',
        'COMMAND': f"'{target}'",
        'OBJ_DATA': 'NO',
        'MAKE_EPHEM': 'YES',
        'EPHEM_TYPE': 'VECTORS',
        'CENTER': '500@10',  # Sun, heliocentric
        'START_TIME': '2025-07-01',
        'STOP_TIME': '2026-04-01',
        'STEP_SIZE': '1d',
        'VEC_TABLE': '2',  # Position vectors
        'REF_PLANE': 'ECLIPTIC',
        'REF_SYSTEM': 'J2000',
        'OUT_UNITS': 'AU-D',
        'CSV_FORMAT': 'YES'
    }

    print(f"Fetching {target_name}...")
    response = requests.get(url, params=params, timeout=30)

    if response.status_code == 200:
        print(f"✓ {target_name} retrieved successfully")
        return response.text
    else:
        print(f"✗ Error fetching {target_name}: {response.status_code}")
        return None

# Define all objects (planets + comet)
objects = {
    'C/2025 N1': '3I/ATLAS',
    '199': 'Mercury',
    '299': 'Venus',
    '399': 'Earth',
    '499': 'Mars',
    '599': 'Jupiter',
    '699': 'Saturn',
    '799': 'Uranus',
    '899': 'Neptune'
}

# Fetch all data
all_data = {}
for target_code, target_name in objects.items():
    data = get_horizons_data(target_code, target_name)
    if data:
        all_data[target_name] = data

# Save consolidated file
with open('ALL_SOLAR_SYSTEM_POSITIONS.txt', 'w') as f:
    for obj_name, horizons_data in all_data.items():
        f.write(f"\n{'='*80}\n")
        f.write(f"OBJECT: {obj_name}\n")
        f.write(f"{'='*80}\n")
        f.write(horizons_data)

print("\n✓ All data consolidated into ALL_SOLAR_SYSTEM_POSITIONS.txt")

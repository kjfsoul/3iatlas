import re
import json
import pandas as pd

def parse_horizons_to_csv_json(input_file, output_csv='SOLAR_SYSTEM_POSITIONS.csv',
                                output_json='SOLAR_SYSTEM_POSITIONS.json'):
    """
    Parse NASA Horizons API raw text file and convert to CSV and JSON formats.

    Args:
        input_file: Path to the raw Horizons .txt file
        output_csv: Output CSV filename
        output_json: Output JSON filename
    """

    # Read the raw file
    with open(input_file, 'r') as f:
        content = f.read()

    all_data = []

    # Split by object sections (each starts with "Target body name:")
    object_sections = re.split(r'Target body name:', content)[1:]

    for section in object_sections:
        # Extract clean object name
        object_match = re.search(r'([^\n{]+)', section)
        if not object_match:
            continue

        object_name = object_match.group(1).strip()

        # Find the $$SOE...$$EOE data block
        soe_match = re.search(r'\$\$SOE\s*\n(.*?)\$\$EOE', section, re.DOTALL)
        if not soe_match:
            continue

        data_block = soe_match.group(1).strip()
        lines = data_block.split('\n')

        print(f"✓ Processing {object_name}...")

        # Parse each data line
        for line in lines:
            line = line.strip()
            if not line or line.startswith('$$'):
                continue

            # Split by comma (CSV format from Horizons)
            parts = line.split(',')

            if len(parts) >= 8:  # Need at least JDTDB, Date, X, Y, Z, VX, VY, VZ
                try:
                    jd = float(parts[0].strip())
                    date_str = parts[1].strip()
                    x = float(parts[2].strip())
                    y = float(parts[3].strip())
                    z = float(parts[4].strip())
                    vx = float(parts[5].strip())
                    vy = float(parts[6].strip())
                    vz = float(parts[7].strip())

                    all_data.append({
                        'Date': date_str,
                        'Object': object_name,
                        'X_AU': x,
                        'Y_AU': y,
                        'Z_AU': z,
                        'VX_AU_day': vx,
                        'VY_AU_day': vy,
                        'VZ_AU_day': vz
                    })
                except ValueError:
                    continue

    # Create DataFrame
    df = pd.DataFrame(all_data)

    # Save CSV
    df.to_csv(output_csv, index=False)
    print(f"\n✓ CSV saved: {output_csv}")

    # Create and save JSON
    json_data = []
    for _, row in df.iterrows():
        json_data.append({
            'date': row['Date'],
            'object': row['Object'],
            'position_au': {
                'x': float(f"{row['X_AU']:.12f}"),
                'y': float(f"{row['Y_AU']:.12f}"),
                'z': float(f"{row['Z_AU']:.12f}")
            },
            'velocity_au_per_day': {
                'vx': float(f"{row['VX_AU_day']:.12f}"),
                'vy': float(f"{row['VY_AU_day']:.12f}"),
                'vz': float(f"{row['VZ_AU_day']:.12f}")
            }
        })

    with open(output_json, 'w') as f:
        json.dump(json_data, f, indent=2)

    print(f"✓ JSON saved: {output_json}")
    print(f"\n✓ Total records: {len(json_data)}")
    print(f"✓ Objects: {', '.join(df['Object'].unique())}")
    print(f"✓ Date range: {df['Date'].min()} → {df['Date'].max()}")

    return df, json_data

# Usage:
df, json_data = parse_horizons_to_csv_json('ALL_SOLAR_SYSTEM_POSITIONS.txt')

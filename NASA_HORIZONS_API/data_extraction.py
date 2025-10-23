
import re
import json

# Read the NASA Horizons data file
with open('NASA_HORIZONS_API_RAW_DATA.txt', 'r') as f:
    content = f.read()

# Extract data between $$SOE and $$EOE markers
soe_match = re.search(r'\$\$SOE(.*?)\$\$EOE', content, re.DOTALL)

if soe_match:
    data_section = soe_match.group(1).strip()
    
    # Parse the data lines
    lines = [line.strip() for line in data_section.split('\n') if line.strip()]
    
    parsed_data = []
    
    for line in lines:
        # Split by comma
        parts = [p.strip() for p in line.split(',')]
        
        if len(parts) >= 7:
            jd = float(parts[0])
            date = parts[1]
            x = float(parts[2])
            y = float(parts[3])
            z = float(parts[4])
            vx = float(parts[5])
            vy = float(parts[6])
            vz = float(parts[7])
            
            parsed_data.append({
                "jd": jd,
                "date": date,
                "position": {"x": x, "y": y, "z": z},
                "velocity": {"vx": vx, "vy": vy, "vz": vz}
            })
    
    print(f"Total data points parsed: {len(parsed_data)}")
    print(f"\nFirst entry:")
    print(json.dumps(parsed_data[0], indent=2))
    print(f"\nLast entry:")
    print(json.dumps(parsed_data[-1], indent=2))
    
    # Find November 30, 2025 entry
    nov30_entries = [d for d in parsed_data if "2025-Nov-30" in d["date"]]
    if nov30_entries:
        print(f"\n=== NOVEMBER 30, 2025 DATA ===")
        for entry in nov30_entries:
            print(json.dumps(entry, indent=2))
    
    # Save full dataset as JSON
    with open('3I_ATLAS_positions_parsed.json', 'w') as f:
        json.dump(parsed_data, f, indent=2)
    
    print(f"\n✓ Saved full dataset to 3I_ATLAS_positions_parsed.json")
    
    # Create CSV format
    csv_lines = ["Date,Object,X_AU,Y_AU,Z_AU,VX_AU_per_day,VY_AU_per_day,VZ_AU_per_day"]
    for d in parsed_data:
        csv_lines.append(f"{d['date']},3I/ATLAS,{d['position']['x']:.9f},{d['position']['y']:.9f},{d['position']['z']:.9f},{d['velocity']['vx']:.12f},{d['velocity']['vy']:.12f},{d['velocity']['vz']:.12f}")
    
    with open('3I_ATLAS_positions.csv', 'w') as f:
        f.write('\n'.join(csv_lines))
    
    print(f"✓ Saved CSV format to 3I_ATLAS_positions.csv")
    
else:
    print("Could not find $$SOE...$$EOE markers in the file")

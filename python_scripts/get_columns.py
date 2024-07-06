import sys
import pandas as pd
import json

def main():
    if len(sys.argv) < 2:
        print("Usage: get_columns.py <csv_file_path>")
        return
    
    csv_file_path = sys.argv[1]
    
    df = pd.read_csv(csv_file_path)
    columns = df.columns.tolist()
    
    print(json.dumps(columns))

if __name__ == "__main__":
    main()

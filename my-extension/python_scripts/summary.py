import sys
import json
import pandas as pd

from io import StringIO

def main():
    file_path = sys.argv[1]
    df = pd.read_csv(file_path)
    summary = df.describe().to_json()
    print(summary)
    print("summary")
if __name__ == "__main__":
    main()

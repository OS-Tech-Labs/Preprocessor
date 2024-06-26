import sys
import json
import pandas as pd


def main():
    file_path = str(sys.argv[1])
    # file_path = "C:\\Users\\user\\Downloads\\wines.csv"
    # print(file_path)
    df = pd.read_csv(file_path)
    summary = df.describe().to_json()
    print(summary)  # Only print the summary
    # print("hello from python script")


if __name__ == "__main__":
    main()

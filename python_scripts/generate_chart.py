import sys
import pandas as pd
import matplotlib.pyplot as plt
import os

def main():
    if len(sys.argv) < 3:
        print("Usage: generate_chart.py <csv_file_path> <column_name>")
        sys.exit(1)
    
    csv_file_path = sys.argv[1]
    column_name = sys.argv[2]

    # Load the CSV file
    df = pd.read_csv(csv_file_path)

    # Generate the chart based on the column type
    if pd.api.types.is_numeric_dtype(df[column_name]):
        plt.figure()
        df[column_name].dropna().hist(bins=30)
        plt.title(f'Histogram of {column_name}')
        plt.xlabel(column_name)
        plt.ylabel('Frequency')
    else:
        plt.figure()
        df[column_name].dropna().value_counts().plot(kind='bar')
        plt.title(f'Bar Chart of {column_name}')
        plt.xlabel(column_name)
        plt.ylabel('Count')

    # Save the chart as an image in a temporary directory
    temp_dir = os.path.join(os.path.dirname(__file__), 'temp')
    os.makedirs(temp_dir, exist_ok=True)
    image_path = os.path.join(temp_dir, f'{column_name}_chart.png')
    plt.savefig(image_path)

    # Output the image path for the VS Code extension
    print(image_path)

if __name__ == "__main__":
    main()

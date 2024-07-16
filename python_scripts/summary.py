import pandas as pd
import json

def compute_numeric_summary(column):
    # Remove missing values
    column = column.dropna()
    summary = {
        'min': float(column.min()),
        '25%': float(column.quantile(0.25)),
        '50%': float(column.median()),
        '75%': float(column.quantile(0.75)),
        'max': float(column.max()),
        'mean': float(column.mean()),
        'std': float(column.std())
    }
    return summary

def compute_categorical_summary(column):
    # Remove missing values
    column = column.dropna()
    summary = {
        'unique': float(column.nunique()),
        'mode': column.mode().iloc[0] if not column.mode().empty else None,
        'freq': float(column.value_counts().iloc[0]) if not column.value_counts().empty else 0
    }
    return summary

def main():
    # Load the data (assuming the file path is passed as a command-line argument)
    import sys
    file_path = sys.argv[1]
    column_name = sys.argv[2]
    data = pd.read_csv(file_path)

    summary_stats = {}
    
    column = data[column_name]
    if pd.api.types.is_numeric_dtype(column):
        summary_stats = compute_numeric_summary(column)
    elif pd.api.types.is_object_dtype(column) or pd.api.types.is_categorical_dtype(column):
        summary_stats = compute_categorical_summary(column)
    else:
        summary_stats = {'error': 'Unsupported column type'}

    # Convert to JSON serializable format
    json_summary = json.dumps(summary_stats)
    print(json_summary)

if __name__ == '__main__':
    main()

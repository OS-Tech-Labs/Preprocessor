import sys
import pandas as pd
import matplotlib.pyplot as plt

def generate_chart(file_path, chart_type, x_column, y_column):
    # Load the CSV data
    df = pd.read_csv(file_path)

    # Create a plot based on the selected chart type
    if chart_type == 'bar':
        df.plot(kind='bar', x=x_column, y=y_column)
    elif chart_type == 'line':
        df.plot(kind='line', x=x_column, y=y_column)
    elif chart_type == 'scatter':
        df.plot(kind='scatter', x=x_column, y=y_column)

    # Save the plot as a PNG image
    image_path = file_path.replace('.csv', '.png')
    plt.savefig(image_path)
    plt.close()
    
    return image_path

if __name__ == "__main__":
    file_path = sys.argv[1]
    chart_type = sys.argv[2]
    x_column = sys.argv[3]
    y_column = sys.argv[4]
    image_path = generate_chart(file_path, chart_type, x_column, y_column)
    print(image_path)

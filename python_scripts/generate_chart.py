import sys
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

def generate_chart(file_path, chart_type, x_column, y_column):
    # Load the CSV data
    df = pd.read_csv(file_path)

    # Create a plot based on the selected chart type
    # if chart_type == 'bar':
    #     df.plot(kind='bar', x=x_column, y=y_column)
    if chart_type == 'line':
        df.plot(kind='line', x=x_column, y=y_column)
    elif chart_type == 'scatter':
        df.plot(kind='scatter', x=x_column, y=y_column)
    elif chart_type == 'heatmap':
        pivot_table = df.pivot_table(index=x_column, columns=y_column, aggfunc='size', fill_value=0)
        sns.heatmap(pivot_table)
    elif chart_type == 'box':
        fig, axes = plt.subplots(1, 2, figsize=(12, 6))

        # Generate the first box plot in the first subplot
        sns.boxplot(data=df, y=x_column, ax=axes[0])
        axes[0].set_title(f'Box Plot of {x_column}')

        # Generate the second box plot in the second subplot
        sns.boxplot(data=df, y=y_column, ax=axes[1])
        axes[1].set_title(f'Box Plot of {y_column}')

        # Adjust layout for better spacing
        plt.tight_layout()

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

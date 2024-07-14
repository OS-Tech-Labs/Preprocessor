//import { acquireVsCodeApi } from 'vscode';
console.log("Script loaded");

    const vscode = acquireVsCodeApi();
    let csvData = '';
    let columns = [];
    document.getElementById('fileInputButton').addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });
    
    document.getElementById('fileInput').addEventListener('change', loadData);
    function loadData() {
        console.log("loadData");
        const fileInput = document.getElementById('fileInput');
        console.log(fileInput);
        const file = fileInput.files[0];
        if (file) {
            document.getElementById('fileName').innerText = file.name;
            vscode.postMessage({ command: 'loadData', filePath: file.path });
            console.log("file loaded");
        } else {
            alert('Please select a CSV file first.');
        }

        
    }
    

    function showSummary(columnName) {
        vscode.postMessage({ command: 'showSummary', column: columnName });
        console.log("showSummary for column:", columnName);
    }
    
    window.addEventListener('message', event => {
        const message = event.data;
        switch (message.command) {
        case 'dataLoaded':
            columns = message.columns;
            populateColumnButtons(columns);
            document.getElementById('dataSummary').innerText = 'Data Loaded. Select a column to view summary statistics.';
            break;
        case 'summaryStats':
            console.log("summaryStats");
            const summaryData = JSON.parse(message.data);
            const columnName  = message.columnName
            console.log("data received");
            let summaryHtml = `<h2>Summary Statistics for ${columnName} </h2>`;
            summaryHtml += '<table><thead><tr>';
            summaryHtml += '<th>Attribute</th><th>Value</th>';
            summaryHtml += '</tr></thead><tbody>';
            for (const key in summaryData) {
                summaryHtml += '<tr>';
                summaryHtml += '<td>' + key + '</td>';
                summaryHtml += '<td>' + summaryData[key] + '</td>';
                summaryHtml += '</tr>';
            }
            summaryHtml += '</tbody></table>';
            document.getElementById('dataSummary').innerHTML = summaryHtml;
            generateChartForColumn(columnName);

            break;
        case 'chartData':
            
            const base64Image = message.data;
            console.log("chartData received");
            let chartHtml = `<img src="data:image/png;base64,${base64Image}" alt="chart" />`;
            document.getElementById('chartContainer').innerHTML = chartHtml;
            break;
        case 'clearChart':
            document.getElementById('chartContainer').innerHTML = '';

            }
        });
function populateColumnButtons(columns) {
    const columnButtons = document.getElementById('columnButtons');
    columnButtons.innerHTML = '';
    columns.forEach(column => {
        const button = document.createElement('button');
        button.innerText = column;
        button.onclick = () => showSummary(column);
        columnButtons.appendChild(button);
    });
}


function generateChartForColumn(columnName) {
    vscode.postMessage({
        command: 'generateChart',
        xColumn: columnName
    });
    console.log("generateChart for column:", columnName);
}
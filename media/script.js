//import { acquireVsCodeApi } from 'vscode';
console.log("Script loaded");

            const vscode = acquireVsCodeApi();
            let csvData = '';
            let columns = [];
            function loadData() {
                console.log("loadData");
                const fileInput = document.getElementById('fileInput');
                console.log(fileInput);
                const file = fileInput.files[0];
                if (file) {
                    vscode.postMessage({ command: 'loadData', filePath: file.path });
                    console.log("file loaded");
                } else {
                    alert('Please select a CSV file first.');
                }

                
            }
            

            function showSummary() {
                vscode.postMessage({ command: 'showSummary', text: csvData});
                console.log("showSummary");
            }
            
            function generateChart() {
                const chartType = document.getElementById('chartType').value;
                const xColumn = document.getElementById('xColumn').value;
                const yColumn = document.getElementById('yColumn').value;
                vscode.postMessage({
                    command: 'generateChart',
                    chartType: chartType,
                    xColumn: xColumn,
                    yColumn: yColumn
                });
                console.log("generateChart");
            }
            
            window.addEventListener('message', event => {
                const message = event.data;
                switch (message.command) {
                    case 'dataLoaded':
                        
                        document.getElementById('dataSummary').innerText = 'Data Loaded. Click "Show Summary Statistics" to view.';
                        
                        break;
                    case 'summaryStats':
                        const summaryData = JSON.parse(message.data);
                        console.log("data received")
                        let summaryHtml = '<h2>Summary Statistics</h2>';
                        summaryHtml += '<table><thead><tr>';
                        summaryHtml += '<th>Attribute</th><th>Count</th><th>Mean</th><th>Std</th><th>Min</th><th>25%</th><th>50%</th><th>75%</th><th>Max</th>';
                        summaryHtml += '</tr></thead><tbody>';
                        for (const key in summaryData) {
                            columns.push(key);
                            summaryHtml += '<tr>';
                            summaryHtml += '<td>' + key + '</td>';
                            summaryHtml += '<td>' + summaryData[key].count + '</td>';
                            summaryHtml += '<td>' + summaryData[key].mean + '</td>';
                            summaryHtml += '<td>' + summaryData[key].std + '</td>';
                            summaryHtml += '<td>' + summaryData[key].min + '</td>';
                            summaryHtml += '<td>' + summaryData[key]['25%'] + '</td>';
                            summaryHtml += '<td>' + summaryData[key]['50%'] + '</td>';
                            summaryHtml += '<td>' + summaryData[key]['75%'] + '</td>';
                            summaryHtml += '<td>' + summaryData[key].max + '</td>';
                            summaryHtml += '</tr>';
                        }
                        summaryHtml += '</tbody></table>';

                        const xColumnSelect = document.getElementById('xColumn');
                                const yColumnSelect = document.getElementById('yColumn');
                                xColumnSelect.innerHTML = "";
                                yColumnSelect.innerHTML = "";
                                columns.forEach(column => {
                                    const option = document.createElement('option');
                                    option.value = column;
                                    option.innerText = column;
                                    xColumnSelect.appendChild(option.cloneNode(true));
                                    yColumnSelect.appendChild(option);
                                }
                                );
                        document.getElementById('controls').style.display = 'block';
                        document.getElementById('dataSummary').innerHTML = summaryHtml;
                        break;
                    
                    case 'chartData':
                        const imagePath = message.data;
                        console.log("imagePath", imagePath);
                        let chartHtml = '<img src=imagePath  alt="chart" />';
                        document.getElementById('chartContainer').innerHTML = chartHtml;

                        break;
                }
            });

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode")
const path = require("path")
const fs = require("fs")
const { PythonShell } = require("python-shell")
const which = require("which")
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "my-extension" is now active!')

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let helloworldDisposable = vscode.commands.registerCommand(
    "My-Extension",
    function () {
      // The code you place here will be executed every time your command is executed

      // Display a message box to the user
      vscode.window.showInformationMessage("Hello World from My Extension!")
    }
  )

  let webviewDisposable = vscode.commands.registerCommand(
    "My-Extension.openwebview",
    function () {
      // Create and show a new webview
      const panel = vscode.window.createWebviewPanel(
        "exampleWebview", // Identifies the type of the webview. Used internally
        "Example Webview", // Title of the panel displayed to the user
        vscode.ViewColumn.One,
        {
          enableScripts: true,
        }
      )

      panel.webview.html = getWebviewContent2()

      // Handle messages from the webview
      panel.webview.onDidReceiveMessage(
        (message) => {
          switch (message.command) {
            case "alert":
              vscode.window.showErrorMessage(message.text)
              return
          }
        },
        undefined,
        context.subscriptions
      )
    }
  )
  let startDisposable = vscode.commands.registerCommand(
    "dataCleaningAssistant.start",
    function () {
      const panel = vscode.window.createWebviewPanel(
        "dataCleaningAssistant",
        "Data Cleaning Assistant",
        vscode.ViewColumn.One,
        { enableScripts: true }
      )

      panel.webview.html = getWebviewContent()

      let loadedFilePath

      panel.webview.onDidReceiveMessage(
        (message) => {
          console.log("Message received:", message) // Log the received message for debugging purposes
          switch (message.command) {
            case "loadData":
              loadedFilePath = message.filePath
              panel.webview.postMessage({ command: "dataLoaded" })
              break
            case "showSummary":
              runPythonScript("summary.py", loadedFilePath, (result) => {
                panel.webview.postMessage({
                  command: "summaryStats",
                  data: result,
                })
              })
            break
            
            case "generateChart":
              const options = [message.chartType, message.xColumn, message.yColumn];
              runPythonScript("generate_chart.py", loadedFilePath, (result) => {
                panel.webview.postMessage({
                  command: "chartData",
                  data: result,
                });
              }, options);
              break
          }
        },
        undefined,
        context.subscriptions
      )
    }
  )

  context.subscriptions.push(helloworldDisposable)
  context.subscriptions.push(webviewDisposable)
  context.subscriptions.push(startDisposable)
}

// This method is called when your extension is deactivated
function deactivate() {}

function getWebviewContent2() {
  return `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Example Webview</title>
	</head>
	<body>
            <h1>Hello from the Webview!</h1>
            <button id="myButton">Click me</button>
            <script>
                const vscode = acquireVsCodeApi();
                document.getElementById('myButton').addEventListener('click', () => {
                    vscode.postMessage({
                        command: 'alert',
                        text: 'Button clicked!'
                    });
                });
            </script>
        </body>
	</html>`
}
function getWebviewContent() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Data Cleaning Assistant</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 20px;
            }
            h1 {
                color: #333;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 10px;
                text-align: left;
                margin: 5px;
            }
            th {
                background-color: #f2f2f2;
                font-weight: bold;
            }
            
            tr:hover {
                background-color: #f1f1f1;
            }
            #fileInput, button {
                margin: 10px 0;
            }
            button {
                padding: 10px 15px;
                font-size: 16px;
                cursor: pointer;
                background-color: #007acc;
                color: white;
                border: none;
                border-radius: 4px;
                transition: background-color 0.3s ease;
            }
            button:hover {
                background-color: #005fa3;
            }
            #dataSummary {
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <h1>Data Cleaning Assistant</h1>
        <input type="file" id="fileInput" accept=".csv" />
        <button onclick="loadData()">Load Data</button>
        <button onclick="showSummary()">Show Summary Statistics</button>
        <div id="controls" style="display: none;">
            <h2>Generate Chart</h2>
            <label for="chartType">Select Chart Type:</label>
            <select id="chartType">
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="scatter">Scatter Plot</option>
            </select>
            <br>
            <label for="xColumn">Select X-axis Column:</label>
            <select id="xColumn"></select>
            <br>
            <label for="yColumn">Select Y-axis Column:</label>
            <select id="yColumn"></select>
            <br>
            <button onclick="generateChart()">Generate Chart</button>
        </div>
        <div id="dataSummary"></div>
        <div id="chartContainer">
            <img id="chartImage" width="400" height="400" />
        </div>
        <script>
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
                        document.getElementById('chartImage').src = vscode.Uri.file(imagePath).toString();
                        break;
                }
            });
        </script>

    </body>
    </html>
    `
}
function runPythonScript(scriptName, filePath, callback, options = []){
  const { spawn } = require("child_process")

  let scriptPath = path.join(__dirname, "python_scripts", scriptName)

  const pythonProcess = spawn("python", [scriptPath, filePath,...options])

  pythonProcess.stdout.on("data", (data) => {
    console.log(`Python script stdout: ${data}`)
    callback(data.toString().trim())
    //callback("{'mean': 5, 'std': 2}")
  })

  pythonProcess.stderr.on("data", (data) => {
    console.error(`Python script stderr: ${data}`)
  })

  pythonProcess.on("close", (code) => {
    console.log(`Python script exited with code ${code}`)
  })
}
module.exports = {
  activate,
  deactivate,
}

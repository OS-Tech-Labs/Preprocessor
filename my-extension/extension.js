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
    </head>
    <body>
        <h1>Data Cleaning Assistant</h1>
        <input type="file" id="fileInput" accept=".csv" />
        <button onclick="loadData()">Load Data</button>
        <button onclick="showSummary()">Show Summary Statistics</button>
        <div id="dataSummary"></div>
        <script>
            console.log("Script loaded");

            const vscode = acquireVsCodeApi();
            let csvData = '';

            function loadData() {
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
                        for (const key in summaryData) {
                            summaryHtml += '<h3>' + key + '</h3>';
                            summaryHtml += '<pre>' + JSON.stringify(summaryData[key], null, 2) + '</pre>';

                        }
                        document.getElementById('dataSummary').innerHTML = summaryHtml;
                        break;
                }
            });
        </script>
    </body>
    </html>
    `
}
function runPythonScript(scriptName, filePath, callback) {
  const { spawn } = require("child_process")

  let scriptPath = path.join(__dirname, "python_scripts", scriptName)

  const pythonProcess = spawn("python", [scriptPath, filePath])

  pythonProcess.stdout.on("data", (data) => {
    console.log(`Python script stdout: ${data}`)
    callback(data.toString())
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

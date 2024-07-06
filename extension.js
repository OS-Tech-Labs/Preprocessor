// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode")
const path = require("path")
const fs = require("fs")
// const { PythonShell } = require("python-shell")

const db = require('./db');
const os = require('os');

const tempDir = path.join(os.tmpdir(), 'vscode-extension-temp');
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
  


  let startDisposable = vscode.commands.registerCommand(
    "dataCleaningAssistant.start",
    function () {
      const panel = vscode.window.createWebviewPanel(
        "dataCleaningAssistant",
        "Data Cleaning Assistant",
        vscode.ViewColumn.One,
        { enableScripts: true }
      )
      const htmlPath = path.join(context.extensionPath, 'webview.html');
      let htmlContent = fs.readFileSync(htmlPath, 'utf8');
      const scriptUri = panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'media', 'script.js')));
      const styleUri = panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'media', 'styles.css')));
      htmlContent = htmlContent.replace('script.js', scriptUri.toString());
      htmlContent = htmlContent.replace('styles.css', styleUri.toString());

      panel.webview.html = htmlContent

      let loadedFilePath

      panel.webview.onDidReceiveMessage(
        (message) => {
          console.log("Message received:", message) // Log the received message for debugging purposes
          switch (message.command) {
            case 'loadData':
                    loadedFilePath = message.filePath;
                    runPythonScript('get_columns.py', [loadedFilePath], (result) => {
                      const columns = JSON.parse(result);
                      panel.webview.postMessage({ command: 'dataLoaded', columns: columns });
                  });
                    break;
                case 'showSummary':
                    const column = message.column;
                    runPythonScript('summary.py', loadedFilePath, (result) => {
                        panel.webview.postMessage({
                            command: 'summaryStats',
                            data: result,
                        });
                    }, [column]);
                    break;
                // case 'showColumnStats':
                //     const column = message.column;
                //     runPythonScript('column_summary.py', column, (result) => {
                //         panel.webview.postMessage({
                //             command: 'columnStats',
                //             data: result,
                //         });
                //     });
                //     break;
                case 'generateChart':
                    const xColumn = message.xColumn;
                    runPythonScript('generate_chart.py', loadedFilePath, (imagePath) => {
                        db.run('INSERT INTO images (path) VALUES (?)', [imagePath], function(err) {
                            if (err) {
                                return console.error(err.message);
                            }
                            panel.webview.postMessage({
                                command: 'chartData',
                                data: imagePath
                            });
                        });
                    }, [xColumn]);
                    break;
          }
        },
        undefined,
        context.subscriptions
      )
    }
  )

  
context.subscriptions.push(startDisposable)
let deactivateCommand = vscode.commands.registerCommand('dataCleaningAssistant.deactivate', function () {
    deactivate();
});
context.subscriptions.push(deactivateCommand);
  
}

// This method is called when your extension is deactivated
function deactivate() {
  console.log('Deactivated')
  db.deleteImages((err) => {
    if (err) {
        console.error('Error deleting images:', err);
    }
    else {
        console.log('Deleted images');
    }
  });
  
 
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
  deactivate
}

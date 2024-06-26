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
  
  context.subscriptions.push(startDisposable)
}

// This method is called when your extension is deactivated
function deactivate() {}



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

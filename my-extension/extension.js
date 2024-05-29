// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "my-extension" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let helloworldDisposable = vscode.commands.registerCommand('My-Extension', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from My Extension!');
	});

	let webviewDisposable = vscode.commands.registerCommand('My-Extension.openwebview', function () {
		// Create and show a new webview
		const panel = vscode.window.createWebviewPanel(
			'exampleWebview', // Identifies the type of the webview. Used internally
			'Example Webview', // Title of the panel displayed to the user
			vscode.ViewColumn.One,
			{
				enableScripts: true
			}
		);

		panel.webview.html = getWebviewContent2();

		// Handle messages from the webview
		panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'alert':
						vscode.window.showErrorMessage(message.text);
						return;
				}
			},
			undefined,
			context.subscriptions
		);
	});
    let startDisposable = vscode.commands.registerCommand('dataCleaningAssistant.start', function () {
        const panel = vscode.window.createWebviewPanel(
            'dataCleaningAssistant',
            'Data Cleaning Assistant',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        panel.webview.html = getWebviewContent();

        panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'loadData':
                        const filePath = message.text;
                        const data = fs.readFileSync(filePath, 'utf8');
                        panel.webview.postMessage({ command: 'dataLoaded', data: data });
                        break;
                    case 'showSummary':
                        runPythonScript('summary.py', message.data, (result) => {
                            panel.webview.postMessage({ command: 'summaryStats', data: result });
                        });
                        break;
                    case 'transformData':
                        runPythonScript('transform.py', message.data, (result) => {
                            panel.webview.postMessage({ command: 'dataTransformed', data: result });
                        });
                        break;
                    case 'exploreData':
                        runPythonScript('explore.py', message.data, (result) => {
                            panel.webview.postMessage({ command: 'dataExplored', data: result });
                        });
                        break;
                    case 'splitData':
                        runPythonScript('split.py', message.data, (result) => {
                            panel.webview.postMessage({ command: 'dataSplit', data: result });
                        });
                        break;
                }
            },
            undefined,
            context.subscriptions
        );
    });


	context.subscriptions.push(helloworldDisposable);
	context.subscriptions.push(webviewDisposable);
    context.subscriptions.push(startDisposable);
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
	</html>`;
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
            const vscode = acquireVsCodeApi();

            function loadData() {
                const fileInput = document.getElementById('fileInput');
                const file = fileInput.files[0];
                const reader = new FileReader();

                reader.onload = function(event) {
                    const csvData = event.target.result;
                    vscode.postMessage({ command: 'loadData', text: csvData });
                };

                if (file) {
                    reader.readAsText(file);
                } else {
                    alert('Please select a CSV file first.');
                }
            }

            function showSummary() {
                vscode.postMessage({ command: 'showSummary' });
            }

            window.addEventListener('message', event => {
                const message = event.data;
                switch (message.command) {
                    case 'dataLoaded':
                        document.getElementById('dataSummary').innerText = 'Data Loaded. Click "Show Summary Statistics" to view.';
                        break;
                    case 'summaryStats':
                        const summaryData = JSON.parse(message.data);
                        let summaryHtml = '<h2>Summary Statistics</h2>';
                        for (const key in summaryData) {
                            summaryHtml += '<p>' + key + ': ' + summaryData[key] + '</p>';

}
                        document.getElementById('dataSummary').innerHTML = summaryHtml;
                        break;
                }
            });
        </script>
    </body>
    </html>
    `;
}
function runPythonScript(scriptName, data, callback) {
    // let options = {
    //     mode: 'text',
    //     pythonOptions: ['-u'],
    //     scriptPath: path.join(__dirname, 'python_scripts'),
    //     args: [data]
    // };

    // PythonShell.run(scriptName, options, function (err, results) {
    //     if (err) throw err;
    //     callback(results[0]);
    // });
}
module.exports = {
	activate,
	deactivate
}

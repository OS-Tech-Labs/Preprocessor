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

		panel.webview.html = getWebviewContent();

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

	context.subscriptions.push(helloworldDisposable);
	context.subscriptions.push(webviewDisposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

function getWebviewContent() {
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
module.exports = {
	activate,
	deactivate
}

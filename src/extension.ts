import * as vscode from 'vscode';

function parseNested(str: any) {
	try {
		return JSON.parse(str, (_, val) => {
			if (typeof val === 'string') {
				return parseNested(val);
			}
			else {
				return val;
			}
		});
	} catch (exc) {
		return str;
	}
}

function read() {
	const editor = vscode.window.activeTextEditor;
	return editor!.document.getText();
}

function write(text: any, space: number = 4) {
	const editor = vscode.window.activeTextEditor;
	editor?.edit(builder => {
		const doc = editor.document;
		builder.replace(
			new vscode.Range(doc.lineAt(0).range.start, doc.lineAt(doc.lineCount - 1).range.end),
			(typeof text === 'string' ? text : JSON.stringify(text, null, space))
		);
		vscode.languages.setTextDocumentLanguage(doc, "json");
	});
}

export function activate(context: vscode.ExtensionContext) {

	const config = vscode.workspace.getConfiguration("v750");
	const enableWatcher = config.get("enableWatcher") as boolean;

	if (enableWatcher) {
		let w = vscode.workspace.createFileSystemWatcher("**/*", false, true, true);
		w.onDidCreate((e) => {
			vscode.workspace.openTextDocument(e.path).then(document => vscode.window.showTextDocument(document));
		});
	}

	const unstringify = vscode.commands.registerCommand('v750.unstringify', () => {
		write(parseNested(read()));
	});
	const sort = vscode.commands.registerCommand('v750.sort', () => {
		write(JSON.parse(read()).sort());
	});
	const minify = vscode.commands.registerCommand('v750.minify', () => {
		write(JSON.parse(read()), 0);
	});
	const format = vscode.commands.registerCommand('v750.format', () => {
		write(JSON.parse(read()));
	});


	context.subscriptions.push(unstringify);
	context.subscriptions.push(sort);
	context.subscriptions.push(minify);
	context.subscriptions.push(format);
}

export function deactivate() { }

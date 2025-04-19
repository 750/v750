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

interface Comanda extends vscode.QuickPickItem {
	command: string
}

function substitute(t: string) {
	if (!!vscode.window.activeTextEditor) {
		t = t.replaceAll("${file}", vscode.window.activeTextEditor.document.fileName);
		t = t.replaceAll("${selectionStart}", vscode.window.activeTextEditor.selection.start.line+':'+vscode.window.activeTextEditor.selection.start.character);
		t = t.replaceAll("${selectionEnd}", ''+vscode.window.activeTextEditor.selection.end);
	}

	return t;
}

function toggleCase(s: string) {
	let upper = s.toUpperCase();
	let lower = s.toLowerCase();

	if (s === upper) {
		return lower;
	} else if (s === lower) {
		return upper;
	}

	return upper;
}

function toggleCaseAll() {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		return;
	}
	if (!editor.selections) {
		return;
	}

	editor.edit((editBuilder) => {
		editor.selections.map(selection => {
			let range = new vscode.Range(selection.start, selection.end);
			let text = editor.document.getText(range);
			editBuilder.replace(range, toggleCase(text));
		});
	});

}
export function activate(context: vscode.ExtensionContext) {

	const config = vscode.workspace.getConfiguration("v750");
	const enableWatcher = config.get("enableWatcher") as boolean;

	const pick = vscode.commands.registerCommand('v750.pick', () => {
		const cmds = (vscode.workspace.getConfiguration("v750").get("commands") || []) as Comanda[];
		vscode.window.showQuickPick(cmds).then(value => {
			if (!!value) {
				var t = vscode.window.terminals.find((value) => value.name === "v750");
				if (!t) {
					t = vscode.window.createTerminal("v750");
				}
				t.sendText(substitute(value.command));
				// setTimeout(() => t!.dispose(), 5000);

				// vscode.window.showInformationMessage(value.command);
			}
		});
	});

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
	const toggle_case = vscode.commands.registerCommand('v750.togglecase', () => {
		toggleCaseAll();
	});


	context.subscriptions.push(toggle_case);
	context.subscriptions.push(pick);
	context.subscriptions.push(unstringify);
	context.subscriptions.push(sort);
	context.subscriptions.push(minify);
	context.subscriptions.push(format);
}

export function deactivate() { }

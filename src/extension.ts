import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    console.log('Hello World extension is active');

    const output = vscode.window.createOutputChannel('Hello World Agent');
    context.subscriptions.push(output);

    const disposable = vscode.commands.registerCommand('hello-world.helloWorld', async () => {
        const time = new Date().toISOString();
        const workspaceFolders = vscode.workspace.workspaceFolders;
        const workspacePath = workspaceFolders && workspaceFolders.length > 0 ? workspaceFolders[0].uri.fsPath : undefined;

        const message = `Hello World command executed at ${time}`;

        // Write to Output channel
        output.appendLine(message);
        output.show(true);

        // Write to a file in the workspace (if available) so an external agent can observe it
        if (workspacePath) {
            try {
                const filePath = path.join(workspacePath, '.hello-world-observations.log');
                const line = `${message}\n`;
                fs.appendFileSync(filePath, line, { encoding: 'utf8' });
                output.appendLine(`Wrote observation to ${filePath}`);
            } catch (err) {
                output.appendLine(`Failed to write observation file: ${err}`);
            }
        } else {
            output.appendLine('No workspace folder found; skipping file write.');
        }

        // Also show a brief information message so users see something in the UI
        vscode.window.showInformationMessage('Hello World executed (check Output: "Hello World Agent" and .hello-world-observations.log)');

        // Send a visible message to the terminal (create or reuse)
        const term = getOrCreateTerminal('Hello World Agent Terminal');
        term.show(true);
        term.sendText(`echo ${JSON.stringify(message)}`);
    });
    context.subscriptions.push(disposable);
}

function getOrCreateTerminal(name: string): vscode.Terminal {
    const existing = vscode.window.terminals.find(t => t.name === name);
    if (existing) return existing;
    return vscode.window.createTerminal(name);
}

export function deactivate() {}

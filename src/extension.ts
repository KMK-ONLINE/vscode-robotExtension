'use strict';

import * as vscode from 'vscode';
import { RobotReferenceProvider } from './provider/reference-provider/RobotReferenceProvider';
import { RobotCompletionProvider } from './provider/completion-provider/RobotCompletionProvider';
import { RobotDotCompletionProvider } from './provider/completion-provider/RobotDotCompletionProvider';
import { RobotVariableCompletionProvider } from './provider/completion-provider/RobotVariableCompletionProvider';
import { RobotBuiltInProvider } from './provider/completion-provider/RobotBuiltInProvider';
import { RobotDefinitionProvider } from './provider/definition-provider/RobotDefinitionProvider';
import { RobotRenameProvider } from './provider/rename-provider/RobotRenameProvider';
import { RobotHoverProvider } from './provider/hover-provider/RobotHoverProvider';
import { WorkspaceContext } from './WorkspaceContext';

export function activate(context: vscode.ExtensionContext) {
	console.log("robotf extension is running");
	context.subscriptions.push(
		vscode.languages.registerCompletionItemProvider(
			'robot', new RobotBuiltInProvider(), "*", "[", ":"
		)
	);
	context.subscriptions.push(
		vscode.languages.registerCompletionItemProvider(
			'robot', new RobotVariableCompletionProvider(), "$", "{"
		)
	);
	context.subscriptions.push(
		vscode.languages.registerCompletionItemProvider(
			'robot', new RobotDotCompletionProvider(), "."
		)
	);
	context.subscriptions.push(
		vscode.languages.registerCompletionItemProvider(
			'robot', new RobotCompletionProvider()
		)
	);
	context.subscriptions.push(
		vscode.languages.registerDefinitionProvider(
			'robot', new RobotDefinitionProvider()
		)
	);
	context.subscriptions.push(
		vscode.languages.registerRenameProvider(
			'robot', new RobotRenameProvider()
		)
	);
	context.subscriptions.push(
		vscode.languages.registerHoverProvider(
			'robot', new RobotHoverProvider()
		)
	);
	context.subscriptions.push(
		vscode.languages.registerReferenceProvider(
			'robot', new RobotReferenceProvider()
		)
	);
	context.subscriptions.push(
		vscode.workspace.onDidOpenTextDocument(WorkspaceContext.scanWorkspace)
	);
	context.subscriptions.push(
		vscode.workspace.onDidChangeTextDocument((e: vscode.TextDocumentChangeEvent) => {
			if (e.contentChanges[e.contentChanges.length - 1].text.includes("\n")) {
				Promise.resolve(WorkspaceContext.scanWorkspace());
			}
		})
	);
}

export function deactivate() {
	console.log("robotf extension killed");
}

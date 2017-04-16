'use strict';

import * as vscode from 'vscode';
import { RobotCompletionProvider } from './provider/completion-provider/RobotCompletionProvider';
import { RobotVariableCompletionProvider } from './provider/completion-provider/RobotVariableCompletionProvider';
import { RobotBuiltInProvider } from './provider/completion-provider/RobotBuiltInProvider';
import { RobotDefinitionProvider } from './provider/definition-provider/RobotDefinitionProvider';
import { RobotRenameProvider } from './provider/rename-provider/RobotRenameProvider';
import { WorkspaceContext } from './WorkspaceContext';

export function activate(context: vscode.ExtensionContext) {
	console.log("robotf extension is running");
	WorkspaceContext.scanWorkspace();
	context.subscriptions.push(vscode.languages.registerCompletionItemProvider('robot', new RobotBuiltInProvider(), "*", "["));
	context.subscriptions.push(vscode.languages.registerCompletionItemProvider('robot', new RobotVariableCompletionProvider(), "$"));
	context.subscriptions.push(vscode.languages.registerCompletionItemProvider('robot', new RobotCompletionProvider()));
	context.subscriptions.push(vscode.languages.registerDefinitionProvider('robot', new RobotDefinitionProvider()));
	context.subscriptions.push(vscode.languages.registerRenameProvider('robot', new RobotRenameProvider()));
}

export function deactivate() {
	console.log("robotf extension killed");
}

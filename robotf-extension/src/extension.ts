'use strict';

import * as vscode from 'vscode';
import {RobotCompletionProvider} from './RobotCompletionProvider';
import {VariableCompletionProvider} from './VariableCompletionProvider';

export function activate(context: vscode.ExtensionContext) {
	console.log("robot extension is running");
	context.subscriptions.push(vscode.languages.registerCompletionItemProvider('robot', new RobotCompletionProvider()));
	context.subscriptions.push(vscode.languages.registerCompletionItemProvider('robot', new VariableCompletionProvider(),"$"));
}

export function deactivate() {
	
}

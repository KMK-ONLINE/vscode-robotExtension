'use strict';

import * as vscode from 'vscode';
import {RobotCompletionProvider} from './RobotCompletionProvider';

export function activate(context: vscode.ExtensionContext) {
	console.log("nayanda extension is running");
	context.subscriptions.push(vscode.languages.registerCompletionItemProvider('robot', new RobotCompletionProvider()));
}

export function deactivate() {
	
}

'use strict';

import vscode = require('vscode');
import {Util} from './Util';

class RobotCompletionProvider implements vscode.CompletionItemProvider{
	public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken):Thenable<vscode.CompletionItem[]> | vscode.CompletionItem[]{
		let thisFileName = Util.fileNameExtractor(document);
		let line = document.lineAt(position);
		let match = line.text.match(/(.+)\.(.*)$/);
		if(!match) return [];
		
		return;

	}
}
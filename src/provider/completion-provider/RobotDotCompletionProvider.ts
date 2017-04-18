'use strict';

import { WorkspaceContext } from '../../WorkspaceContext';
import vscode = require('vscode');
import { ResourceHelper } from '../../helper/ResourceHelper';
import { KeywordHelper } from '../../helper/KeywordHelper';
import { Util } from '../../Util';

export class RobotDotCompletionProvider implements vscode.CompletionItemProvider {

	public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Thenable<vscode.CompletionItem[]> | vscode.CompletionItem[] {
		let line = document.lineAt(position);
		let keyword = KeywordHelper.getKeywordByPosition(document, position);
		if (keyword != null) {
			if (keyword.length == 2) {
				let sub = keyword[1].length - 1;
				return this.matchJustKeyword(document, keyword[0]);
			}
		}
		else{
			let sub = position.character - line.firstNonWhitespaceCharacterIndex;
			return [new vscode.CompletionItem("...		".substr(sub), vscode.CompletionItemKind.Snippet)]
		}
	}

	private matchJustKeyword(document: vscode.TextDocument, fileName: string): vscode.CompletionItem[] {
		let included = ResourceHelper.allIncludedResources(document);
		let keywords = KeywordHelper.getResourceKeywordByFileName(included, fileName);
		let completionItem = Util.stringArrayToCompletionItems(keywords, vscode.CompletionItemKind.Function);
		return completionItem;
	}
}

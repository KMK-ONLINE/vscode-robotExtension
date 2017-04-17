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
		let resourceMatcher = line.text.match(/^Resource\s{2,}(\.?\.?\S*)/);
		if (resourceMatcher) {
			return this.completeResource(document, resourceMatcher[1]);
		}
		else if (keyword != null) {
			if (keyword.length == 2) {
				return this.matchJustKeyword(document, keyword[0], keyword[1]);
			}
		}
	}

	private matchJustKeyword(document: vscode.TextDocument, fileName: string, match: string): vscode.CompletionItem[] {
		let included = ResourceHelper.allIncludedResources(document);
		let keywords = KeywordHelper.getResourceKeywordByFileName(included, fileName);
		let completionItem = Util.stringArrayToCompletionItems(keywords, vscode.CompletionItemKind.Function);
		return completionItem;
	}

	private completeResource(document: vscode.TextDocument, path: string): vscode.CompletionItem[] {
		let resources = WorkspaceContext.getAllPath();
		let resourceRelativePath = ResourceHelper.formatResources(document, "", resources);
		return Util.stringArrayToCompletionItems(resourceRelativePath, vscode.CompletionItemKind.File);
	}
}

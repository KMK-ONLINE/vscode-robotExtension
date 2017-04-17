'use strict';

import { WorkspaceContext } from '../../WorkspaceContext';
import vscode = require('vscode');
import { ResourceHelper } from '../../helper/ResourceHelper';
import { KeywordHelper } from '../../helper/KeywordHelper';
import { Util } from '../../Util';
import { SYNTAX } from '../../helper/KeywordDictionary';

export class RobotCompletionProvider implements vscode.CompletionItemProvider {

	public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Thenable<vscode.CompletionItem[]> | vscode.CompletionItem[] {
		let line = document.lineAt(position);
		let keyword = KeywordHelper.getKeywordByPosition(document, position);
		let resourceMatcher1 = line.text.match(/^([rR][eE]?[sS]?[oO]?[uU]?[rR]?[cC]?[eE]?)$/);
		let resourceMatcher2 = line.text.match(/^Resource\s{2,}(\.?\.?\S*)/);
		if (resourceMatcher1) {
			return this.matchResource(document, resourceMatcher1[0]);
		}
		else if (resourceMatcher2) {
			return this.completeResource(document, resourceMatcher2[1]);
		}
		else if (keyword != null) {
			if (keyword.length == 1) {
				return this.matchKeyword(document, keyword[0]);
			}
		}
		else {
			return Util.stringArrayToCompletionItems(SYNTAX, vscode.CompletionItemKind.Keyword);
		}
	}

	private matchKeyword(document: vscode.TextDocument, match: string): vscode.CompletionItem[] {
		let included = ResourceHelper.allIncludedResources(document);
		let localKeywords = KeywordHelper.searchKeyword(document)
		let includedKeywords = KeywordHelper.searchAllIncludedKeyword(included);
		let libKeywords = KeywordHelper.getKeywordLibrary(included.concat(document));
		let allKeywords = Util.stringArrayToCompletionItems(localKeywords.concat(includedKeywords, libKeywords), vscode.CompletionItemKind.Function);
		let allFileNames = Util.stringArrayToCompletionItems(ResourceHelper.documentsToNames(included), vscode.CompletionItemKind.Class);
		let all = allKeywords.concat(Util.stringArrayToCompletionItems(SYNTAX, vscode.CompletionItemKind.Keyword), allFileNames);
		return all;
	}

	private completeResource(document: vscode.TextDocument, path: string): vscode.CompletionItem[] {
		let resources = WorkspaceContext.getAllPath();
		let resourceRelativePath = ResourceHelper.formatResources(document, "", resources);
		return Util.stringArrayToCompletionItems(resourceRelativePath, vscode.CompletionItemKind.File);
	}

	private matchResource(document: vscode.TextDocument, fileName: string): vscode.CompletionItem[] {
		let resources = WorkspaceContext.getAllPath();
		let includesFormat = ResourceHelper.autoFormatResources(document, resources);
		let completionItem = Util.stringArrayToCompletionItems(includesFormat, vscode.CompletionItemKind.File);
		return [new vscode.CompletionItem("Resource", vscode.CompletionItemKind.Keyword)].concat(completionItem);;
	}

}

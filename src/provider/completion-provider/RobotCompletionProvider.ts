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
		let resourceMatcher2 = line.text.match(/^Resource\s{2,}(([-_]+|\w+)+)\s*$/);
		if (resourceMatcher1) {
			return this.matchResource(document);
		}
		else if (resourceMatcher2) {
			return this.completeResource(document);
		}
		else if (keyword != null) {
			if (keyword.length == 1) {
				return this.matchKeyword(document);
			}
			else{
				return this.matchJustKeyword(document);
			}
		}
		else {
			return Util.stringArrayToCompletionItems(SYNTAX, vscode.CompletionItemKind.Keyword);
		}
	}

	private matchJustKeyword(document: vscode.TextDocument): vscode.CompletionItem[] {
		let included = ResourceHelper.allIncludedResources(document);
		let localKeywords = KeywordHelper.searchKeyword(document)
		let includedKeywords = KeywordHelper.searchAllIncludedKeyword(included);
		let libKeywords = KeywordHelper.getKeywordLibrary(included.concat(document));
		let allKeywords = localKeywords.concat(includedKeywords, libKeywords);
		let keys = Util.stringArrayToCompletionItems(allKeywords, vscode.CompletionItemKind.Function);
		let all = keys.concat(Util.stringArrayToCompletionItems(SYNTAX, vscode.CompletionItemKind.Keyword));
		return Array.from(new Set(all));
	}

	private matchKeyword(document: vscode.TextDocument): vscode.CompletionItem[] {
		let included = ResourceHelper.allIncludedResources(document);
		let allFileNames = ResourceHelper.documentsToNames(included);
		let files = Util.stringArrayToCompletionItems(allFileNames, vscode.CompletionItemKind.Class);
		let all = files.concat(this.matchJustKeyword(document));
		return Array.from(new Set(all));
	}

	private completeResource(document: vscode.TextDocument): vscode.CompletionItem[] {
		let resources = WorkspaceContext.getAllPath();
		let resourceRelativePath = ResourceHelper.formatResources(document, "", resources);
		return Util.stringArrayToCompletionItems(resourceRelativePath, vscode.CompletionItemKind.File);
	}

	private matchResource(document: vscode.TextDocument): vscode.CompletionItem[] {
		let resources = WorkspaceContext.getAllPath();
		let includesFormat = ResourceHelper.autoFormatResources(document, resources);
		let completionItem = Util.stringArrayToCompletionItems(includesFormat, vscode.CompletionItemKind.File);
		return [new vscode.CompletionItem("Resource", vscode.CompletionItemKind.Keyword)].concat(completionItem);;
	}

}

'use strict';

import { WorkspaceContext } from '../../WorkspaceContext';
import vscode = require('vscode');
import { ResourceHelper } from '../../helper/ResourceHelper';
import { KeywordHelper } from '../../helper/KeywordHelper';
import { Util } from '../../Util';
import { SYNTAX } from '../../helper/KeywordDictionary';

export class RobotCompletionProvider implements vscode.CompletionItemProvider {

	public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Thenable<vscode.CompletionItem[]> | vscode.CompletionItem[] {
		WorkspaceContext.scanWorkspace();
		let line = document.lineAt(position);
		let keyword = KeywordHelper.getKeywordByPosition(document, position);
		let resourceMatcher1 = line.text.match(/^([rR][eE]?[sS]?[oO]?[uU]?[rR]?[cC]?[eE]?)$/);
		let resourceMatcher2 = line.text.match(/^Resource\s{2,}(\.?\.?\S*)/);
		if (resourceMatcher1) {
			return Promise.resolve<vscode.CompletionItem[]>(this.matchResource(document, resourceMatcher1[0]));
		}
		else if (resourceMatcher2) {
			return Promise.resolve<vscode.CompletionItem[]>(this.completeResource(document, resourceMatcher2[1]));
		}
		else if (keyword != null) {
			if(keyword.length == 1){
				return Promise.resolve<vscode.CompletionItem[]>(this.matchKeyword(document, keyword[0]));
			}
			else{
				return Promise.resolve<vscode.CompletionItem[]>(this.matchKeyword(document, keyword[1]));
			}
		}
		else {
			return Util.stringArrayToCompletionItems(SYNTAX);
		}
	}

	private matchKeyword(document: vscode.TextDocument, fileName: string): vscode.CompletionItem[] {
		let included = ResourceHelper.allIncludedResources(document);
		let localKeywords = KeywordHelper.searchKeyword(document)
		let includedKeywords = KeywordHelper.searchAllIncludedKeyword(included);
		let libKeywords = KeywordHelper.getKeywordLibrary(included.concat(document));
		let allKeywords = localKeywords.concat(SYNTAX, includedKeywords, libKeywords);
		let suggestionsString = Util.analyzeSentenceLikeliness(fileName, Array.from(new Set(allKeywords)));
		return Util.stringArrayToCompletionItems(suggestionsString);
	}

	private completeResource(document: vscode.TextDocument, path: string): vscode.CompletionItem[] {
		let resources = WorkspaceContext.getAllPath();
		let resourceRelativePath = ResourceHelper.formatResources(document, "", resources);
		let suggestionsString = Util.analyzeSentenceLikeliness(path, Array.from(new Set(resourceRelativePath)));
		return Util.stringArrayToCompletionItems(suggestionsString);
	}

	private matchResource(document: vscode.TextDocument, fileName: string): vscode.CompletionItem[] {
		let resources = WorkspaceContext.getAllPath();
		let includesFormat = ResourceHelper.autoFormatResources(document, resources);
		let suggestionsString = Util.analyzeSentenceLikeliness(fileName, Array.from(new Set(includesFormat)));
		return Util.stringArrayToCompletionItems(suggestionsString);
	}

}

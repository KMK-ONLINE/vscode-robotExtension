'use strict';

import { WorkspaceContext } from '../../WorkspaceContext';
import { TextDocument, Position, TextLine, CompletionItemProvider, CompletionItemKind, CompletionItem, CancellationToken } from 'vscode';
import { allIncludedResources, formatResources, autoFormatResources, documentsToNames } from '../../helper/ResourceHelper';
import { getKeywordByPosition, searchKeyword, searchAllIncludedKeyword, getKeywordLibrary } from '../../helper/KeywordHelper';
import { stringArrayToCompletionItems } from '../../Util';
import { SYNTAX } from '../../helper/KeywordDictionary';

export class RobotCompletionProvider implements CompletionItemProvider {

	public provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken)
		: Thenable<CompletionItem[]> | CompletionItem[] {
		let line = document.lineAt(position);
		let keyword = getKeywordByPosition(document, position);
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
			else {
				return this.matchJustKeyword(document);
			}
		}
		else {
			return stringArrayToCompletionItems(SYNTAX, CompletionItemKind.Keyword);
		}
	}

	private matchJustKeyword(document: TextDocument): CompletionItem[] {
		let included = allIncludedResources(document);
		let localKeywords = searchKeyword(document)
		let includedKeywords = searchAllIncludedKeyword(included);
		let libKeywords = getKeywordLibrary(
			included.concat(document)
		);
		let allKeywords = localKeywords.concat(includedKeywords, libKeywords);
		let keys = stringArrayToCompletionItems(allKeywords, CompletionItemKind.Function);
		let all = keys.concat(
			stringArrayToCompletionItems(SYNTAX, CompletionItemKind.Keyword)
		);
		return Array.from(new Set(all));
	}

	private matchKeyword(document: TextDocument): CompletionItem[] {
		let included = allIncludedResources(document);
		let allFileNames = documentsToNames(included);
		let files = stringArrayToCompletionItems(allFileNames, CompletionItemKind.Class);
		let all = files.concat(this.matchJustKeyword(document));
		return Array.from(new Set(all));
	}

	private completeResource(document: TextDocument): CompletionItem[] {
		let resources = WorkspaceContext.getAllPath();
		let resourceRelativePath = formatResources(document, "", resources);
		return stringArrayToCompletionItems(resourceRelativePath, CompletionItemKind.File);
	}

	private matchResource(document: TextDocument): CompletionItem[] {
		let resources = WorkspaceContext.getAllPath();
		let includesFormat = autoFormatResources(document, resources);
		let completionItem = stringArrayToCompletionItems(includesFormat, CompletionItemKind.File);
		return [
			new CompletionItem("Resource", CompletionItemKind.Keyword)
		].concat(completionItem);;
	}

}

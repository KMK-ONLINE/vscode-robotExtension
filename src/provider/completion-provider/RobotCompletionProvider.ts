'use strict';

import { WorkspaceContext } from '../../WorkspaceContext';
import { TextDocument, Position, CompletionItemProvider, CompletionItemKind, CompletionItem, CancellationToken } from 'vscode';
import { formatResources, formatFullResources } from '../../helper/ResourceHelper';
import { getDocKeyByPos } from '../../helper/KeywordHelper';
import { stringArrayToCompletionItems } from '../../Util';
import { SYNTAX } from '../../dictionary/KeywordDictionary';
import { RobotDoc } from '../../model/RobotDoc';

export class RobotCompletionProvider implements CompletionItemProvider {

	public provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken)
		: Thenable<CompletionItem[]> | CompletionItem[] {
		let line = document.lineAt(position);
		let keyword = getDocKeyByPos(document, position);
		let resourceMatcher1 = line.text.match(/^([rR][eE]?[sS]?[oO]?[uU]?[rR]?[cC]?[eE]?)$/);
		let resourceMatcher2 = line.text.match(/^Resource\s{2,}(([-_]+|\w+)+)\s*$/);
		if (resourceMatcher1) {
			return this.matchResource(document);
		}
		else if (resourceMatcher2) {
			return this.completeResource(document);
		}
		else if (keyword != null) {
			return this.matchKeyword(document);
		}
		else {
			return stringArrayToCompletionItems(SYNTAX, CompletionItemKind.Keyword);
		}
	}

	private matchKeyword(document: TextDocument): CompletionItem[] {
		let thisDoc = RobotDoc.parseDocument(document);
		let included = stringArrayToCompletionItems(thisDoc.allResourceNames, CompletionItemKind.Class);
		let localKeyComplete = stringArrayToCompletionItems(thisDoc.keywordNames, CompletionItemKind.Function);
		let keyComplete = stringArrayToCompletionItems(thisDoc.allAvailableKeywordFullNames, CompletionItemKind.Function);
		let otherKey = this.getLibAndSyntax(thisDoc);
		return included.concat(otherKey, localKeyComplete, keyComplete);
	}

	private getLibAndSyntax(doc: RobotDoc): CompletionItem[] {
		let libKey = stringArrayToCompletionItems(doc.library, CompletionItemKind.Function)
		let syntax = stringArrayToCompletionItems(SYNTAX, CompletionItemKind.Keyword);
		return libKey.concat(syntax);;
	}

	private completeResource(document: TextDocument): CompletionItem[] {
		let resources = WorkspaceContext.getAllPath();
		let resourceRelativePath = formatResources(document, "", resources);
		return stringArrayToCompletionItems(resourceRelativePath, CompletionItemKind.File);
	}

	private matchResource(document: TextDocument): CompletionItem[] {
		let resources = WorkspaceContext.getAllPath();
		let includesFormat = formatFullResources(document, resources);
		let completionItem = stringArrayToCompletionItems(includesFormat, CompletionItemKind.File);
		return [
			new CompletionItem("Resource", CompletionItemKind.Keyword)
		].concat(completionItem);;
	}

}

'use strict';

import { WorkspaceContext } from '../../WorkspaceContext';
import { TextDocument, Position, TextLine, CompletionItemProvider, CompletionItemKind, CompletionItem, CancellationToken } from 'vscode';
import { searchAllResources, searchMatchingFileName } from '../../helper/ResourceHelper';
import { getKeywordByPosition, searchKeywords } from '../../helper/KeywordHelper';
import { stringArrayToCompletionItems } from '../../Util';

export class RobotDotCompletionProvider implements CompletionItemProvider {

	public provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken)
		: Thenable<CompletionItem[]> | CompletionItem[] {
		let line = document.lineAt(position);
		let keyword = getKeywordByPosition(document, position);
		if (keyword != null) {
			if (keyword.length == 2) {
				let sub = keyword[1].length - 1;
				return this.matchJustKeyword(document, keyword[0]);
			}
		}
		else {
			let sub = position.character - line.firstNonWhitespaceCharacterIndex;
			return [
				new CompletionItem("...		".substr(sub), CompletionItemKind.Snippet)
			]
		}
	}

	private matchJustKeyword(document: TextDocument, fileName: string): CompletionItem[] {
		let included = searchAllResources(document);
		let docs = searchMatchingFileName(included, fileName);
		let keywords = searchKeywords(docs);
		let completionItem = stringArrayToCompletionItems(keywords, CompletionItemKind.Function);
		return completionItem;
	}
}

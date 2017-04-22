'use strict';
import { RobotDoc } from '../../model/RobotDoc';
import { TextDocument, Position, CompletionItemProvider, CompletionItemKind, CompletionItem, CancellationToken } from 'vscode';
import { getDocKeyByPos } from '../../helper/KeywordHelper';
import { stringArrayToCompletionItems } from '../../Util';

export class RobotDotCompletionProvider implements CompletionItemProvider {

	public provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken)
		: Thenable<CompletionItem[]> | CompletionItem[] {
		let line = document.lineAt(position);
		let keyword = getDocKeyByPos(document, position);
		if (keyword != null) {
			if (keyword.length == 2) {
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
		let doc = RobotDoc.parseDocument(document);
		let keywords = doc.getKeywordNameByResourceName(fileName);
		let completionItem = stringArrayToCompletionItems(keywords, CompletionItemKind.Function);
		return completionItem;
	}
}

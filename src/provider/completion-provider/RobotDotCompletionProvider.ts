'use strict';
import { WorkspaceContext } from '../../WorkspaceContext';
import { RobotDoc } from '../../model/RobotDoc';
import { TextDocument, Position, CompletionItemProvider, CompletionItemKind, CompletionItem, CancellationToken } from 'vscode';
import { getDocKeyByPos } from '../../helper/KeywordHelper';
import { stringArrayToCompletionItems, isIgnoreCompletion } from '../../Util';

export class RobotDotCompletionProvider implements CompletionItemProvider {

	public provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken)
		: Thenable<CompletionItem[]> | CompletionItem[] {
		let line = document.lineAt(position);
		if (!isIgnoreCompletion(line.text)) {
			let keyword = getDocKeyByPos(document, position);
			if (keyword != null) {
				if (keyword.length == 2) {
					return RobotDotCompletionProvider.matchJustKeyword(document, keyword[0]);
				}
			}
			else {
				let sub = position.character - line.firstNonWhitespaceCharacterIndex;
				return [
					new CompletionItem("...		".substr(sub), CompletionItemKind.Snippet)
				]
			}
		}
		return null;
	}

	private static matchJustKeyword(document: TextDocument, fileName: string): CompletionItem[] {
		let doc = WorkspaceContext.getDocumentByUri(document.uri)
		let keywords = doc.getKeywordsNameByResourceName(fileName);
		let completionItem = stringArrayToCompletionItems(keywords, CompletionItemKind.Function);
		return completionItem;
	}
}

'use strict';

import { RobotDoc } from '../../model/RobotDoc';
import { TextDocument, Position, CompletionItemProvider, CompletionItemKind, CompletionItem, CancellationToken } from 'vscode';
import { stringArrayToCompletionItems } from '../../Util';
import { formatVariables } from '../../helper/VariableHelper';

export class RobotVariableCompletionProvider implements CompletionItemProvider {

    public provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken)
        : Thenable<CompletionItem[]> | CompletionItem[] {
        let line = document.lineAt(position).text;
        let lastWhite = document.lineAt(position).firstNonWhitespaceCharacterIndex;
        let subLine = line.substr(lastWhite);
        let thisDoc = RobotDoc.parseDocument(document);
        let vars = thisDoc.allAvailableVariableNames;
        if (/^\$\{/.test(subLine)) {
            return stringArrayToCompletionItems(vars, CompletionItemKind.Variable);
        }
        else if(/^\$/.test(subLine)){
            let suggestion = formatVariables(vars);
            return stringArrayToCompletionItems(suggestion, CompletionItemKind.Variable);
        }
        return null;
    }
}
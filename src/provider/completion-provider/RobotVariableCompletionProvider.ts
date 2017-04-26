'use strict';
import { WorkspaceContext } from '../../WorkspaceContext';

import { RobotDoc } from '../../model/RobotDoc';
import { TextDocument, Position, CompletionItemProvider, CompletionItemKind, CompletionItem, CancellationToken } from 'vscode';
import { stringArrayToCompletionItems } from '../../Util';
import { formatVariables } from '../../helper/VariableHelper';

export class RobotVariableCompletionProvider implements CompletionItemProvider {

    public provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken)
        : Thenable<CompletionItem[]> | CompletionItem[] {
        let line = document.lineAt(position).text;
        let lastWhite = RobotVariableCompletionProvider.searchDollar(line, position);
        let subLine = line.substr(lastWhite);
        let thisDoc = WorkspaceContext.getDocumentByUri(document.uri)
        let vars = thisDoc.allIncludedVariablesName;
        if (/^\$\{/.test(subLine)) {
            return stringArrayToCompletionItems(vars, CompletionItemKind.Variable);
        }
        else if (/^\$/.test(subLine)) {
            let suggestion = formatVariables(vars);
            return stringArrayToCompletionItems(suggestion, CompletionItemKind.Variable);
        }
        return null;
    }

    private static searchDollar(line: string, position: Position): number {
        for (let i = position.character; i >= 0; i--) {
            if (line.charAt(i) == "$") {
                return i;
            }
        }
        return 0;
    }
}
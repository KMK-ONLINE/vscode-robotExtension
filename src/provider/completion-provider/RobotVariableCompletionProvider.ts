'use strict';

import { TextDocument, Position, CompletionItemProvider, CompletionItemKind, CompletionItem, CancellationToken } from 'vscode';
import { stringArrayToCompletionItems } from '../../Util';
import { WorkspaceContext } from '../../WorkspaceContext';
import { getVariablesNames, getVariables } from '../../helper/VariableHelper';

export class RobotVariableCompletionProvider implements CompletionItemProvider {

    public provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken)
        : Thenable<CompletionItem[]> | CompletionItem[] {
        let line = document.lineAt(position);
        let matcher1 = line.text.match(/\$\{(\w*\s*[-_]*)\}/);
        let matcher2 = line.text.match(/(\$\{?(\w*\s*[-_]*))(\s+|$)/);
        if (matcher1) {
            return stringArrayToCompletionItems(
                getVariablesNames(document, matcher1[1]), CompletionItemKind.Variable
            );
        }
        else if (matcher2) {
            return stringArrayToCompletionItems(
                getVariables(document, matcher2[2]), CompletionItemKind.Variable
            );
        }
    }
}
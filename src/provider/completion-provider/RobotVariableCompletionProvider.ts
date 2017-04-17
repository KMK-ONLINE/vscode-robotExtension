'use strict';

import vscode = require('vscode');
import { ResourceHelper } from '../../helper/ResourceHelper';
import { Util } from '../../Util';
import { WorkspaceContext } from '../../WorkspaceContext';
import { VariableHelper } from '../../helper/VariableHelper';

export class RobotVariableCompletionProvider implements vscode.CompletionItemProvider {

    public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Thenable<vscode.CompletionItem[]> | vscode.CompletionItem[] {
        let line = document.lineAt(position);
        let matcher1 = line.text.match(/\$\{(\w*\s*[-_]*)\}/);
        let matcher2 = line.text.match(/(\$\{?(\w*\s*[-_]*))(\s+|$)/);
        if (matcher1) {
            return Util.stringArrayToCompletionItems(VariableHelper.getVariablesNames(document, matcher1[1]), vscode.CompletionItemKind.Variable);
        }
        else if (matcher2) {
            return Util.stringArrayToCompletionItems(VariableHelper.getVariables(document, matcher2[2]), vscode.CompletionItemKind.Variable);
        }
    }
}
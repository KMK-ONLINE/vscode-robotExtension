'use strict';

import vscode = require('vscode');
import { KeywordHelper } from '../../helper/KeywordHelper';
import { WorkspaceContext } from '../../WorkspaceContext';

export class RobotDefinitionProvider implements vscode.DefinitionProvider {

    public provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Definition> {
        WorkspaceContext.scanWorkspace();
        return Promise.resolve(RobotDefinitionProvider.getDefinition(document, position));
    }

    private static getDefinition(document: vscode.TextDocument, position: vscode.Position): vscode.ProviderResult<vscode.Definition> {
        let key = KeywordHelper.getKeywordByPosition(document, position);
        if (key != null) {
            if (key.length == 2) {
                return KeywordHelper.getIncludedKeywordOrigin(document, key[0], key[1]);
            }
            else {
                return KeywordHelper.getKeywordOrigin(document, key[0]);
            }
        }
        return null;
    }
}
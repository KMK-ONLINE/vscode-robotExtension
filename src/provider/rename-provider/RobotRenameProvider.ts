'use strict'
import { WorkspaceContext } from '../../WorkspaceContext';

import vscode = require('vscode');
import { KeywordHelper } from '../../helper/KeywordHelper';
import { ResourceHelper } from '../../helper/ResourceHelper';
import cp = require('child_process');

export class RobotRenameProvider implements vscode.RenameProvider {
    public provideRenameEdits(document: vscode.TextDocument, position: vscode.Position, newName: string, token: vscode.CancellationToken): vscode.ProviderResult<vscode.WorkspaceEdit> {
        let keyword = KeywordHelper.getKeywordByPosition(document, position);
        let key: string;
        let keywordOrigin: vscode.Location;
        if (keyword.length == 1) {
            keywordOrigin = KeywordHelper.getKeywordOrigin(document, keyword[0]);
            key = keyword[0];
        }
        else if (keyword.length == 2) {
            keywordOrigin = KeywordHelper.getIncludedKeywordOrigin(document, keyword[0], keyword[1]);
            key = keyword[1];
        }
        else {
            return null;
        }
        return Promise.resolve().then(() => {
            let allLocation = KeywordHelper.getAllKeywordReferences(WorkspaceContext.getDocumentByUri(keywordOrigin.uri), key);
            let editor = new vscode.WorkspaceEdit();
            for (let i = 0; i < allLocation.length; i++) {
                let location = allLocation[i];
                editor.replace(location.uri, location.range, newName);
            }
            return editor;
        });
    }
}
'use strict'
import { WorkspaceContext } from '../../WorkspaceContext';

import vscode = require('vscode');
import { KeywordHelper } from '../../helper/KeywordHelper';
import { ResourceHelper } from '../../helper/ResourceHelper';

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
        return Promise.resolve(RobotRenameProvider.renameKeyword(keywordOrigin, key, newName));
    }

    private static renameKeyword(keywordOrigin: vscode.Location, keyword: string, newName: string): vscode.WorkspaceEdit {
        let allLocation = KeywordHelper.getAllKeywordReferences(WorkspaceContext.getDocumentByUri(keywordOrigin.uri), keyword);
        let editor = new vscode.WorkspaceEdit();
        allLocation.forEach((location) => {
            editor.replace(location.uri, location.range, newName);
        });
        return editor;
    }
}
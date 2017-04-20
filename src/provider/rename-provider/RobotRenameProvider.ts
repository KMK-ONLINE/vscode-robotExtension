'use strict'

import { WorkspaceContext } from '../../WorkspaceContext';
import { TextDocument, Position, TextLine, RenameProvider, WorkspaceEdit, ProviderResult, CancellationToken, Location } from 'vscode';
import { getKeywordByPosition, getKeywordOrigin, searchKeywordOrigin, getAllKeywordReferences } from '../../helper/KeywordHelper';
import { getVariableByPosition, getVariableOrigin, getAllVariableReference } from '../../helper/VariableHelper';

export class RobotRenameProvider implements RenameProvider {
    public provideRenameEdits(document: TextDocument, position: Position, newName: string, token: CancellationToken)
        : ProviderResult<WorkspaceEdit> {
        let keyword = getKeywordByPosition(document, position);
        let variable = getVariableByPosition(document, position);
        if (keyword) {
            return RobotRenameProvider.renameKey(document, keyword, newName);
        }
        else if (variable) {
            return RobotRenameProvider.renameVar(document, variable, newName, position);
        }
        return null;
    }

    private static renameVar(document: TextDocument, variable: string, newName: string, position:Position)
        : ProviderResult<WorkspaceEdit> {
        return Promise.resolve().then(() => {
            let allLocation = getAllVariableReference(document, variable, position);
            let editor = new WorkspaceEdit();
            for (let i = 0; i < allLocation.length; i++) {
                let location = allLocation[i];
                editor.replace(location.uri, location.range, newName);
                WorkspaceContext.scanWorkspace();
            }
            return editor;
        });

    }

    private static renameKey(document: TextDocument, keyword: string[], newName: string)
        : ProviderResult<WorkspaceEdit> {
        let key: string;
        let keywordOrigin: Location;
        if (keyword.length == 1) {
            keywordOrigin = getKeywordOrigin(document, keyword[0]);
            key = keyword[0];
        }
        else if (keyword.length == 2) {
            keywordOrigin = searchKeywordOrigin(document, keyword[0], keyword[1]);
            key = keyword[1];
        }
        else {
            return null;
        }
        return Promise.resolve().then(() => {
            let allLocation = getAllKeywordReferences(
                WorkspaceContext.getDocumentByUri(keywordOrigin.uri), key
            );
            let editor = new WorkspaceEdit();
            for (let i = 0; i < allLocation.length; i++) {
                let location = allLocation[i];
                editor.replace(location.uri, location.range, newName);
                WorkspaceContext.scanWorkspace();
            }
            return editor;
        });
    }
}
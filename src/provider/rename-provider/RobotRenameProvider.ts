'use strict'

import { WorkspaceContext } from '../../WorkspaceContext';
import { TextDocument, Position, TextLine, RenameProvider, WorkspaceEdit, ProviderResult, CancellationToken, Location } from 'vscode';
import { getKeywordByPosition, getKeywordOrigin, getIncludedKeywordOrigin, getAllKeywordReferences } from '../../helper/KeywordHelper';

export class RobotRenameProvider implements RenameProvider {
    public provideRenameEdits(document: TextDocument, position: Position, newName: string, token: CancellationToken)
        : ProviderResult<WorkspaceEdit> {
        let keyword = getKeywordByPosition(document, position);
        let key: string;
        let keywordOrigin: Location;
        if (keyword.length == 1) {
            keywordOrigin = getKeywordOrigin(document, keyword[0]);
            key = keyword[0];
        }
        else if (keyword.length == 2) {
            keywordOrigin = getIncludedKeywordOrigin(document, keyword[0], keyword[1]);
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
            }
            return editor;
        });
    }
}
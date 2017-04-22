'use strict'

import { RobotDoc } from '../../model/RobotDoc';
import { replacer } from '../../helper/Editor'
import { TextDocument, Position, RenameProvider, WorkspaceEdit, ProviderResult, CancellationToken } from 'vscode';

export class RobotRenameProvider implements RenameProvider {

    public provideRenameEdits(document: TextDocument, position: Position, newName: string, token: CancellationToken)
        : ProviderResult<WorkspaceEdit> {
        return Promise.resolve().then(() => {
            let thisDoc = RobotDoc.parseDocument(document);
            let variable = thisDoc.getVariableByPosition(position);
            let keyword = thisDoc.getKeywordByPosition(position);
            let reff = []
            if (keyword != null) {
                reff = keyword.allRefference;
            }
            else if (variable != null) {
                reff = variable.allRefference;
            }
            return replacer(reff, newName);
        });
    }
}
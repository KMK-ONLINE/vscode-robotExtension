'use strict'

import { Member } from '../../model/Member';
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
            let ref:Member[] = []
            if (keyword != null) {
                ref = keyword.allReferences;
            }
            else if (variable != null) {
                ref = variable.allReferences;
            }
            return replacer(ref, newName);
        });
    }
}
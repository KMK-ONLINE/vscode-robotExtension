'use strict'

import { WorkspaceContext } from '../../WorkspaceContext';
import { Member } from '../../model/Member';
import { RobotDoc } from '../../model/RobotDoc';
import { TextDocument, Position, ReferenceProvider, ReferenceContext, ProviderResult, CancellationToken, Location } from 'vscode';

export class RobotReferenceProvider implements ReferenceProvider {

    public provideReferences(document: TextDocument, position: Position, context: ReferenceContext, token: CancellationToken)
        : ProviderResult<Array<Location>> {
        WorkspaceContext.scanWorkspace();
        let thisDoc = WorkspaceContext.getDocumentByUri(document.uri)
        let variable = thisDoc.getVariableByPosition(position);
        let keyword = thisDoc.getKeywordByPosition(position);
        let ref: Member[] = []
        if (keyword != null) {
            ref = keyword.allReferences;
        }
        else if (variable != null) {
            ref = variable.allReferences;
        }
        return RobotReferenceProvider.membersToArrOfLocation(ref);

    }

    private static membersToArrOfLocation(members: Member[]): Location[] {
        let result: Location[] = [];
        for (let i = 0; i < members.length; i++) {
            result.push(members[i].location);
        }
        return result;
    }
}
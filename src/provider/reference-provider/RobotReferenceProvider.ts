'use strict'

import {Member} from '../../model/Member';
import { RobotDoc } from '../../model/RobotDoc';
import { TextDocument, Position, ReferenceProvider, ReferenceContext, ProviderResult, CancellationToken, Location } from 'vscode';

export class RobotReferenceProvider implements ReferenceProvider {

    public provideReferences(document: TextDocument, position: Position, context: ReferenceContext, token: CancellationToken)
        : ProviderResult<Array<Location>> {
            return Promise.resolve().then(()=>{
                let thisDoc = RobotDoc.parseDocument(document);
            let variable = thisDoc.getVariableByPosition(position);
            let keyword = thisDoc.getKeywordByPosition(position);
            let ref:Member[] = []
            if (keyword != null) {
                ref = keyword.allReference;
            }
            else if (variable != null) {
                ref = variable.allReference;
            }
            return this.membersToArrOfLocation(ref);
            });
    }

    private membersToArrOfLocation(members:Member[]):Location[]{
        let result:Location[] = [];
        for(let i = 0; i < members.length; i++){
            result.push(members[i].location);
        }
        return result;
    }
}
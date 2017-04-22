'use strict';

import { RobotDoc } from '../../model/RobotDoc';
import { TextDocument, Position, Definition, DefinitionProvider, ProviderResult, CancellationToken } from 'vscode';

export class RobotDefinitionProvider implements DefinitionProvider {

    public provideDefinition(document: TextDocument, position: Position, token: CancellationToken)
        : Thenable<Definition> | ProviderResult<Definition> {
        return Promise.resolve().then(() => {
            let thisDoc = RobotDoc.parseDocument(document);
            let variable = thisDoc.getVariableByPosition(position);
            let keyword = thisDoc.getKeywordByPosition(position);
            if (keyword != null) {
                return keyword.location;
            }
            else if (variable != null) {
                return variable.location;
            }
            return null;
        });
    }
}
'use strict';

import { getVariableOrigin, getVariableByPosition } from '../../helper/VariableHelper';
import { TextDocument, Position, TextLine, Definition, DefinitionProvider, ProviderResult, CancellationToken } from 'vscode';
import { getKeywordByPosition, searchKeywordLocation, getKeywordOrigin } from '../../helper/KeywordHelper';
import { WorkspaceContext } from '../../WorkspaceContext';

export class RobotDefinitionProvider implements DefinitionProvider {

    public provideDefinition(document: TextDocument, position: Position, token: CancellationToken)
        : Thenable<Definition> | ProviderResult<Definition> {
        let args = {
            doc: document,
            pos: position
        }
        return Promise.resolve(args).then((args) => {
            let key = getKeywordByPosition(args.doc, args.pos);
            let variable = getVariableByPosition(args.doc, args.pos);
            if (key != null) {
                if (key.length == 2) {
                    return searchKeywordLocation(args.doc, key[0], key[1]);
                }
                else {
                    return getKeywordOrigin(args.doc, key[0]);
                }
            }
            else if (variable != null && variable != "") {
                return getVariableOrigin(document, variable);
            }
            return null;
        });
    }
}
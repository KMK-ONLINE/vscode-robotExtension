'use strict';
import { VariableHelper } from '../../helper/VariableHelper';
import vscode = require('vscode');
import { KeywordHelper } from '../../helper/KeywordHelper';
import { WorkspaceContext } from '../../WorkspaceContext';

export class RobotDefinitionProvider implements vscode.DefinitionProvider {

    public provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Thenable<vscode.Definition> | vscode.ProviderResult<vscode.Definition> {
        let args = {
            doc: document,
            pos: position
        }
        return Promise.resolve(args).then((args) => {
            let key = KeywordHelper.getKeywordByPosition(args.doc, args.pos);
            let variable = VariableHelper.getVariableByPosition(args.doc, args.pos);
            if (key != null) {
                if (key.length == 2) {
                    return KeywordHelper.getIncludedKeywordOrigin(args.doc, key[0], key[1]);
                }
                else {
                    return KeywordHelper.getKeywordOrigin(args.doc, key[0]);
                }
            }
            else if(variable != null && variable != ""){
                return VariableHelper.searchGlobalVarOrigin(document, variable);
            }
            return null;
        });
    }
}
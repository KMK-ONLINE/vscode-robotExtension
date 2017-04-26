'use strict'
import { WorkspaceContext } from '../../WorkspaceContext';

import { RobotDoc } from '../../model/RobotDoc';
import { TextDocument, Position, HoverProvider, ProviderResult, CancellationToken, Hover } from 'vscode';

export class RobotHoverProvider implements HoverProvider {
    public provideHover(document: TextDocument, position: Position, token: CancellationToken)
        : ProviderResult<Hover> {
        let thisDoc = WorkspaceContext.getDocumentByUri(document.uri)
        let variable = thisDoc.getVariableByPosition(position);
        let keyword = thisDoc.getKeywordByPosition(position);
        if (keyword != null) {
            let args = keyword.args;
            let ret = keyword.returnValue;
            let definition = "[ ARGS: ";
            if (args.length == 0 && ret == "") {
                definition = "Need no arguments and give no return value";
            }
            else {
                if (args.length > 0) {
                    for (let i = 0; i < args.length; i++) {
                        if (i == args.length - 1) {
                            definition += args[i];
                        }
                        else {
                            definition += args[i] + ", ";
                        }
                    }
                }
                else {
                    definition += "-"
                }
                if (ret == "") {
                    definition += " ] [ RET: - ]";
                }
                else {
                    definition += " ] [ RET: " + ret + " ]";
                }
            }
            return new Hover(definition, keyword.location.range);
        }
        else if (variable != null) {
            if (variable.value != null) {
                return new Hover(variable.value, variable.location.range);
            }
            return null;
        }
        return null;

    }
}
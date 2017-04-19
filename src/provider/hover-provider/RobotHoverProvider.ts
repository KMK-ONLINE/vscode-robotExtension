'use strict'

import { WorkspaceContext } from '../../WorkspaceContext';
import { TextDocument, Position, TextLine, HoverProvider, WorkspaceEdit, ProviderResult, CancellationToken, Location, Hover, Range } from 'vscode';
import { getKeywordByPosition, getKeywordOrigin, getKeywordDefinition } from '../../helper/KeywordHelper';
import { getVariableByPosition, getVariableDefinition, getVariableOrigin } from '../../helper/VariableHelper'

export class RobotHoverProvider implements HoverProvider {
    public provideHover(document: TextDocument, position: Position, token: CancellationToken)
        : ProviderResult<Hover> {
        let key = getKeywordByPosition(document, position);
        let variable = getVariableByPosition(document, position);
        if (key) {
            let keyword: string;
            if (key.length == 1) {
                keyword = key[0];
            }
            else {
                keyword = key[1];
            }
            let keyOriginLoc = getKeywordOrigin(document, keyword);
            if (keyOriginLoc != null) {
                let definition = getKeywordDefinition(keyOriginLoc);
                return RobotHoverProvider.createHover(
                    document.lineAt(position), keyword, position, definition
                );
            }
        }
        else if (variable) {
            let varOriginLoc = getVariableOrigin(document, variable);
            if (varOriginLoc != null) {
                let definition = getVariableDefinition(varOriginLoc);
                return RobotHoverProvider.createHover(
                    document.lineAt(position), variable, position, definition
                );
            }
        }
        return null;
    }

    private static createHover(line: TextLine, str: string, position: Position, definition: string)
        : Hover {
        let firstIndex = line.text.indexOf(
            str, position.character - str.length
        );
        let range = new Range(
            new Position(position.line, firstIndex), new Position(position.line, firstIndex + str.length)
        );
        return new Hover(definition, range);
    }
}
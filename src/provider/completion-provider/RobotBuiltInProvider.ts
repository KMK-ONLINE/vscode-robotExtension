'use strict';

import { TextDocument, Position, CompletionItemProvider, CompletionItemKind, CompletionItem, CancellationToken } from 'vscode';
import { subArrayOfString, stringArrayToCompletionItems } from '../../Util';

export class RobotBuiltInProvider implements CompletionItemProvider {

    private dictionary: string[] = [
        "*** Variable ***\n",
        "*** Settings ***\n",
        "*** Test Case ***\n",
        "*** Keywords ***\n",
    ];

    private fieldDictionary: string[] = [
        "Arguments",
        "Return"
    ];

    private controlDictionary: string[] = [
        "FOR        ${INDEX}        IN RANGE        ",
        "FOR       ${ELEMENT}        IN        @{",
    ]

    public provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken)
        : Thenable<CompletionItem[]> | CompletionItem[] {
        let char = document.lineAt(position).text.charAt(position.character - 1);
        if (char == "*") {
            let sub = position.character - document.lineAt(position).firstNonWhitespaceCharacterIndex;
            let res = subArrayOfString(this.dictionary, sub);
            return stringArrayToCompletionItems(res, CompletionItemKind.Field);
        }
        else if (char == "[") {
            return stringArrayToCompletionItems(this.fieldDictionary, CompletionItemKind.Field);
        }
        else {
            return stringArrayToCompletionItems(this.controlDictionary, CompletionItemKind.Snippet);
        }
    }
}
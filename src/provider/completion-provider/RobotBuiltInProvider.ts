'use strict';

import { TextDocument, Position, CompletionItemProvider, CompletionItemKind, CompletionItem, CancellationToken } from 'vscode';
import { subArrayOfString, stringArrayToCompletionItems } from '../../Util';

export class RobotBuiltInProvider implements CompletionItemProvider {

    private static dictionary: string[] = [
        "*** Variable ***\n",
        "*** Settings ***\n",
        "*** Test Case ***\n",
        "*** Keywords ***\n",
    ];

    private static fieldDictionary: string[] = [
        "Arguments",
        "Return"
    ];

    private static controlDictionary: string[] = [
        "FOR        ${INDEX}        IN RANGE        ",
        "FOR       ${ELEMENT}        IN        @{",
    ]

    public provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken)
        : Thenable<CompletionItem[]> | CompletionItem[] {
        let char = document.lineAt(position).text.charAt(position.character - 1);
        if (char == "*") {
            let sub = position.character - document.lineAt(position).firstNonWhitespaceCharacterIndex;
            let res = subArrayOfString(RobotBuiltInProvider.dictionary, sub);
            return stringArrayToCompletionItems(res, CompletionItemKind.Field);
        }
        else if (char == "[") {
            return stringArrayToCompletionItems(RobotBuiltInProvider.fieldDictionary, CompletionItemKind.Field);
        }
        else {
            return stringArrayToCompletionItems(RobotBuiltInProvider.controlDictionary, CompletionItemKind.Snippet);
        }
    }
}
'use strict';

import { TextDocument, Position, CompletionItemProvider, CompletionItemKind, CompletionItem, CancellationToken } from 'vscode';
import { subArrayOfString, stringArrayToCompletionItems, isInDocumentation } from '../../Util';

export class RobotBuiltInProvider implements CompletionItemProvider {

    private static dictionary: string[] = [
        "*** Variable ***\n",
        "*** Settings ***\n",
        "*** Test Case ***\n",
        "*** Keywords ***\n",
    ];

    private static fieldDictionary: string[] = [
        "Arguments",
        "Return",
        "Documentation"
    ];

    private static controlDictionary: string[] = [
        "FOR        ${INDEX}        IN RANGE        ",
        "FOR       ${ELEMENT}        IN        @{",
    ]

    public provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken)
        : Thenable<CompletionItem[]> | CompletionItem[] {
        let line = document.lineAt(position).text;
        if (!isInDocumentation(line)) {
            let char = line.charAt(position.character - 1);
            if (char == "*") {
                let sub = position.character - document.lineAt(position).firstNonWhitespaceCharacterIndex;
                let res = subArrayOfString(RobotBuiltInProvider.dictionary, sub);
                return stringArrayToCompletionItems(res, CompletionItemKind.Field);
            }
            else if (char == "[") {
                return stringArrayToCompletionItems(RobotBuiltInProvider.fieldDictionary, CompletionItemKind.Field);
            }
            else if (char == ":") {
                return stringArrayToCompletionItems(RobotBuiltInProvider.controlDictionary, CompletionItemKind.Snippet);
            }
        }
        return null;
    }
}
'use strict';

import vscode = require('vscode');
import { Util } from '../../Util';

export class RobotBuiltInProvider implements vscode.CompletionItemProvider {
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
    
    public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Thenable<vscode.CompletionItem[]> | vscode.CompletionItem[] {
        let char = document.lineAt(position).text.charAt(position.character-1);
        if (char == "*") {
            let sub = position.character - document.lineAt(position).firstNonWhitespaceCharacterIndex - 1;
            let res = Util.subArrayOfString(this.dictionary, sub);
            return Util.stringArrayToCompletionItems(res, vscode.CompletionItemKind.Field);
        }
        else if(char == "["){
            return Util.stringArrayToCompletionItems(this.fieldDictionary, vscode.CompletionItemKind.Field);
        }
        else{
            return Util.stringArrayToCompletionItems(this.controlDictionary, vscode.CompletionItemKind.Snippet);
        }
    }
}
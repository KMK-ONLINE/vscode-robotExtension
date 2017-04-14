'use strict';

import vscode = require('vscode');
import {Util} from './Util';

export class builtInCompletionProvider implements vscode.CompletionItemProvider{
    private dictionary:string[] = [
        "*** Variable ***\n",
        "*** Settings ***\n",
        "*** Test Case ***\n",
        "*** Keywords ***\n",
    ];

    private wordDictionary:string[] = [
        "Arguments",
        "Return"
    ]

    public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken):Thenable<vscode.CompletionItem[]> | vscode.CompletionItem[]{
        let firstChar = document.lineAt(position).text.charAt(0);
        if(firstChar == "*"){
            return Util.stringArrayToCompletionItems(this.dictionary);
        }
        else{
            return Util.stringArrayToCompletionItems(this.wordDictionary);
        }
    }
}
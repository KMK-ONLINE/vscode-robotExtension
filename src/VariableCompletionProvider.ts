'use strict';

import vscode = require('vscode');
import {File} from './File';
import {ResourceProvider} from './ResourceProvider';
import {Util} from './Util';

export class VariableCompletionProvider implements vscode.CompletionItemProvider{

    public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken):Thenable<vscode.CompletionItem[]> | vscode.CompletionItem[]{
        let line = document.lineAt(position);
        let matcher1 = line.text.match(/\$\{(\w*\s*[-_]*)\}/);
        let matcher2 = line.text.match(/(\$\{?(\w*\s*[-_]*))(\s+|$)/);
        if(matcher1){
            return Promise.resolve(Util.stringArrayToCompletionItems(VariableCompletionProvider.getVariablesNames(document, matcher1[1])));
        }
        else if(matcher2){
            return Promise.resolve(Util.stringArrayToCompletionItems(VariableCompletionProvider.getVariables(document, matcher2[2])));
        }
    }

    private static getVariablesNames(document:vscode.TextDocument, match:string):string[]{
        let included = ResourceProvider.allIncludedResources(document);
        let allVariablesNames = VariableCompletionProvider.allAvailableVariables(document, included);      
        let suggestionsString = Util.sentenceLikelyAnalyzer(match, Array.from(new Set(allVariablesNames)));
        return suggestionsString;
    }

    private static getVariables(document:vscode.TextDocument, match:string):string[]{
        let allVariablesNames = VariableCompletionProvider.getVariablesNames(document, match);
        let allVariables = VariableCompletionProvider.variablesFormatter(Array.from(new Set(allVariablesNames)));
        return allVariables;
    }

    private static allAvailableVariables(document:vscode.TextDocument, included:File[]):string[]{
        let allVar = VariableCompletionProvider.allVariablesSearcher(new File(document.fileName));
        for(let i = 0; i < included.length; i++){
            allVar = allVar.concat(VariableCompletionProvider.globalVariablesSearcher(included[i]));
        }
        return allVar;
    }

    private static globalVariablesSearcher(file:File):string[]{
        let variables:Set<string> = new Set();
        let isInVarRange = false;
        for(let i = 0; i < file.lineCount; i++){
            let line = file.lineAt(i);
            if(!isInVarRange){
                let match = line.match(/Set Global Variable\s{2,}\$\{([-_.]*\w+\s*)\}/);
                if(match){
                        variables.add(match[1]);
                }
                else{
                    isInVarRange = /^\*\*\*+\sVariable\s\*\*\*/.test(line)
                }
            }
            else{
                if(/^\*\*\*+\s[\w+\s?]+\s\*\*\*/.test(line)){
                    isInVarRange = false;
                }
                else{
                    let match = line.match(/^\$\{([-_.]*\w+\s*)\}/);
                    if(match){
                        variables.add(match[1]);
                    }
                }

            }
        }
        return Array.from(variables);
    }

    private static allVariablesSearcher(file:File):string[]{
        let variables:Set<string> = new Set();
        for(let i = 0; i < file.lineCount; i++){
            let line = file.lineAt(i);
            let match = line.match(/\$\{([-_.]*\w+\s*)\}/);
            if(match){
                variables.add(match[1]);
            }
        }
        return Array.from(variables);
    }

    private static variablesFormatter(varNames:string[]):string[]{
        let varFormat:string[] = [];
        for(let i = 0; i < varNames.length; i++){
            varFormat.push("${" + varNames[i] + "}");
        }
        return varFormat;
    }
}